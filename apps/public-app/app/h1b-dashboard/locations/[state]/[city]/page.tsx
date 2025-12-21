import { Metadata } from 'next';
import CityPageClient from './CityPageClient';
import { generateH1BMetadata } from '@docujourney/utils';

interface PageProps {
  params: Promise<{ state: string; city: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { state, city } = await params;
  const resolvedSearchParams = await searchParams;

  // Extract city and state from search params, fallback to path params
  const cityName = Array.isArray(resolvedSearchParams.city)
    ? resolvedSearchParams.city[0]
    : resolvedSearchParams.city || city.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    ).join(' ');

  const stateName = Array.isArray(resolvedSearchParams.state)
    ? resolvedSearchParams.state[0]
    : resolvedSearchParams.state || state.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    ).join(' ');

  const locationString = `${cityName}, ${stateName}`;

  return generateH1BMetadata({
    location: locationString,
  });
}

export default async function HierarchicalCityPage({ params, searchParams }: PageProps) {
  const { state, city } = await params;
  const resolvedSearchParams = await searchParams;

  const cityName = Array.isArray(resolvedSearchParams.city)
    ? resolvedSearchParams.city[0]
    : resolvedSearchParams.city || city.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    ).join(' ');

  const stateName = Array.isArray(resolvedSearchParams.state)
    ? resolvedSearchParams.state[0]
    : resolvedSearchParams.state || state.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    ).join(' ');

  const locationString = `${cityName}, ${stateName}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `H1B Visa Jobs in ${locationString}`,
    description: `H1B visa salary data and sponsorship opportunities in ${locationString}.`,
    spatialCoverage: locationString,
    creator: {
      '@type': 'Organization',
      name: 'Immigrant Central',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CityPageClient stateSlug={state} citySlug={city} />
    </>
  );
}