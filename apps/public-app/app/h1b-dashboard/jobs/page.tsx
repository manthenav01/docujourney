import dynamic from 'next/dynamic';
import { generateMetadata as generateMetadataUtil, generateStructuredData } from '@docujourney/utils';
import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = generateMetadataUtil({
  title: 'H1B Jobs - Job Titles, Salaries & Career Analytics',
  description: 'Discover H1B job opportunities, salary ranges by job title, popular positions, career trends, and detailed analytics for H1B jobs across different industries, skill levels, and geographic locations.',
  keywords: ['H1B jobs', 'H1B job titles', 'H1B salaries', 'H1B careers', 'H1B job analytics', 'popular H1B jobs', 'H1B job opportunities'],
  path: '/h1b-dashboard/jobs',
  type: 'article',
});

// Force dynamic rendering to prevent prerendering issues with useSearchParams
export const dynamicParams = true;
export const revalidate = 0;

const ContextualDashboard = dynamic(() => 
  import('@/components/h1b-dashboard/ContextualDashboard').then(mod => ({ default: mod.ContextualDashboard })),
  { loading: () => <div>Loading...</div> },
);

const JobsPage = () => {
  return (
    <>
      <div className="sr-only">
        <h1>H1B Jobs - Job Titles, Salaries & Career Analytics</h1>
        <p>
          Discover H1B job opportunities, salary ranges by job title, popular positions, 
          career trends, and detailed analytics for H1B jobs across different industries, 
          skill levels, and geographic locations.
        </p>
      </div>
      <ContextualDashboard viewType="jobs" />
    </>
  );
};

export default JobsPage;