import { MetadataRoute } from 'next';
import { getSEOSitemapEntries } from '@/lib/seoUrlGenerator';

async function fetchTopCompanies(): Promise<Array<{ name: string; slug: string }>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com'}/api/h1b-data?category=topEmployers&limit=1000`);
    if (!response.ok) {
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

async function fetchTopJobs(): Promise<Array<{ title: string; slug: string }>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com'}/api/h1b-data?category=topJobTitles&limit=500`);
    if (!response.ok) {
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

async function fetchTopCities(): Promise<Array<{ city: string; state: string; slug: string }>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com'}/api/h1b-data?category=stateDistribution&limit=200`);
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    // For now, we'll create a simplified city list based on states
    // In a real implementation, you'd want to fetch actual city data
    const majorCities = [
      { city: 'New York', state: 'NY' },
      { city: 'San Francisco', state: 'CA' },
      { city: 'Seattle', state: 'WA' },
      { city: 'Austin', state: 'TX' },
      { city: 'Boston', state: 'MA' },
      { city: 'Chicago', state: 'IL' },
      { city: 'Atlanta', state: 'GA' },
      { city: 'Denver', state: 'CO' },
      { city: 'Los Angeles', state: 'CA' },
      { city: 'San Jose', state: 'CA' },
      { city: 'Dallas', state: 'TX' },
      { city: 'Houston', state: 'TX' },
      { city: 'Miami', state: 'FL' },
      { city: 'Philadelphia', state: 'PA' },
      { city: 'Phoenix', state: 'AZ' },
      { city: 'Portland', state: 'OR' },
      { city: 'San Diego', state: 'CA' },
      { city: 'Washington', state: 'DC' },
      { city: 'Charlotte', state: 'NC' },
      { city: 'Raleigh', state: 'NC' },
    ];
    
    return majorCities.map(({ city, state }) => ({
      city,
      state,
      slug: city.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  } catch (error) {
    console.error('Error fetching cities for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  
  // Fetch data for dynamic pages
  const [topCompanies, topJobs, topCities] = await Promise.all([
    fetchTopCompanies(),
    fetchTopJobs(),
    fetchTopCities(),
  ]);
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/h1b-dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Category pages
    {
      url: `${baseUrl}/h1b-dashboard/employers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/h1b-dashboard/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/h1b-dashboard/cities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/h1b-dashboard/attorneys`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
  
  // Dynamic company pages
  const companyPages: MetadataRoute.Sitemap = topCompanies.map(company => ({
    url: `${baseUrl}/h1b-dashboard/company/${company.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Dynamic job pages
  const jobPages: MetadataRoute.Sitemap = topJobs.map(job => ({
    url: `${baseUrl}/h1b-dashboard/job/${job.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // Dynamic city pages
  const cityPages: MetadataRoute.Sitemap = topCities.map(city => ({
    url: `${baseUrl}/h1b-dashboard/city/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // High-value SEO URLs
  const seoPages = getSEOSitemapEntries();
  
  // Combine all pages
  return [
    ...staticPages,
    ...seoPages, // High-priority SEO URLs
    ...companyPages.slice(0, 1000), // Limit to top 1000 companies
    ...jobPages.slice(0, 500), // Limit to top 500 jobs
    ...cityPages.slice(0, 200), // Limit to top 200 cities
  ];
}