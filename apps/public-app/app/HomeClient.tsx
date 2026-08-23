'use client';

import { Suspense } from 'react';
import { H1BDashboard, DashboardLayout } from '@/components/h1b-dashboard';
import { useDynamicSEO } from '@/hooks/useDynamicSEO';

// Client component for dynamic SEO that handles SSR gracefully
const DynamicSEOWrapper = () => {
  useDynamicSEO();
  return null;
};

// Client shell for the homepage: interactive dashboard plus the
// server-rendered browse section passed down from app/page.tsx so it sits
// inside the shared layout (above the footer).
export default function HomeClient({ browseSection }: { browseSection?: React.ReactNode }) {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <DynamicSEOWrapper />
      </Suspense>

      <H1BDashboard />

      {browseSection}
    </DashboardLayout>
  );
}
