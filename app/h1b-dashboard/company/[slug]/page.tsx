"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CompanyDashboard } from '@/components/h1b-dashboard';

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const companyName = searchParams.get('name') || 'Unknown Company';

  return (
    <CompanyDashboard 
      companySlug={params.slug}
      companyName={companyName}
    />
  );
}
