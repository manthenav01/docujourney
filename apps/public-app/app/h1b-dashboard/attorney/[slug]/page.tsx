import { Metadata } from 'next';
import { Suspense } from 'react';
import { AttorneyDashboard } from '@/components/h1b-dashboard';
import { validateAttorneyName, validateLawFirmName, sanitizeString } from '@/lib/validation';

// Generate metadata for SEO
export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Safely extract and validate attorney information
  const rawAttorneyName = Array.isArray(resolvedSearchParams.name) 
    ? resolvedSearchParams.name[0] 
    : resolvedSearchParams.name;
  const rawLawFirm = Array.isArray(resolvedSearchParams.firm) 
    ? resolvedSearchParams.firm[0] 
    : resolvedSearchParams.firm;
  
  let attorneyName = 'Unknown Attorney';
  let lawFirm = 'Unknown Firm';
  
  try {
    attorneyName = rawAttorneyName ? validateAttorneyName(rawAttorneyName) : 'Unknown Attorney';
    lawFirm = rawLawFirm ? validateLawFirmName(rawLawFirm) || 'Unknown Firm' : 'Unknown Firm';
  } catch {
    // Use sanitized fallbacks if validation fails
    attorneyName = sanitizeString(rawAttorneyName) || 'Unknown Attorney';
    lawFirm = sanitizeString(rawLawFirm) || 'Unknown Firm';
  }
  
  const title = `${attorneyName} - H1B Visa Attorney Analytics | DocuJourney`;
  const description = `Comprehensive H1B visa attorney analytics for ${attorneyName} at ${lawFirm}. View case success rates, application volume, geographic distribution, and performance metrics.`;
  
  return {
    title,
    description,
    keywords: [
      `${attorneyName} H1B attorney`,
      `${lawFirm} visa lawyer`,
      'H1B success rates',
      'visa attorney performance',
      'immigration lawyer analytics',
      'H1B case data'
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/h1b-dashboard/attorney/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AttorneyPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Extract attorney information from search params
  const attorneyName = Array.isArray(resolvedSearchParams.name) 
    ? resolvedSearchParams.name[0] 
    : resolvedSearchParams.name || 'Unknown Attorney';
  const lawFirm = Array.isArray(resolvedSearchParams.firm) 
    ? resolvedSearchParams.firm[0] 
    : resolvedSearchParams.firm || 'Unknown Firm';
  
  return (
    <AttorneyPageWrapper 
      slug={slug}
      attorneyName={attorneyName}
      lawFirm={lawFirm}
    />
  );
}

interface AttorneyPageWrapperProps {
  slug: string;
  attorneyName: string;
  lawFirm: string;
}

function AttorneyPageWrapper({ slug, attorneyName, lawFirm }: AttorneyPageWrapperProps) {
  // Clean the attorney and firm names
  const cleanAttorneyName = decodeURIComponent(attorneyName);
  const cleanLawFirm = decodeURIComponent(lawFirm);
  
  return (
    <>
      {/* SEO-optimized content for attorney page - now server-side rendered */}
      <div className="sr-only">
        <h1>{cleanAttorneyName} H1B Visa Attorney Analytics and Performance Data</h1>
        <p>
          Comprehensive H1B visa attorney analytics for {cleanAttorneyName} at {cleanLawFirm} including 
          case success rates, application volume, geographic distribution, client satisfaction, 
          and performance metrics. Explore detailed attorney analytics for informed legal representation decisions.
        </p>
        <div>
          <span>Keywords: {cleanAttorneyName} H1B attorney, {cleanLawFirm} visa lawyer, H1B success rates, 
          visa attorney performance, immigration lawyer analytics, H1B case data</span>
        </div>
      </div>

      <Suspense fallback={<AttorneyLoadingSkeleton attorneyName={cleanAttorneyName} />}>
        <AttorneyDashboard 
          attorneySlug={slug}
          attorneyName={cleanAttorneyName}
          lawFirm={cleanLawFirm}
        />
      </Suspense>
    </>
  );
}

function AttorneyLoadingSkeleton({ attorneyName }: { attorneyName: string }) {
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