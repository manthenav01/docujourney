'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import StateDashboard from '@/components/h1b-dashboard/StateDashboard';
import { getFullStateName, isStateAbbreviation, getStateAbbreviation } from '@/lib/utils/stateUtils';

interface StatePageClientProps {
  stateSlug: string;
}

const StatePageClient: React.FC<StatePageClientProps> = ({ stateSlug }) => {
  const searchParams = useSearchParams();
  const [stateName, setStateName] = useState<string>('');
  const [stateCode, setStateCode] = useState<string>('');

  useEffect(() => {
    // First try to get state name from search params
    const stateFromParams = searchParams.get('state');
    
    if (stateFromParams) {
      // If it's an abbreviation (like 'TN'), convert to full name for display
      if (isStateAbbreviation(stateFromParams)) {
        setStateName(getFullStateName(stateFromParams));
        setStateCode(stateFromParams.toUpperCase());
      } else {
        // It's a full name, use as-is for display and get abbreviation for API
        setStateName(stateFromParams);
        setStateCode(getStateAbbreviation(stateFromParams));
      }
    } else {
      // Convert slug back to proper state name
      const derivedStateName = stateSlug
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      setStateName(derivedStateName);
      setStateCode(getStateAbbreviation(derivedStateName));
    }
  }, [stateSlug, searchParams]);

  if (!stateName || !stateCode) {
    return <div>Loading...</div>;
  }

  return (
    <StateDashboard 
      stateSlug={stateSlug}
      stateName={stateName}
      stateCode={stateCode}
    />
  );
};

export default StatePageClient;