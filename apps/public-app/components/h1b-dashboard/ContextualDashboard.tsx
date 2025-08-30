'use client';

import React from 'react';
import { FilterProvider, useURLFilters, ViewType } from './FilterProvider';
import { H1BDashboard } from './H1BDashboard';
import { EmployersHero } from './EmployersHero';
import { JobsHero } from './JobsHero';
import { CitiesHero } from './CitiesHero';
import { AttorneysHero } from './AttorneysHero';
import { DashboardHero } from './DashboardHero';
import { YearsFilter } from './YearsFilter';
import { VisualizationPanel } from './VisualizationPanel';
import { TopEmployersTable } from './TopEmployersTable';
import { FilterState } from './types';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@docujourney/ui';
import { METRIC_CONFIGS } from '../../lib/metricCardConfig';
import {
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface SearchSuggestion {
  text: string;
  displayText?: string;
  type: 'job_title' | 'employer' | 'location';
  count: number;
  category?: string;
}

interface ContextualDashboardProps {
  viewType: ViewType;
}

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

// MetricCard component (same as in H1BDashboard)
const MetricCard = React.memo<{
  title: string;
  value: string;
  change?: number;
  status?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;  
  color?: string;
}>(({ title, value, change, status, icon, color = 'primary' }) => (
  <Card className="hover:shadow-md transition-shadow duration-200">
    <CardContent>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 bg-primary/10 text-primary rounded-lg`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            status === 'up' ? 'text-success' : 
            status === 'down' ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {status === 'up' && <ArrowUp className="w-4 h-4" />}
            {status === 'down' && <ArrowDown className="w-4 h-4" />}
            {change}%
          </div>
        )}
      </div>
      <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </CardContent>
  </Card>
));

MetricCard.displayName = 'MetricCard';

const ContextualDashboardContent: React.FC<ContextualDashboardProps> = ({ viewType }) => {
  const router = useRouter();
  const { filters, updateURL, hasActiveFilters, currentView } = useURLFilters();
  
  // State for managing dashboard data and loading
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [localFilters, setLocalFilters] = React.useState<FilterState>({
    searchQuery: filters.searchQuery || '',
    fiscalYear: filters.fiscalYear || getCurrentFiscalYear(),
    states: filters.states || [],
    cities: filters.cities || [],
    jobCategories: filters.jobCategories || [],
    skillLevels: filters.skillLevels || [],
    companySizes: filters.companySizes || [],
    companyTypes: filters.companyTypes || [],
  });
  const [loading, setLoading] = React.useState(true);
  const [chartsLoading, setChartsLoading] = React.useState(false);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = React.useMemo(() => ({
    fiscalYears: [filters.fiscalYear || getCurrentFiscalYear()],
    states: filters.states || [],
  }), [filters.fiscalYear, filters.states]);

  // Sync URL filters with local filters
  React.useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      searchQuery: filters.searchQuery || '',
      fiscalYear: filters.fiscalYear || prev.fiscalYear,
      salaryRange: filters.salaryRange || prev.salaryRange,
      states: filters.states || prev.states,
      cities: filters.cities || prev.cities,
    }));
  }, [filters]);

  const handleSearch = React.useCallback((query: string) => {
    console.log('Contextual dashboard search:', query);
    updateURL({ searchQuery: query });
  }, [updateURL]);

  const handleSuggestionSelect = React.useCallback((suggestion: SearchSuggestion) => {
    console.log('Contextual dashboard suggestion selected:', suggestion);
    
    // Helper function to detect if text looks like a company name
    const looksLikeCompanyName = (text: string) => {
      const companyIndicators = [
        'INC', 'LLC', 'CORP', 'LTD', 'CORPORATION', 'COMPANY', 'CO',
        'TECHNOLOGIES', 'SYSTEMS', 'SOLUTIONS', 'SERVICES', 'GROUP',
      ];
      const upperText = text.toUpperCase();
      return companyIndicators.some(indicator => 
        upperText.includes(indicator + '.') || 
        upperText.includes(indicator + ',') || 
        upperText.endsWith(indicator),
      );
    };
    
    // Handle navigation based on suggestion type and current context
    let finalType = suggestion.type;
    
    // Override type if it looks like a company name but was classified as job_title
    if (suggestion.type === 'job_title' && looksLikeCompanyName(suggestion.text)) {
      finalType = 'employer';
    }
    
    if (finalType === 'employer') {
      const companySlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // If we're on employers page, navigate with employer parameter to maintain context
      if (currentView === 'employers') {
        router.push(`/h1b-dashboard/employers?employer=${encodeURIComponent(suggestion.text)}`);
      } else {
        // Navigate to specific company page
        router.push(`/h1b-dashboard/company/${encodeURIComponent(companySlug)}?name=${encodeURIComponent(suggestion.text)}`);
      }
    } else if (finalType === 'job_title') {
      const jobSlug = suggestion.text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // If we're on jobs page, navigate with job parameter to maintain context
      if (currentView === 'jobs') {
        router.push(`/h1b-dashboard/jobs?job=${encodeURIComponent(suggestion.text)}`);
      } else {
        // Navigate to specific job page
        router.push(`/h1b-dashboard/job/${encodeURIComponent(jobSlug)}?title=${encodeURIComponent(suggestion.text)}`);
      }
    } else if (finalType === 'location') {
      // Navigate to city page if it's a city, state format
      if (suggestion.text.includes(',')) {
        const [cityPart, statePart] = suggestion.text.split(',');
        const cityName = cityPart.trim();
        const stateName = statePart.trim();
        
        if (cityName && stateName) {
          const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const stateSlug = stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          // Always navigate to specific city page for individual city data
          router.push(`/h1b-dashboard/locations/${encodeURIComponent(stateSlug)}/${encodeURIComponent(citySlug)}?city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}`);
        }
      }
    }
  }, [router, currentView]);

  const fetchH1BData = React.useCallback(async (selectedYear?: string) => {
    try {
      setChartsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      const yearToUse = selectedYear || localFilters.fiscalYear;
      if (yearToUse) {
        params.append('fiscalYears', yearToUse);
      }
      
      if (localFilters.states.length > 0) {
        params.append('states', localFilters.states.join(','));
      }
      
      if (localFilters.salaryRange && localFilters.salaryRange[0] > 0) {
        params.append('minSalary', localFilters.salaryRange[0].toString());
      }
      
      if (localFilters.salaryRange && localFilters.salaryRange[1] < 1000000) {
        params.append('maxSalary', localFilters.salaryRange[1].toString());
      }
      
      const response = await fetch(`/api/h1b-data?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      const data = apiResponse.data;
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching H1B data:', error);
      // Set empty data structure on error
      setDashboardData({
        totalApplications: 0,
        certifiedApplications: 0,
        deniedApplications: 0,
        withdrawnApplications: 0,
        certificationRate: 0,
        avgSalary: 0,
        medianSalary: 0,
        uniqueEmployers: 0,
        uniqueStates: 0,
        mostAppliedJob: { title: 'N/A', applications: 0 },
        topEmployers: [],
        topAttorneys: [],
        salaryDistribution: [],
        yearlyTrends: [],
        stateDistribution: [],
        jobTitleDistribution: [],
        industryDistribution: [],
      });
    } finally {
      setLoading(false);
      setChartsLoading(false);
    }
  }, [localFilters]);

  // Initial data load
  React.useEffect(() => {
    fetchH1BData();
  }, []);

  // Render appropriate hero component based on view type and filter state
  const renderHero = () => {
    const commonProps = {
      filters: localFilters,
      setFilters: setLocalFilters,
      onSearch: handleSearch,
      onSuggestionSelect: handleSuggestionSelect,
    };

    // If we have active filters, show the appropriate filtered view
    if (hasActiveFilters) {
      if (currentView === 'employers') {
        return <EmployersHero {...commonProps} />;
      } else if (currentView === 'jobs') {
        return <JobsHero {...commonProps} />;
      } else if (currentView === 'cities') {
        return <CitiesHero {...commonProps} />;
      } else if (currentView === 'attorneys') {
        return <AttorneysHero {...commonProps} />;
      }
      // Default to general hero for filtered home view
      return <DashboardHero {...commonProps} />;
    }

    // Show route-specific hero for landing pages when no filters
    switch (viewType) {
      case 'employers':
        return <EmployersHero {...commonProps} />;
      case 'jobs':
        return <JobsHero {...commonProps} />;
      case 'cities':
        return <CitiesHero {...commonProps} />;
      case 'attorneys':
        return <AttorneysHero {...commonProps} />;
      default:
        return <DashboardHero {...commonProps} />;
    }
  };

  // Show loading state
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        {renderHero()}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section - Always show appropriate hero */}
      {renderHero()}

      {/* Years Filter - Show when we have filters or on filtered views */}
      {(hasActiveFilters || viewType !== 'home') && (
        <YearsFilter
          filters={localFilters}
          setFilters={setLocalFilters}
          onFetchData={fetchH1BData}
        />
      )}

      {/* Dashboard Content - Show when we have active filters or data to display */}
      {(hasActiveFilters || dashboardData) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            {chartsLoading ? (
              <>
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-muted/30 rounded-lg animate-pulse">
                        <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-28 animate-pulse mb-1"></div>
                    <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-muted/30 rounded-lg animate-pulse">
                        <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-24 animate-pulse mb-1"></div>
                    <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-muted/30 rounded-lg animate-pulse">
                        <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-32 animate-pulse mb-1"></div>
                    <div className="h-8 bg-muted rounded w-18 animate-pulse"></div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-muted/30 rounded-lg animate-pulse">
                        <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-26 animate-pulse mb-1"></div>
                    <div className="h-8 bg-muted rounded w-14 animate-pulse"></div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <MetricCard
                  title="Total Applications"
                  value={dashboardData?.totalApplications?.toLocaleString() || '0'}
                  icon={<METRIC_CONFIGS.totalApplications.icon className="w-6 h-6" />}
                  color="primary"
                />
                <MetricCard
                  title="Average Salary"
                  value={`$${((dashboardData?.avgSalary || 0) / 1000).toFixed(0)}K`}
                  icon={<METRIC_CONFIGS.averageSalary.icon className="w-6 h-6" />}
                  color="primary"
                />
                <MetricCard
                  title="Unique Employers"
                  value={dashboardData?.uniqueEmployers?.toLocaleString() || '0'}
                  icon={<METRIC_CONFIGS.uniqueEmployers.icon className="w-6 h-6" />}
                  color="primary"
                />
                <MetricCard
                  title="Approval Rate"
                  value={`${(dashboardData?.certificationRate || 0).toFixed(1)}%`}
                  icon={<METRIC_CONFIGS.approvalRate.icon className="w-6 h-6" />}
                  color="primary"
                />
              </>
            )}
          </div>

          {/* Visualization Panel */}
          <div className="space-y-6">
            <VisualizationPanel
              dashboardData={dashboardData || {
                totalApplications: 0,
                certifiedApplications: 0,
                deniedApplications: 0,
                withdrawnApplications: 0,
                certificationRate: 0,
                avgSalary: 0,
                medianSalary: 0,
                uniqueEmployers: 0,
                uniqueStates: 0,
                mostAppliedJob: { title: 'N/A', applications: 0 },
                topEmployers: [],
                topAttorneys: [],
                salaryDistribution: [],
                yearlyTrends: [],
                stateDistribution: [],
                jobTitleDistribution: [],
                industryDistribution: [],
              }}
              chartsLoading={chartsLoading}
              filters={memoizedFilters}
            />
            
            {/* Top Employers Table */}
            <TopEmployersTable dashboardData={dashboardData || { topEmployers: [] }} />
          </div>
        </div>
      )}
    </>
  );
};

// Wrapper component that provides FilterProvider context
export const ContextualDashboard: React.FC<ContextualDashboardProps> = ({ viewType }) => {
  return (
    <FilterProvider initialView={viewType}>
      <ContextualDashboardContent viewType={viewType} />
    </FilterProvider>
  );
};