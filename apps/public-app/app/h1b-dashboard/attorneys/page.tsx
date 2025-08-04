import dynamic from 'next/dynamic';
import { generateMetadata as generateMetadataUtil, generateStructuredData } from '@docujourney/utils';
import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = generateMetadataUtil({
  title: 'H1B Attorneys - Immigration Lawyers & Law Firm Analytics',
  description: 'Find H1B immigration attorneys and law firms, success rates, case analytics, attorney profiles, and comprehensive data about immigration legal services for H1B visa applications and processes.',
  keywords: ['H1B attorneys', 'immigration lawyers', 'H1B law firms', 'immigration attorneys', 'H1B legal services', 'visa attorneys', 'H1B attorney analytics'],
  path: '/h1b-dashboard/attorneys', 
  type: 'article',
});

// Force dynamic rendering to prevent prerendering issues with useSearchParams
export const dynamicParams = true;
export const revalidate = 0;

const ContextualDashboard = dynamic(() => 
  import('@/components/h1b-dashboard/ContextualDashboard').then(mod => ({ default: mod.ContextualDashboard })),
  { loading: () => <div>Loading...</div> },
);

const AttorneysPage = () => {
  return (
    <>
      <div className="sr-only">
        <h1>H1B Attorneys - Immigration Lawyers & Law Firm Analytics</h1>
        <p>
          Find H1B immigration attorneys and law firms, success rates, case analytics, 
          attorney profiles, and comprehensive data about immigration legal services 
          for H1B visa applications and processes.
        </p>
      </div>
      <ContextualDashboard viewType="attorneys" />
    </>
  );
};

export default AttorneysPage;