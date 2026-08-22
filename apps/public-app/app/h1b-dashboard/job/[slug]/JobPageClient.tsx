'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobDashboard } from '@/components/h1b-dashboard';

type JobPageClientProps = {
  slug: string;
  jobTitle?: string;
};

// Title, meta description, and structured data are all rendered server-side by
// page.tsx — this component only wires up the interactive dashboard.
function JobContent({ slug, jobTitle: propJobTitle }: JobPageClientProps) {
  const searchParams = useSearchParams();
  // Prefer the exact title from search navigation (?title=...) since it matches
  // the database verbatim; fall back to the server-derived title so direct and
  // organic landings on the bare slug URL still resolve.
  const jobTitle = searchParams.get('title') || propJobTitle || 'Unknown Job';

  return (
    <JobDashboard
      jobSlug={slug}
      jobTitle={jobTitle}
    />
  );
}

export default function JobPageClient({ slug, jobTitle }: JobPageClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading H1B data...</p>
          </div>
        </div>
      }
    >
      <JobContent slug={slug} jobTitle={jobTitle} />
    </Suspense>
  );
}
