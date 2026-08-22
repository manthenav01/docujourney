import { Metadata } from 'next';
import CityPageClient from './CityPageClient';
import { generateH1BMetadata, slugToDisplayName, BASE_METADATA } from '@docujourney/utils';

// ISR: location aggregates change only when new quarterly DOL data lands.
// Names derive from path params only — reading searchParams here would force
// dynamic rendering and break caching for crawlers. The client component still
// honors ?city=&state= overrides from in-app navigation.
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ state: string; city: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city } = await params;
  const locationString = `${slugToDisplayName(city)}, ${slugToDisplayName(state)}`;

  return generateH1BMetadata({
    location: locationString,
    path: `/h1b-dashboard/locations/${state}/${city}`,
  });
}

export default async function HierarchicalCityPage({ params }: PageProps) {
  const { state, city } = await params;
  const cityName = slugToDisplayName(city);
  const stateName = slugToDisplayName(state);
  const locationString = `${cityName}, ${stateName}`;
  const pageUrl = `${BASE_METADATA.url}/h1b-dashboard/locations/${state}/${city}`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `H1B Visa Jobs in ${locationString}`,
      description: `H1B visa salary data and sponsorship opportunities in ${locationString}.`,
      url: pageUrl,
      isAccessibleForFree: true,
      spatialCoverage: locationString,
      license: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
      creator: {
        '@type': 'Organization',
        name: 'Immigrant Central',
        url: BASE_METADATA.url,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_METADATA.url },
        { '@type': 'ListItem', position: 2, name: 'H1B Locations', item: `${BASE_METADATA.url}/h1b-dashboard/locations` },
        { '@type': 'ListItem', position: 3, name: stateName, item: `${BASE_METADATA.url}/h1b-dashboard/locations/${state}` },
        { '@type': 'ListItem', position: 4, name: cityName, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      {structuredData.map((sd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
        />
      ))}
      <CityPageClient stateSlug={state} citySlug={city} />
    </>
  );
}
