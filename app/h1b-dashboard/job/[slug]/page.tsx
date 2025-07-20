'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { JobDashboard } from '@/components/h1b-dashboard';
import { generateH1BMetadata, generateStructuredData } from '@/lib/seo';

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <JobPageClient slug={slug} />;
}

function JobPageClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('title') || 'Unknown Job';
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Update document title and meta description dynamically
    const cleanJobTitle = decodeURIComponent(jobTitle);
    document.title = `${cleanJobTitle} H1B Data - Salary & Employment Analytics | DocuJourney`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `Comprehensive H1B visa data for ${cleanJobTitle} positions. View salary ranges, top employers, geographic distribution, and job market trends. Latest H1B employment analytics.`,
      );
    }

    // Add job-specific structured data
    const structuredData = generateStructuredData('job', { 
      title: cleanJobTitle,
      slug: slug, 
    });
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Add breadcrumb structured data
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://docujourney.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'H1B Dashboard',
          item: 'https://docujourney.com/h1b-dashboard',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${cleanJobTitle} H1B Data`,
          item: `https://docujourney.com/h1b-dashboard/job/${slug}`,
        },
      ],
    };

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);

    setIsLoaded(true);

    return () => {
      // Cleanup scripts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes(cleanJobTitle)) {
          document.head.removeChild(script);
        }
      });
    };
  }, [jobTitle, slug]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading H1B data for {jobTitle}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO-optimized content for job page */}
      <div className="sr-only">
        <h1>{jobTitle} H1B Visa Job Data and Market Analytics</h1>
        <p>
          Comprehensive H1B visa job market data for {jobTitle} positions including salary ranges, 
          top employers, geographic distribution, employment trends, and career insights. 
          Explore detailed job market analytics for informed career decisions.
        </p>
        <div>
          <span>Keywords: {jobTitle} H1B, {jobTitle} visa jobs, {jobTitle} salary data, 
          {jobTitle} employment, H1B {jobTitle}, visa jobs {jobTitle}, job market {jobTitle}</span>
        </div>
      </div>
      
      {/* Breadcrumb navigation for SEO */}
      <nav aria-label="breadcrumb" className="bg-gray-50 px-6 py-3 border-b">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <a href="/" className="hover:text-blue-600">Home</a>
          </li>
          <li className="before:content-['/'] before:mx-2">/</li>
          <li>
            <a href="/h1b-dashboard" className="hover:text-blue-600">H1B Dashboard</a>
          </li>
          <li className="before:content-['/'] before:mx-2">/</li>
          <li className="text-gray-900 font-medium">{jobTitle} H1B Data</li>
        </ol>
      </nav>

      <JobDashboard 
        jobSlug={slug}
        jobTitle={jobTitle}
      />
    </>
  );
}