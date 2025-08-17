'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CityDashboard } from '@/components/h1b-dashboard/CityDashboard';

interface CityPageClientProps {
  stateSlug: string;
  citySlug: string;
}

const CityPageClient: React.FC<CityPageClientProps> = ({ stateSlug, citySlug }) => {
  const searchParams = useSearchParams();
  const [cityName, setCityName] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');

  useEffect(() => {
    // First try to get names from search params
    const cityFromParams = searchParams.get('city');
    const stateFromParams = searchParams.get('state');
    
    if (cityFromParams && stateFromParams) {
      setCityName(cityFromParams);
      setStateName(stateFromParams);
    } else {
      // Convert slugs back to proper names
      const derivedCityName = citySlug
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
      const derivedStateName = stateSlug
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
      setCityName(derivedCityName);
      setStateName(derivedStateName);
    }
  }, [citySlug, stateSlug, searchParams]);

  if (!cityName || !stateName) {
    return <div>Loading...</div>;
  }

  return (
    <CityDashboard 
      citySlug={citySlug}
      cityName={cityName}
      stateName={stateName}
    />
  );
};

export default CityPageClient;