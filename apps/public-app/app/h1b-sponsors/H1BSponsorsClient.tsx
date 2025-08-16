'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { EmployersHero } from '@/components/h1b-dashboard/EmployersHero';
import { ClientErrorBoundary } from './ClientErrorBoundary';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface FilterState {
  searchQuery: string;
  fiscalYear: string;
  salaryRange: [number, number];
  states: string[];
  cities: string[];
  jobCategories: string[];
  skillLevels: string[];
  companySizes: string[];
  companyTypes: string[];
}

interface H1BSponsorsClientProps {
  initialPage?: number;
  initialSearch?: string;
  initialIndustry?: string;
  initialState?: string;
  initialMinSalary?: number;
  initialMaxSalary?: number;
}

export function H1BSponsorsClient({
  initialPage = 1,
  initialSearch = '',
  initialIndustry = '',
  initialState = '',
  initialMinSalary,
  initialMaxSalary,
}: H1BSponsorsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  // Initialize state from URL params
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialSearch,
    fiscalYear: '2024',
    salaryRange: [
      initialMinSalary || 0, 
      initialMaxSalary || 500000
    ],
    states: initialState ? [initialState] : [],
    cities: [],
    jobCategories: initialIndustry ? [initialIndustry] : [],
    skillLevels: [],
    companySizes: [],
    companyTypes: [],
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: Partial<FilterState>, newPage?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update page
    if (newPage !== undefined && newPage !== 1) {
      params.set('page', newPage.toString());
    } else if (newPage === 1) {
      params.delete('page');
    }
    
    // Update search
    if (newFilters.searchQuery !== undefined) {
      if (newFilters.searchQuery) {
        params.set('search', newFilters.searchQuery);
      } else {
        params.delete('search');
      }
    }
    
    // Update salary range
    if (newFilters.salaryRange) {
      const [min, max] = newFilters.salaryRange;
      if (min > 0) {
        params.set('minSalary', min.toString());
      } else {
        params.delete('minSalary');
      }
      if (max < 500000) {
        params.set('maxSalary', max.toString());
      } else {
        params.delete('maxSalary');
      }
    }
    
    // Update states
    if (newFilters.states !== undefined) {
      if (newFilters.states.length > 0) {
        params.set('state', newFilters.states[0]); // For now, just use first state
      } else {
        params.delete('state');
      }
    }
    
    // Update industries/job categories
    if (newFilters.jobCategories !== undefined) {
      if (newFilters.jobCategories.length > 0) {
        params.set('industry', newFilters.jobCategories[0]); // For now, just use first category
      } else {
        params.delete('industry');
      }
    }
    
    // Navigate to new URL
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newURL, { scroll: false });
  }, [pathname, router, searchParams]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    updateURL(newFilters, 1);
  }, [updateURL]);

  // Handle search from hero
  const handleHeroSearch = useCallback((query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    handleFiltersChange(newFilters);
  }, [filters, handleFiltersChange]);

  // Handle suggestion select
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    if (suggestion.type === 'employer') {
      const companySlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      router.push(`/h1b-dashboard/company/${companySlug}?name=${encodeURIComponent(suggestion.text)}`);
    }
  }, [router]);

  // Detect client-side mounting to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync with browser back/forward navigation
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentState = searchParams.get('state') || '';
    const currentIndustry = searchParams.get('industry') || '';
    const currentMinSalary = searchParams.get('minSalary');
    const currentMaxSalary = searchParams.get('maxSalary');
    
    setFilters(prev => ({
      ...prev,
      searchQuery: currentSearch,
      states: currentState ? [currentState] : [],
      jobCategories: currentIndustry ? [currentIndustry] : [],
      salaryRange: [
        currentMinSalary ? parseInt(currentMinSalary, 10) : 0,
        currentMaxSalary ? parseInt(currentMaxSalary, 10) : 500000,
      ],
    }));
  }, [searchParams]);

  // Handle data refresh (dev only)
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  return (
    <ClientErrorBoundary>
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <EmployersHero
          filters={filters}
          setFilters={handleFiltersChange}
          onSearch={handleHeroSearch}
          onSuggestionSelect={handleSuggestionSelect}
        />
        
        {/* Development-only refresh button - only show after client hydration */}
        {isClient && process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg shadow-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data (Development only)"
            >
              <svg 
                className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {isPending ? 'Refreshing...' : 'Refresh Data (Dev)'}
            </button>
          </div>
        )}
      </div>
    </ClientErrorBoundary>
  );
}