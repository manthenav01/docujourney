import { Metadata } from 'next';
import { H1BDashboard } from '@/components/h1b-dashboard';
import { generateMetadata } from '@docujourney/utils';
import { H1BStructuredData } from '@/components/h1b-dashboard/H1BStructuredData';

// This page renders the same dashboard as the homepage, so it canonicalizes
// to `/` (path: '') to consolidate ranking signals instead of competing with
// the homepage for the same queries. The URL keeps working for users and
// in-app links; only indexing is consolidated.
export const metadata: Metadata = generateMetadata({
  title: 'H1B Visa Dashboard - Comprehensive H1B Analytics & Immigration Data',
  description: 'Explore detailed H1B visa statistics, salary data, approval rates, and company analytics. Real-time H1B dashboard with comprehensive immigration data insights including H1B sponsors, salary ranges by location, job titles, and visa approval trends.',
  keywords: ['H1B dashboard', 'H1B visa data', 'immigration analytics', 'H1B salary data', 'visa statistics', 'H1B sponsors', 'immigration insights', 'H1B approval rates'],
  type: 'website',
  path: '',
});

const H1BDashboardPage = () => {
  return (
    <>
      {/* Structured data for search engines */}
      <H1BStructuredData />

      {/* Interactive dashboard component */}
      <H1BDashboard />
    </>
  );
};

export default H1BDashboardPage;
