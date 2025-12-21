import { Metadata } from 'next';
import JobPageClient from './JobPageClient';
import { generateH1BMetadata } from '@docujourney/utils';

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

  return generateH1BMetadata({
    jobTitle,
  });
}

// Force dynamic rendering to support all job titles
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function JobPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Extract job title (same logic as metadata)
  const jobTitle = Array.isArray(resolvedSearchParams.title)
    ? resolvedSearchParams.title[0]
    : resolvedSearchParams.title || slug.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    ).join(' ');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${jobTitle} H1B Salary Data`,
    description: `H1B visa salary information and sponsorship statistics for ${jobTitle} positions.`,
    creator: {
      '@type': 'Organization',
      name: 'Immigrant Central',
    },
    variableMeasured: ['Salary', 'Visa Status', 'Employer'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <JobPageClient slug={slug} />
    </>
  );
}