import { redirect } from 'next/navigation';

interface OldCityPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Redirect old city URLs to new hierarchical structure
export default async function OldCityPage({ params, searchParams }: OldCityPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Extract city and state from search params
  const cityName = Array.isArray(resolvedSearchParams.city) 
    ? resolvedSearchParams.city[0] 
    : resolvedSearchParams.city;
    
  const stateName = Array.isArray(resolvedSearchParams.state) 
    ? resolvedSearchParams.state[0] 
    : resolvedSearchParams.state;
  
  if (cityName && stateName) {
    // Create proper slugs
    const stateSlug = stateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const citySlug = slug; // Use existing city slug
    
    // Redirect to new hierarchical structure with search params preserved
    redirect(`/h1b-dashboard/locations/${stateSlug}/${citySlug}?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
  }
  
  // If no proper search params, redirect to locations page
  redirect('/h1b-dashboard/locations');
}