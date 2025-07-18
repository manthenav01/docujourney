"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CompanyDashboard } from '@/components/h1b-dashboard';

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const searchParams = useSearchParams();
  const companyName = searchParams.get('name') || 'Unknown Company';

  return (
    <CompanyDashboard 
      companySlug={slug}
      companyName={companyName}
    />
  );
}
