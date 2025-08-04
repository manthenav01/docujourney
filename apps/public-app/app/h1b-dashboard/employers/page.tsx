import dynamic from 'next/dynamic';
import { generateMetadata as generateMetadataUtil, generateStructuredData } from '@docujourney/utils';
import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = generateMetadataUtil({
  title: 'H1B Employers - Top H1B Sponsors & Company Analytics',
  description: 'Explore comprehensive H1B employer data including top sponsors, company profiles, salary ranges by employer, approval rates, and detailed analytics for H1B companies across different industries and locations.',
  keywords: ['H1B employers', 'H1B sponsors', 'H1B companies', 'H1B sponsorship data', 'H1B employer analytics', 'top H1B employers', 'H1B company data'],
  path: '/h1b-dashboard/employers',
  type: 'article',
});

// Force dynamic rendering to prevent prerendering issues with useSearchParams
export const dynamicParams = true;
export const revalidate = 0;

const ContextualDashboard = dynamic(() => 
  import('@/components/h1b-dashboard/ContextualDashboard').then(mod => ({ default: mod.ContextualDashboard })),
  { loading: () => <div>Loading...</div> },
);

const EmployersPage = () => {
  return (
    <>
      <div className="sr-only">
        <h1>H1B Employers - Top H1B Sponsors & Company Analytics</h1>
        <p>
          Explore comprehensive H1B employer data including top sponsors, company profiles, 
          salary ranges by employer, approval rates, and detailed analytics for H1B companies 
          across different industries and locations.
        </p>
      </div>
      <ContextualDashboard viewType="employers" />
    </>
  );
};

export default EmployersPage;