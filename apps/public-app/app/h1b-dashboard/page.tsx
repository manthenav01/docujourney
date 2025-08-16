import { Metadata } from 'next';
import { H1BDashboard } from '@/components/h1b-dashboard';
import { generateMetadata } from '@docujourney/utils';
import { H1BStructuredData } from '@/components/h1b-dashboard/H1BStructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'H1B Visa Dashboard - Comprehensive H1B Analytics & Immigration Data',
  description: 'Explore detailed H1B visa statistics, salary data, approval rates, and company analytics. Real-time H1B dashboard with comprehensive immigration data insights including H1B sponsors, salary ranges by location, job titles, and visa approval trends.',
  keywords: ['H1B dashboard', 'H1B visa data', 'immigration analytics', 'H1B salary data', 'visa statistics', 'H1B sponsors', 'immigration insights', 'H1B approval rates'],
  type: 'website',
  path: '/h1b-dashboard',
});

const H1BDashboardPage = () => {
  return (
    <>
      {/* SEO-optimized static content for crawlers */}
      <div className="sr-only">
        <h1>H1B Visa Dashboard - Comprehensive H1B Analytics & Immigration Data</h1>
        <p>
          Explore detailed H1B visa statistics, salary data, approval rates, and company analytics. 
          Real-time H1B dashboard with comprehensive immigration data insights including H1B sponsors, 
          salary ranges by location, job titles, and visa approval trends.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>H1B salary data analysis by company, location, and job title</li>
          <li>Visa approval rates and trending statistics</li>
          <li>Top H1B sponsoring companies and employers</li>
          <li>Geographic distribution of H1B applications</li>
          <li>Job market insights for international professionals</li>
          <li>Immigration attorney performance data</li>
        </ul>
        <h2>Data Coverage</h2>
        <p>
          Our H1B database includes comprehensive data from 2016-2025, covering over 2 million H1B applications,
          50,000+ companies, and 10,000+ job titles with real-time updates from official government sources.
        </p>
      </div>
      
      {/* Structured data for search engines */}
      <H1BStructuredData />
      
      {/* Interactive dashboard component */}
      <H1BDashboard />
    </>
  );
};

export default H1BDashboardPage;
