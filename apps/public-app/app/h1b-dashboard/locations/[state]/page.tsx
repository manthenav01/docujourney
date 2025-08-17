import { Metadata } from 'next';
import StatePageClient from './StatePageClient';

interface PageProps {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  
  // Convert slug back to proper state name
  const stateName = state.replace(/-/g, ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  ).join(' ');
  
  const title = `H1B Jobs in ${stateName} 2025 | Visa Sponsors & Salary Data by State`;
  const description = `H1B visa jobs and sponsoring companies in ${stateName}. View salary ranges, top employers, approval rates, and visa sponsorship opportunities across all cities in ${stateName}. Comprehensive H1B data for ${stateName}.`;
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usimmigrantcentral.com';
  const canonicalUrl = `${baseUrl}/h1b-dashboard/locations/${state}`;
  
  return {
    title,
    description,
    keywords: [
      `H1B ${stateName}`,
      `${stateName} H1B jobs`,
      `${stateName} visa sponsors`,
      `${stateName} H1B salary`,
      `H1B companies ${stateName}`,
      `${stateName} visa jobs`,
      'H1B sponsorship',
      'visa job opportunities',
      'H1B employer data',
      'state H1B analytics',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Immigrant Central',
      images: [
        {
          url: `${baseUrl}/api/og?type=state&state=${encodeURIComponent(stateName)}`,
          width: 1200,
          height: 630,
          alt: `H1B Jobs and Visa Sponsors in ${stateName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?type=state&state=${encodeURIComponent(stateName)}`],
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

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  
  return <StatePageClient stateSlug={state} />;
}