import dynamic from 'next/dynamic';
import { generateMetadata as generateMetadataUtil, generateStructuredData } from '@docujourney/utils';
import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = generateMetadataUtil({
  title: 'H1B Cities - Geographic Distribution & Location Analytics',
  description: 'Explore H1B data by city and state, geographic distribution patterns, cost of living comparisons, salary ranges by location, and comprehensive analytics for H1B opportunities across different metropolitan areas.',
  keywords: ['H1B cities', 'H1B locations', 'H1B geography', 'H1B by state', 'H1B location analytics', 'H1B metropolitan areas', 'H1B regional data'],
  path: '/h1b-dashboard/cities',
  type: 'article',
});

// Force dynamic rendering to prevent prerendering issues with useSearchParams
export const dynamicParams = true;
export const revalidate = 0;

const ContextualDashboard = dynamic(() => 
  import('@/components/h1b-dashboard/ContextualDashboard').then(mod => ({ default: mod.ContextualDashboard })),
  { loading: () => <div>Loading...</div> },
);

const CitiesPage = () => {
  return (
    <>
      <div className="sr-only">
        <h1>H1B Cities - Geographic Distribution & Location Analytics</h1>
        <p>
          Explore H1B data by city and state, geographic distribution patterns, 
          cost of living comparisons, salary ranges by location, and comprehensive 
          analytics for H1B opportunities across different metropolitan areas.
        </p>
      </div>
      <ContextualDashboard viewType="cities" />
    </>
  );
};

export default CitiesPage;