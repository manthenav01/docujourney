import { Metadata } from 'next';
import JobPageClient from './JobPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Extract job title from search params
  const jobTitle = Array.isArray(resolvedSearchParams.title) 
    ? resolvedSearchParams.title[0] 
    : resolvedSearchParams.title || slug.replace(/-/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      ).join(' ');
  
  const title = `${jobTitle} H1B Salary Data 2025 | Visa Sponsorship & Requirements`;
  const description = `${jobTitle} H1B visa salary information and sponsorship data. Average salary ranges, top sponsoring companies, approval rates, and visa requirements for ${jobTitle} positions in the USA.`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  const canonicalUrl = `${baseUrl}/h1b-dashboard/job/${slug}`;
  
  return {
    title,
    description,
    keywords: [
      `${jobTitle} H1B salary`,
      `${jobTitle} visa sponsorship`,
      `${jobTitle} H1B requirements`,
      `${jobTitle} visa jobs`,
      `${jobTitle} H1B sponsors`,
      'H1B salary data',
      'visa sponsorship jobs',
      'H1B job requirements',
      'immigration job data',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Immigrant Central',
      images: [
        {
          url: `${baseUrl}/api/og?type=job&title=${encodeURIComponent(jobTitle)}`,
          width: 1200,
          height: 630,
          alt: `${jobTitle} H1B Salary and Sponsorship Data`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?type=job&title=${encodeURIComponent(jobTitle)}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate static paths for Top Paying Job Titles (helps with indexing)
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com'}/api/h1b-data?category=topJobTitles&limit=100`);
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const jobs = data.data?.topJobTitles || [];
    
    return jobs
      .filter((job: any) => job.job_title && typeof job.job_title === 'string')
      .slice(0, 50) // Generate static pages for top 50 job titles
      .map((job: any) => ({
        slug: job.job_title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }));
  } catch (error) {
    console.error('Error generating static params for jobs:', error);
    return [];
  }
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <JobPageClient slug={slug} />;
}