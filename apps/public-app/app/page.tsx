'use client';

import { H1BDashboard, DashboardLayout } from '@/components/h1b-dashboard';
import { generateStructuredData } from '@docujourney/utils';
import { useDynamicSEO } from '@/hooks/useDynamicSEO';
import { useEffect, Suspense } from 'react';

// Client component for dynamic SEO that handles SSR gracefully  
const DynamicSEOWrapper = () => {
  useDynamicSEO();
  return null;
};

const HomePage = () => {
  
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
    <DashboardLayout>
      {/* Dynamic SEO with Suspense boundary */}
      <Suspense fallback={null}>
        <DynamicSEOWrapper />
      </Suspense>

      {/* Hidden SEO content for search engines */}
      <div className="sr-only">
        <h1>H1B Data Analytics Platform - Real-Time Visa Salaries, Sponsors & Certification Rates</h1>
        <p>
          Comprehensive H1B visa database with real-time salary information, employer sponsorship data, 
          LCA certification rates, and immigration analytics. Search H1B sponsors, calculate prevailing wages by 
          job title and location, analyze visa trends, and explore millions of H1B applications.
        </p>
        <h2>H1B Salary Database</h2>
        <p>
          Access H1B salary data for software engineers, data scientists, financial analysts, 
          architects, and thousands of other job titles across all major US cities.
        </p>
        <h2>H1B Sponsoring Companies</h2>
        <p>
          Find H1B visa sponsors including Google, Microsoft, Amazon, Apple, Meta, JPMorgan Chase, 
          Deloitte, Accenture, and 50,000+ other employers with detailed approval statistics.
        </p>
      </div>

      {/* Interactive dashboard */}
      <H1BDashboard />
    </DashboardLayout>
  );
};

export default HomePage;