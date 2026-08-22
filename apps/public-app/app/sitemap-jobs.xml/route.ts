import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';
import { BASE_METADATA } from '@docujourney/utils';

// Regenerate at most once a day — job title rankings only move when new
// quarterly DOL disclosure data is loaded.
export const revalidate = 86400;

const JOB_LIMIT = 1000;

// Queries BigQuery directly instead of self-fetching /api/h1b-data with an
// unsupported "category=topJobTitles" param, which left this sitemap
// permanently empty. Job codes appended to titles (" - JC-123") are stripped
// the same way the dashboard service does.
async function fetchTopJobSlugs(): Promise<string[]> {
  try {
    const bigquery = new BigQuery({
      projectId: bigQueryConfig.projectId,
      credentials: bigQueryConfig.credentials,
    });

    const query = `
      SELECT
        REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM(REGEXP_REPLACE(job_title, r' - [A-Z0-9]+-[0-9]+$', ''))), r'[^a-z0-9]+', '-'), r'^-+|-+$', '') as slug,
        COUNT(*) as applications
      FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.${bigQueryConfig.tableId}\`
      WHERE job_title IS NOT NULL
        AND TRIM(job_title) != ''
      GROUP BY slug
      HAVING slug != ''
      ORDER BY applications DESC
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
