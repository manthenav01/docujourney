'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CompanyDashboard } from '@/components/h1b-dashboard';

type CompanyPageClientProps = {
  slug: string;
  companyName?: string;
};

// Component that uses useSearchParams - must be wrapped in Suspense
function CompanyContent({ slug, companyName: propCompanyName }: CompanyPageClientProps) {
  const searchParams = useSearchParams();
  const companyName = propCompanyName || searchParams.get('name') || 'Unknown Company';

  return (
    <CompanyDashboard 
      companySlug={slug}
      companyName={companyName}
    />
  );
}

// Loading component for Suspense fallback
function CompanyLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompanyPageClient({ slug, companyName }: CompanyPageClientProps) {
  return (
    <Suspense fallback={<CompanyLoading />}>
      <CompanyContent slug={slug} companyName={companyName} />
    </Suspense>
  );
}