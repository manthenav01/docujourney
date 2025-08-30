'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FilterState } from './types';

export type ViewType = 'home' | 'employers' | 'jobs' | 'cities' | 'attorneys';

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  updateURL: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Function to get the current fiscal year based on today's date
const getCurrentFiscalYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 9 = October)
  
  // H1B fiscal year starts on October 1st
  // If we're in October or later, we're in the next fiscal year
  // If we're before October, we're still in the current fiscal year
  return currentMonth >= 9 ? (currentYear + 1).toString() : currentYear.toString();
};

const defaultFilters: FilterState = {
  searchQuery: '',
  fiscalYear: getCurrentFiscalYear(),
  states: [],
  cities: [],
  jobCategories: [],
  skillLevels: [],
  companySizes: [],
  companyTypes: [],
};

interface FilterProviderProps {
  children: ReactNode;
  initialView?: ViewType;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ 
  children, 
  initialView = 'home',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [currentView, setCurrentView] = useState<ViewType>(initialView);

  // Parse URL parameters on mount and when searchParams change
  useEffect(() => {
    const urlFilters: Partial<FilterState> = {};
    
    // Parse employer parameter
    const employer = searchParams.get('employer');
    if (employer) {
      urlFilters.searchQuery = employer;
      setCurrentView('employers');
    }

    // Parse job parameter
    const job = searchParams.get('job') || searchParams.get('title');
    if (job) {
      urlFilters.searchQuery = job;
      setCurrentView('jobs');
    }

    // Parse city parameters
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    if (city && state) {
      urlFilters.searchQuery = `${city}, ${state}`;
      setCurrentView('cities');
    } else if (city) {
      urlFilters.searchQuery = city;
      setCurrentView('cities');
    }

    // Parse attorney parameter
    const attorney = searchParams.get('attorney');
    if (attorney) {
      urlFilters.searchQuery = attorney;
      setCurrentView('attorneys');
    }

    // Parse fiscal year
    const fiscalYear = searchParams.get('year');
    if (fiscalYear) {
      urlFilters.fiscalYear = fiscalYear;
    }

    // Parse salary range
    const minSalary = searchParams.get('min_salary');
    const maxSalary = searchParams.get('max_salary');
    if (minSalary || maxSalary) {
      urlFilters.salaryRange = [
        minSalary ? parseInt(minSalary) : 0,
        maxSalary ? parseInt(maxSalary) : 1000000,
      ];
    }

    // Parse states array
    const statesParam = searchParams.get('states');
    if (statesParam) {
      urlFilters.states = statesParam.split(',').filter(Boolean);
    }

    // Parse cities array
    const citiesParam = searchParams.get('cities');
    if (citiesParam) {
      urlFilters.cities = citiesParam.split(',').filter(Boolean);
    }

    // Apply URL filters
    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
  }, [searchParams]);

  // Determine current view based on pathname
  useEffect(() => {
    if (pathname.includes('/employers')) {
      setCurrentView('employers');
    } else if (pathname.includes('/jobs')) {
      setCurrentView('jobs');
    } else if (pathname.includes('/cities')) {
      setCurrentView('cities');
    } else if (pathname.includes('/attorneys')) {
      setCurrentView('attorneys');
    } else if (pathname.includes('/company/')) {
      setCurrentView('employers');
    } else if (pathname.includes('/job/')) {
      setCurrentView('jobs');
    } else if (pathname.includes('/city/')) {
      setCurrentView('cities');
    } else if (pathname.includes('/attorney/')) {
      setCurrentView('attorneys');
    } else {
      setCurrentView('home');
    }
  }, [pathname]);

  const updateURL = (newFilters: Partial<FilterState>) => {
    const params = new URLSearchParams();
    
    // Build URL parameters from filters
    if (newFilters.searchQuery) {
      // Determine parameter name based on current view
      if (currentView === 'employers') {
        params.set('employer', newFilters.searchQuery);
      } else if (currentView === 'jobs') {
        params.set('job', newFilters.searchQuery);
      } else if (currentView === 'cities') {
        params.set('city', newFilters.searchQuery);
      } else if (currentView === 'attorneys') {
        params.set('attorney', newFilters.searchQuery);
      } else {
        params.set('q', newFilters.searchQuery);
      }
    }

    if (newFilters.fiscalYear && newFilters.fiscalYear !== defaultFilters.fiscalYear) {
      params.set('year', newFilters.fiscalYear);
    }

    if (newFilters.salaryRange) {
      if (newFilters.salaryRange[0] > 0) {
        params.set('min_salary', newFilters.salaryRange[0].toString());
      }
      if (newFilters.salaryRange[1] < 1000000) {
        params.set('max_salary', newFilters.salaryRange[1].toString());
      }
    }

    if (newFilters.states && newFilters.states.length > 0) {
      params.set('states', newFilters.states.join(','));
    }

    if (newFilters.cities && newFilters.cities.length > 0) {
      params.set('cities', newFilters.cities.join(','));
    }

    // Navigate to current pathname with new parameters
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newURL, { scroll: false });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    router.push(pathname, { scroll: false });
  };

  const value: FilterContextType = {
    filters,
    setFilters,
    currentView,
    setCurrentView,
    updateURL,
    clearFilters,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Custom hook for URL-based filtering
export const useURLFilters = () => {
  const { filters, updateURL, clearFilters, currentView } = useFilters();
  const searchParams = useSearchParams();

  // Determine if we have any active filters
  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.searchQuery !== defaultFilters.searchQuery ||
      filters.fiscalYear !== defaultFilters.fiscalYear ||
      (filters.salaryRange && (filters.salaryRange[0] !== 0 || filters.salaryRange[1] !== 1000000)) ||
      (filters.states?.length || 0) > 0 ||
      (filters.cities?.length || 0) > 0 ||
      (filters.jobCategories?.length || 0) > 0 ||
      (filters.skillLevels?.length || 0) > 0 ||
      (filters.companySizes?.length || 0) > 0 ||
      (filters.companyTypes?.length || 0) > 0
    );
  }, [filters]);

  // Determine view type from URL parameters
  const getViewTypeFromURL = React.useCallback(() => {
    if (searchParams.get('employer')) {
      return 'employers';
    }
    if (searchParams.get('job') || searchParams.get('title')) {
      return 'jobs';
    }
    if (searchParams.get('city') || searchParams.get('state')) {
      return 'cities';
    }
    if (searchParams.get('attorney')) {
      return 'attorneys';
    }
    return currentView;
  }, [searchParams, currentView]);

  return {
    filters,
    updateURL,
    clearFilters,
    hasActiveFilters,
    currentView: getViewTypeFromURL(),
    isFiltered: hasActiveFilters,
  };
};