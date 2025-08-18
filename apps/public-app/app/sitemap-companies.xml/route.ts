import { NextResponse } from 'next/server';

async function fetchTopCompanies(): Promise<Array<{ name: string; slug: string }>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
    const response = await fetch(`${baseUrl}/api/h1b-data?category=topEmployers&limit=1000`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch companies:', response.status);
      return [];
    }
    
    const data = await response.json();
    return (data.data?.topEmployers || [])
      .filter((company: any) => company.employer_name && typeof company.employer_name === 'string')
      .map((company: any) => ({
        name: company.employer_name,
        slug: company.employer_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }));
  } catch (error) {
    console.error('Error fetching companies for sitemap:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  const companies = await fetchTopCompanies();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${companies.slice(0, 1000).map(company => `
  <url>
    <loc>${baseUrl}/h1b-dashboard/company/${company.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}