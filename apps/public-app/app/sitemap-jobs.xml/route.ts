import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';
import { BASE_METADATA } from '@docujourney/utils';

// Regenerate at most once a day — job title rankings only move when new
// quarterly DOL disclosure data is loaded.
export const revalidate = 2592000; // 30 days

// Every job title with real volume, not just the top 1000 (see
// sitemap-companies.xml). Reads the pre-built aggregate table, whose slugs
// already have internal job codes stripped; the threshold keeps noisy
// one-off titles out of the index.
const JOB_LIMIT = 10000;
const MIN_APPLICATIONS = 5;

async function fetchTopJobSlugs(): Promise<string[]> {
  try {
    const bigquery = new BigQuery({
      projectId: bigQueryConfig.projectId,
      credentials: bigQueryConfig.credentials,
    });

    const query = `
      SELECT slug
      FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.agg_job_summary\`
      WHERE total_applications >= ${MIN_APPLICATIONS}
      ORDER BY total_applications DESC
      LIMIT ${JOB_LIMIT}
    `;

    const [rows] = await bigquery.query({ query });
    return rows.map((row: any) => row.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = BASE_METADATA.url;
  const slugs = await fetchTopJobSlugs();
  const lastmod = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${slugs.map(slug => `
  <url>
    <loc>${baseUrl}/h1b-dashboard/job/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
