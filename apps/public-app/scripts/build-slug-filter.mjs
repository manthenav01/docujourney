#!/usr/bin/env node
// Builds the edge slug filter used by middleware.ts.
//
// Middleware answers "could this slug exist?" without a network call, so
// invented URLs are rejected at the edge instead of being rendered — and
// every rendered page, 404 included, costs a billed Vercel ISR write. The
// filter has no false negatives, so real pages can never be rejected.
//
// Fails soft: any problem writes the disabled placeholder, and middleware
// passes everything through exactly as it did before the filter existed.

import { BigQuery } from '@google-cloud/bigquery';
import { writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { bloomAdd } from '../lib/slug-filter/bloom.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'lib', 'slug-filter', 'data.ts');
const PLACEHOLDER = join(HERE, '..', 'lib', 'slug-filter', 'data.placeholder.ts');

// 384 KB of bits -> ~512 KB of base64 in the middleware bundle, comfortably
// inside Vercel's 1 MB edge limit. Above ~8 bits/entry the accuracy gain stops
// being worth the bytes, so the cap and the ratio both bound the size.
const MAX_BYTES = 384 * 1024;
const MAX_BITS_PER_ENTRY = 8;

function credentials() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (json) return JSON.parse(json);

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  if (projectId && privateKey && clientEmail) {
    return {
      type: 'service_account',
      project_id: projectId.trim(),
      private_key: privateKey.replace(/\\n/g, '\n').trim(),
      client_email: clientEmail.trim(),
    };
  }
  // Undefined => Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS).
  return undefined;
}

async function fallback(reason) {
  console.warn(`[slug-filter] ${reason} — middleware will pass all slugs through.`);
  await copyFile(PLACEHOLDER, OUT);
}

async function main() {
  const projectId = (process.env.GOOGLE_CLOUD_PROJECT_ID || 'immigrant-central').trim();
  const datasetId = (process.env.BIGQUERY_DATASET_ID || 'h1b_data').trim();

  const bigquery = new BigQuery({ projectId, credentials: credentials() });

  // One scan of two small aggregate tables (slug column only), not the raw
  // 3 GB table. Companies and jobs share a filter: middleware knows which
  // route it is on, but a single bit array is simpler and the namespaces are
  // prefixed below to keep them from bleeding into each other.
  const [rows] = await bigquery.query({
    query: `
      SELECT 'c' AS kind, slug FROM \`${projectId}.${datasetId}.agg_company_summary\`
      WHERE slug IS NOT NULL AND slug != ''
      UNION ALL
      SELECT 'j' AS kind, slug FROM \`${projectId}.${datasetId}.agg_job_summary\`
      WHERE slug IS NOT NULL AND slug != ''
    `,
  });

  if (!rows.length) throw new Error('aggregate tables returned no slugs');

  const n = rows.length;
  const bits = Math.min(MAX_BYTES * 8, n * MAX_BITS_PER_ENTRY);
  const m = Math.floor(bits / 8) * 8; // whole bytes
  const k = Math.max(1, Math.min(6, Math.round((m / n) * Math.LN2)));

  const bytes = new Uint8Array(m / 8);
  let companies = 0;
  let jobs = 0;
  for (const row of rows) {
    // Namespaced so a company slug cannot vouch for a job slug of the same name.
    bloomAdd(bytes, `${row.kind}:${row.slug}`, m, k);
    if (row.kind === 'c') companies++; else jobs++;
  }

  const fpr = Math.pow(1 - Math.exp((-k * n) / m), k);
  const payload = {
    enabled: true,
    m,
    k,
    bits: Buffer.from(bytes).toString('base64'),
    companies,
    jobs,
    falsePositiveRate: Number(fpr.toFixed(4)),
    builtAt: new Date().toISOString(),
  };

  await writeFile(
    OUT,
    '// GENERATED FILE — do not edit and do not commit the populated version.\n' +
    '// Rebuilt by scripts/build-slug-filter.mjs on every prebuild/predev; see\n' +
    '// data.placeholder.ts for the credential-less fallback.\n' +
    "import type { SlugFilter } from './types';\n\n" +
    `export const SLUG_FILTER: SlugFilter = ${JSON.stringify(payload)};\n`,
  );

  console.log(
    `[slug-filter] ${n} slugs (${companies} companies, ${jobs} jobs) -> ` +
    `${(m / 8 / 1024).toFixed(0)} KB, k=${k}, ~${(fpr * 100).toFixed(1)}% false positives ` +
    `(${((1 - fpr) * 100).toFixed(1)}% of invented URLs rejected at the edge).`,
  );
}

main().catch((error) => fallback(error.message));
