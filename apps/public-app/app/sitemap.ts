import { MetadataRoute } from 'next';
import { getAllPosts, getCategories } from '@/lib/blog/content';
import { BASE_METADATA } from '@docujourney/utils';

// Main sitemap: static pages + blog content only.
// Programmatic pages live in their own dedicated sitemaps so nothing is
// duplicated and each set can regenerate on its own schedule:
//   /sitemap-companies.xml  - top employer pages (from BigQuery)
//   /sitemap-jobs.xml       - top job title pages (from BigQuery)
//   /sitemap-locations.xml  - state and city pages
// All four are listed in /sitemap-index.xml and robots.txt.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_METADATA.url;

  let blogPosts: Awaited<ReturnType<typeof getAllPosts>> = [];
  let blogCategories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    [blogPosts, blogCategories] = await Promise.all([getAllPosts(), getCategories()]);
  } catch (error) {
    console.error('Error loading blog content for sitemap:', error);
  }

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
      url: `${baseUrl}/h1b-salary-calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/h1b-sponsors`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
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
      url: `${baseUrl}/h1b-dashboard/locations`,
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
    {
      url: `${baseUrl}/h1b-dashboard/directory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
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
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
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
  ];

  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map(category => ({
    url: `${baseUrl}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...blogPostPages,
    ...blogCategoryPages,
  ];
}
