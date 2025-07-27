'use client';

import { useSearchParams } from 'next/navigation';
import { CompanyDashboard } from '@/components/h1b-dashboard';

type CompanyPageClientProps = {
  slug: string;
};

export default function CompanyPageClient({ slug }: CompanyPageClientProps) {
  const searchParams = useSearchParams();
  const companyName = searchParams.get('name') || 'Unknown Company';

  return (
    <CompanyDashboard 
      companySlug={slug}
      companyName={companyName}
    />
  );
}