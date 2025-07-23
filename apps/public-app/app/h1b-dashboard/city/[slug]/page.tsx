'use client';

import { useSearchParams } from 'next/navigation';
import { CityDashboard } from '@/components/h1b-dashboard';

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return <CityPageClient slug={slug} />;
}

function CityPageClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const cityName = searchParams.get('city') || 'Unknown City';
  const stateName = searchParams.get('state') || 'Unknown State';

  return (
    <CityDashboard 
      citySlug={slug}
      cityName={cityName}
      stateName={stateName}
    />
  );
}