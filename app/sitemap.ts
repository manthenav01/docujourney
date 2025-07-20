import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://docujourney.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/h1b-dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Note: In a real implementation, you would fetch company data from your database
  // For now, we'll add some example company pages that would be dynamically generated
  const sampleCompanies = [
    'google',
    'microsoft',
    'amazon',
    'apple',
    'meta',
    'tesla',
    'netflix',
    'uber',
    'airbnb',
    'salesforce'
  ];

  const companyPages = sampleCompanies.map(company => ({
    url: `${baseUrl}/h1b-dashboard/company/${company}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...companyPages];
}