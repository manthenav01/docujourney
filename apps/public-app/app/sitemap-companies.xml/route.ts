import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';
import { BASE_METADATA } from '@docujourney/utils';

// Regenerate at most once a day — employer rankings only move when new
// quarterly DOL disclosure data is loaded.
export const revalidate = 86400;

const COMPANY_LIMIT = 1000;

// Queries BigQuery directly instead of self-fetching /api/h1b-data, which
// ignored the category/limit params and returned employers under a different
// field name — leaving this sitemap permanently empty.
async function fetchTopCompanySlugs(): Promise<string[]> {
  try {
    const bigquery = new BigQuery({
      projectId: bigQueryConfig.projectId,
      credentials: bigQueryConfig.credentials,
    });

    const query = `
      SELECT
        REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM(employer_name)), r'[^a-z0-9]+', '-'), r'^-+|-+$', '') as slug,
        COUNT(*) as applications
      FROM \`${bigQueryConfig.projectId}.${bigQueryConfig.datasetId}.${bigQueryConfig.tableId}\`
      WHERE employer_name IS NOT NULL
        AND TRIM(employer_name) != ''
        AND employer_name != 'N/A'
      GROUP BY slug
      HAVING slug != ''
      ORDER BY applications DESC
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
