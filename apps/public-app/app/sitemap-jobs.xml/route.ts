import { NextResponse } from 'next/server';

async function fetchTopJobs(): Promise<Array<{ title: string; slug: string }>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
    const response = await fetch(`${baseUrl}/api/h1b-data?category=topJobTitles&limit=500`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch jobs:', response.status);
      return [];
    }
    
    const data = await response.json();
    return (data.data?.topJobTitles || [])
      .filter((job: any) => job.job_title && typeof job.job_title === 'string')
      .map((job: any) => ({
        title: job.job_title,
        slug: job.job_title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }));
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
    return [];
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  const jobs = await fetchTopJobs();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${jobs.slice(0, 500).map(job => `
  <url>
    <loc>${baseUrl}/h1b-dashboard/job/${job.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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