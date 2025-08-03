import { Metadata } from 'next';
import CityPageClient from './CityPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Extract city and state from search params
  const cityName = Array.isArray(resolvedSearchParams.city) 
    ? resolvedSearchParams.city[0] 
    : resolvedSearchParams.city || slug.replace(/-/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      ).join(' ');
  
  const stateName = Array.isArray(resolvedSearchParams.state) 
    ? resolvedSearchParams.state[0] 
    : resolvedSearchParams.state || '';
  
  const locationString = stateName ? `${cityName}, ${stateName}` : cityName;
  
  const title = `H1B Jobs in ${locationString} 2025 | Visa Sponsors & Salary Data`;
  const description = `H1B visa jobs and sponsoring companies in ${locationString}. View salary ranges, top employers, approval rates, and visa sponsorship opportunities in ${cityName}. Comprehensive H1B data for ${locationString}.`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  const canonicalUrl = `${baseUrl}/h1b-dashboard/city/${slug}`;
  
  return {
    title,
    description,
    keywords: [
      `H1B ${cityName}`,
      `${cityName} H1B jobs`,
      `${cityName} visa sponsors`,
      `${cityName} H1B salary`,
      `H1B companies ${cityName}`,
      `${locationString} visa jobs`,
      'H1B sponsorship',
      'visa job opportunities',
      'H1B employer data',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Immigrant Central',
      images: [
        {
          url: `${baseUrl}/api/og?type=city&city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`,
          width: 1200,
          height: 630,
          alt: `H1B Jobs and Visa Sponsors in ${locationString}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?type=city&city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`],
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

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <CityPageClient slug={slug} />;
}