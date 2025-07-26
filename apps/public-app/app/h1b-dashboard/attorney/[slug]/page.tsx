'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AttorneyDashboard } from '@/components/h1b-dashboard';
import { generateH1BMetadata, generateStructuredData } from '@docujourney/utils';

export default async function AttorneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <AttorneyPageClient slug={slug} />;
}

function AttorneyPageClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const attorneyName = searchParams.get('name') || 'Unknown Attorney';
  const lawFirm = searchParams.get('firm') || 'Unknown Firm';
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Update document title and meta description dynamically
    const cleanAttorneyName = decodeURIComponent(attorneyName);
    const cleanLawFirm = decodeURIComponent(lawFirm);
    document.title = `${cleanAttorneyName} - H1B Visa Attorney Analytics | DocuJourney`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `Comprehensive H1B visa attorney analytics for ${cleanAttorneyName} at ${cleanLawFirm}. View case success rates, application volume, geographic distribution, and performance metrics.`,
      );
    }

    // Add attorney-specific structured data
    const structuredData = generateStructuredData('h1b-data', { 
      title: `${cleanAttorneyName} H1B Attorney`,
      slug: slug, 
    });
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    setIsLoaded(true);

    return () => {
      // Cleanup scripts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes(cleanAttorneyName)) {
          document.head.removeChild(script);
        }
      });
    };
  }, [attorneyName, lawFirm, slug]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-muted/30 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-80 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
          </div>
          
          {/* Quick skeleton preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="p-6 border border-border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading H1B attorney data for {attorneyName}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO-optimized content for attorney page */}
      <div className="sr-only">
        <h1>{attorneyName} H1B Visa Attorney Analytics and Performance Data</h1>
        <p>
          Comprehensive H1B visa attorney analytics for {attorneyName} at {lawFirm} including 
          case success rates, application volume, geographic distribution, client satisfaction, 
          and performance metrics. Explore detailed attorney analytics for informed legal representation decisions.
        </p>
        <div>
          <span>Keywords: {attorneyName} H1B attorney, {lawFirm} visa lawyer, H1B success rates, 
          visa attorney performance, immigration lawyer analytics, H1B case data</span>
        </div>
      </div>

      <AttorneyDashboard 
        attorneySlug={slug}
        attorneyName={attorneyName}
        lawFirm={lawFirm}
      />
    </>
  );
}