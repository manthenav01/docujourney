"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CompanyDashboard } from '@/components/h1b-dashboard';
import { generateH1BMetadata, generateStructuredData } from '@/lib/seo';

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <CompanyPageClient slug={slug} />;
}

function CompanyPageClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const companyName = searchParams.get('name') || 'Unknown Company';
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Update document title and meta description dynamically
    const cleanCompanyName = decodeURIComponent(companyName);
    document.title = `${cleanCompanyName} H1B Data - Visa Sponsorship & Salary Analytics | DocuJourney`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `Comprehensive H1B visa data for ${cleanCompanyName}. View salary ranges, approval rates, job titles, and sponsorship statistics. Latest H1B analytics and trends.`
      );
    }

    // Add company-specific structured data
    const structuredData = generateStructuredData('company', { 
      name: cleanCompanyName,
      slug: slug 
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
          item: 'https://docujourney.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'H1B Dashboard',
          item: 'https://docujourney.com/h1b-dashboard'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${cleanCompanyName} H1B Data`,
          item: `https://docujourney.com/h1b-dashboard/company/${slug}`
        }
      ]
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
        if (script.textContent?.includes(cleanCompanyName)) {
          document.head.removeChild(script);
        }
      });
    };
  }, [companyName, slug]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading H1B data for {companyName}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO-optimized content for company page */}
      <div className="sr-only">
        <h1>{companyName} H1B Visa Sponsorship Data and Analytics</h1>
        <p>
          Comprehensive H1B visa data for {companyName} including salary ranges, approval rates, 
          job titles, locations, and historical sponsorship trends. Explore detailed immigration 
          analytics and make informed career decisions.
        </p>
        <div>
          <span>Keywords: {companyName} H1B, {companyName} visa sponsorship, {companyName} salary data, 
          {companyName} immigration, H1B jobs {companyName}, visa statistics {companyName}</span>
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
          <li className="text-gray-900 font-medium">{companyName} H1B Data</li>
        </ol>
      </nav>

      <CompanyDashboard 
        companySlug={slug}
        companyName={companyName}
      />
    </>
  );
}
