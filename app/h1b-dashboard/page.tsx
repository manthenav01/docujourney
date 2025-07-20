'use client';

import { H1BDashboard } from '@/components/h1b-dashboard';
import { generateH1BMetadata, generateStructuredData } from '@/lib/seo';
import { useEffect } from 'react';

const H1BDashboardPage = () => {
  useEffect(() => {
    // Add structured data for H1B dashboard
    const structuredData = generateStructuredData('h1b-data');
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript && existingScript.textContent === JSON.stringify(structuredData)) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <>
      <div className="sr-only">
        <h1>H1B Visa Dashboard - Comprehensive H1B Analytics & Immigration Data</h1>
        <p>
          Explore detailed H1B visa statistics, salary data, approval rates, and company analytics. 
          Real-time H1B dashboard with comprehensive immigration data insights including H1B sponsors, 
          salary ranges by location, job titles, and visa approval trends.
        </p>
      </div>
      <H1BDashboard />
    </>
  );
};

export default H1BDashboardPage;
