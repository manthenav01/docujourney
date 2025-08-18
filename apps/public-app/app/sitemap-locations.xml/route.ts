import { NextResponse } from 'next/server';

const US_STATES = [
  { name: 'California', code: 'CA', slug: 'california' },
  { name: 'Texas', code: 'TX', slug: 'texas' },
  { name: 'New York', code: 'NY', slug: 'new-york' },
  { name: 'Florida', code: 'FL', slug: 'florida' },
  { name: 'Illinois', code: 'IL', slug: 'illinois' },
  { name: 'Pennsylvania', code: 'PA', slug: 'pennsylvania' },
  { name: 'Ohio', code: 'OH', slug: 'ohio' },
  { name: 'Georgia', code: 'GA', slug: 'georgia' },
  { name: 'North Carolina', code: 'NC', slug: 'north-carolina' },
  { name: 'Michigan', code: 'MI', slug: 'michigan' },
  { name: 'New Jersey', code: 'NJ', slug: 'new-jersey' },
  { name: 'Virginia', code: 'VA', slug: 'virginia' },
  { name: 'Washington', code: 'WA', slug: 'washington' },
  { name: 'Arizona', code: 'AZ', slug: 'arizona' },
  { name: 'Massachusetts', code: 'MA', slug: 'massachusetts' },
  { name: 'Tennessee', code: 'TN', slug: 'tennessee' },
  { name: 'Indiana', code: 'IN', slug: 'indiana' },
  { name: 'Maryland', code: 'MD', slug: 'maryland' },
  { name: 'Missouri', code: 'MO', slug: 'missouri' },
  { name: 'Wisconsin', code: 'WI', slug: 'wisconsin' },
  { name: 'Colorado', code: 'CO', slug: 'colorado' },
  { name: 'Minnesota', code: 'MN', slug: 'minnesota' },
  { name: 'South Carolina', code: 'SC', slug: 'south-carolina' },
  { name: 'Alabama', code: 'AL', slug: 'alabama' },
  { name: 'Louisiana', code: 'LA', slug: 'louisiana' },
  { name: 'Kentucky', code: 'KY', slug: 'kentucky' },
  { name: 'Oregon', code: 'OR', slug: 'oregon' },
  { name: 'Oklahoma', code: 'OK', slug: 'oklahoma' },
  { name: 'Connecticut', code: 'CT', slug: 'connecticut' },
  { name: 'Utah', code: 'UT', slug: 'utah' },
];

const MAJOR_CITIES = [
  { city: 'New York', state: 'NY', stateSlug: 'new-york', citySlug: 'new-york' },
  { city: 'Los Angeles', state: 'CA', stateSlug: 'california', citySlug: 'los-angeles' },
  { city: 'Chicago', state: 'IL', stateSlug: 'illinois', citySlug: 'chicago' },
  { city: 'Houston', state: 'TX', stateSlug: 'texas', citySlug: 'houston' },
  { city: 'Phoenix', state: 'AZ', stateSlug: 'arizona', citySlug: 'phoenix' },
  { city: 'Philadelphia', state: 'PA', stateSlug: 'pennsylvania', citySlug: 'philadelphia' },
  { city: 'San Antonio', state: 'TX', stateSlug: 'texas', citySlug: 'san-antonio' },
  { city: 'San Diego', state: 'CA', stateSlug: 'california', citySlug: 'san-diego' },
  { city: 'Dallas', state: 'TX', stateSlug: 'texas', citySlug: 'dallas' },
  { city: 'San Jose', state: 'CA', stateSlug: 'california', citySlug: 'san-jose' },
  { city: 'Austin', state: 'TX', stateSlug: 'texas', citySlug: 'austin' },
  { city: 'San Francisco', state: 'CA', stateSlug: 'california', citySlug: 'san-francisco' },
  { city: 'Seattle', state: 'WA', stateSlug: 'washington', citySlug: 'seattle' },
  { city: 'Denver', state: 'CO', stateSlug: 'colorado', citySlug: 'denver' },
  { city: 'Boston', state: 'MA', stateSlug: 'massachusetts', citySlug: 'boston' },
  { city: 'Nashville', state: 'TN', stateSlug: 'tennessee', citySlug: 'nashville' },
  { city: 'Atlanta', state: 'GA', stateSlug: 'georgia', citySlug: 'atlanta' },
  { city: 'Miami', state: 'FL', stateSlug: 'florida', citySlug: 'miami' },
  { city: 'Portland', state: 'OR', stateSlug: 'oregon', citySlug: 'portland' },
  { city: 'Charlotte', state: 'NC', stateSlug: 'north-carolina', citySlug: 'charlotte' },
  { city: 'Raleigh', state: 'NC', stateSlug: 'north-carolina', citySlug: 'raleigh' },
  { city: 'Orlando', state: 'FL', stateSlug: 'florida', citySlug: 'orlando' },
  { city: 'Tampa', state: 'FL', stateSlug: 'florida', citySlug: 'tampa' },
  { city: 'Pittsburgh', state: 'PA', stateSlug: 'pennsylvania', citySlug: 'pittsburgh' },
  { city: 'Cincinnati', state: 'OH', stateSlug: 'ohio', citySlug: 'cincinnati' },
  { city: 'Sacramento', state: 'CA', stateSlug: 'california', citySlug: 'sacramento' },
  { city: 'Kansas City', state: 'MO', stateSlug: 'missouri', citySlug: 'kansas-city' },
  { city: 'Las Vegas', state: 'NV', stateSlug: 'nevada', citySlug: 'las-vegas' },
  { city: 'Columbus', state: 'OH', stateSlug: 'ohio', citySlug: 'columbus' },
  { city: 'Indianapolis', state: 'IN', stateSlug: 'indiana', citySlug: 'indianapolis' },
];

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  const currentDate = new Date().toISOString();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${US_STATES.map(state => `
  <url>
    <loc>${baseUrl}/h1b-dashboard/locations/${state.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${MAJOR_CITIES.map(city => `
  <url>
    <loc>${baseUrl}/h1b-dashboard/locations/${city.stateSlug}/${city.citySlug}</loc>
    <lastmod>${currentDate}</lastmod>
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