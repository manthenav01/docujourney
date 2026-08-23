import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';
import { BASE_METADATA } from '@docujourney/utils';

// Regenerate at most once a day — employer rankings only move when new
// quarterly DOL disclosure data is loaded.
export const revalidate = 86400;

// Every employer with a handful of filings, not just the top 1000: the site
// advertises 50,000+ sponsors but only sitemap-listed pages get crawled
// reliably. The threshold keeps one-off/noise employers out; 20k stays well
// under the 50k-URL sitemap limit. Reads the pre-built aggregate table
// (kilobytes) instead of scanning the 3GB raw table.
const COMPANY_LIMIT = 20000;
const MIN_APPLICATIONS = 3;

async function fetchTopCompanySlugs(): Promise<string[]> {
  try {
    const bigquery = new BigQuery({
      projectId: bigQueryConfig.projectId,
      credentials: bigQueryConfig.credentials,
    });

    const query = `
      SELECT slug
      FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.agg_company_summary\`
      WHERE total_applications >= ${MIN_APPLICATIONS}
      ORDER BY total_applications DESC
      LIMIT ${COMPANY_LIMIT}
    `;

    const [rows] = await bigquery.query({ query });
    return rows.map((row: any) => row.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching companies for sitemap:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = BASE_METADATA.url;
  const slugs = await fetchTopCompanySlugs();
  const lastmod = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${slugs.map(slug => `
  <url>
    <loc>${baseUrl}/h1b-dashboard/company/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      // Serve stale on BigQuery hiccups rather than an empty sitemap
      'Cache-Control': slugs.length > 0
        ? 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
        : 'no-store',
    },
  });
}
