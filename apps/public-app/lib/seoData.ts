import { cache } from 'react';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';
import { getCompanyPayload, getJobPayload, getAllStatePayloads } from '@/lib/aggEntities';
import { MAX_BYTES_AGG } from '@/lib/bqCache';

// Server-side data for SEO pages, read from the pre-built aggregate tables
// (scripts/build_aggregates.py) via the shard-batched data cache in
// aggEntities — a slug lookup costs a data-cache read, and BigQuery is only
// touched when a whole shard (~1000 entities) is cold.
//
// Shared between generateMetadata() and the page body via React cache() so
// each request runs at most one lookup per entity.
//
// Entity lookups distinguish two "no data" cases so pages can 404 correctly:
//   { data: null, lookupFailed: false } — the query ran and the slug does not
//     exist. The page must call notFound(): otherwise any invented slug
//     renders an indexable page (soft-404, infinite URL space).
//   { data: null, lookupFailed: true }  — BigQuery errored. Pages render the
//     client-side dashboard fallback rather than 404ing real content.

export interface CompanySEOSummary {
  name: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  uniqueJobTitles: number;
  topStates: Array<{ state: string; applications: number }>;
  topJobTitles: Array<{ jobTitle: string; applications: number; avgSalary: number }>;
}

export interface JobSEOSummary {
  title: string;
  totalApplications: number;
  certifiedApplications: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  uniqueEmployers: number;
  topStates: Array<{ state: string; applications: number }>;
  topEmployers: Array<{ employer: string; applications: number; avgSalary: number }>;
}

function client(): BigQuery {
  return new BigQuery({
    projectId: bigQueryConfig.projectId,
    credentials: bigQueryConfig.credentials,
  });
}

const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));

export interface SEOLookup<T> {
  data: T | null;
  lookupFailed: boolean;
}

export const getCompanySEOData = cache(
  async (slug: string): Promise<SEOLookup<CompanySEOSummary>> => {
    try {
      const p = await getCompanyPayload(slug);
      if (!p || !num(p.totalApplications)) {return { data: null, lookupFailed: false };}
      const data: CompanySEOSummary = {
        name: p.name,
        totalApplications: num(p.totalApplications),
        certifiedApplications: num(p.certifiedApplications),
        avgSalary: num(p.avgSalary),
        medianSalary: num(p.medianSalary),
        minSalary: num(p.minSalary),
        maxSalary: num(p.maxSalary),
        uniqueJobTitles: num(p.uniqueJobTitles),
        topStates: (p.topStates || []).map((s: any) => ({ state: s.state, applications: num(s.applications) })),
        topJobTitles: (p.topJobTitlesByVolume || []).map((t: any) => ({
          jobTitle: t.job_title, applications: num(t.applications), avgSalary: num(t.avg_salary),
        })),
      };
      return { data, lookupFailed: false };
    } catch (error) {
      console.error('SEO data fetch failed for company slug:', slug, error);
      return { data: null, lookupFailed: true };
    }
  },
);

export const getJobSEOData = cache(
  async (slug: string): Promise<SEOLookup<JobSEOSummary>> => {
    try {
      const p = await getJobPayload(slug);
      if (!p || !num(p.totalApplications)) {return { data: null, lookupFailed: false };}
      const data: JobSEOSummary = {
        title: p.title,
        totalApplications: num(p.totalApplications),
        certifiedApplications: num(p.certifiedApplications),
        avgSalary: num(p.avgSalary),
        medianSalary: num(p.medianSalary),
        minSalary: num(p.minSalary),
        maxSalary: num(p.maxSalary),
        uniqueEmployers: num(p.uniqueEmployers),
        topStates: (p.topStates || []).map((s: any) => ({ state: s.state, applications: num(s.applications) })),
        topEmployers: (p.topEmployers || []).map((e: any) => ({
          employer: e.employer, applications: num(e.applications), avgSalary: num(e.avgSalary),
        })),
      };
      return { data, lookupFailed: false };
    } catch (error) {
      console.error('SEO data fetch failed for job slug:', slug, error);
      return { data: null, lookupFailed: true };
    }
  },
);

// Top entity slugs, used by generateStaticParams to prebuild the head of
// each page type at deploy time. Fails soft to [] (pages fall back to ISR).
export async function getTopSlugs(
  table: 'agg_company_summary' | 'agg_job_summary',
  limit: number,
): Promise<string[]> {
  try {
    const [rows] = await client().query({
      query: `
        SELECT slug FROM \`${bigQueryConfig.projectId}.h1b_data.${table}\`
        ORDER BY total_applications DESC LIMIT ${Math.min(limit, 1000)}`,
      maximumBytesBilled: MAX_BYTES_AGG,
    });
    return rows.map((r: any) => r.slug).filter(Boolean);
  } catch (error) {
    console.error('getTopSlugs failed for', table, error);
    return [];
  }
}

export interface StateSEOSummary {
  state: string;            // two-letter code
  applications: number;
  certifiedApplications: number;
  avgSalary: number;
}

// All states with filing counts, for the locations directory page.
// Served from agg_state_summary via the cached whole-table fetch.
export const getStateSEOData = cache(
  async (): Promise<StateSEOSummary[]> => {
    try {
      const payloads = await getAllStatePayloads();
      return payloads
        .map((p: any) => ({
          state: p.state,
          applications: num(p.totalApplications),
          certifiedApplications: num(p.certifiedApplications),
          avgSalary: num(p.seoAvgSalary),
        }))
        .sort((a, b) => b.applications - a.applications);
    } catch (error) {
      console.error('SEO data fetch failed for states:', error);
      return [];
    }
  },
);

export function approvalRate(total: number, certified: number): number {
  if (!total) {return 0;}
  return (certified / total) * 100;
}

// The raw wage data contains unit-conversion artifacts (e.g. annual salaries
// recorded as hourly and multiplied by 2080, producing $400M+ "salaries").
// Never let those reach titles, descriptions, or visible SEO copy.
export function saneSalary(value?: number): number | undefined {
  return value && value >= 15_000 && value <= 1_500_000 ? value : undefined;
}

const NOISY_TITLE = /\d{3,}/; // internal codes appended to titles, e.g. "... 1615.60770"

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, c => c.toUpperCase());
}

// Roles for display copy: drop titles with internal codes or single filings.
// Aggregate rows are already ranked by application volume.
export function cleanTopRoles(
  titles: Array<{ jobTitle?: string; title?: string; applications?: number }> | undefined,
  count: number,
): string[] {
  return (titles || [])
    .filter(t => {
      const name = t.jobTitle || t.title;
      return name && !NOISY_TITLE.test(name) && (t.applications ?? 0) >= 2;
    })
    .slice(0, count)
    .map(t => toTitleCase((t.jobTitle || t.title) as string));
}
