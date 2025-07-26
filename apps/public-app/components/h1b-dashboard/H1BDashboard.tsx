'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FilterState } from './types';
import { DashboardHero } from './DashboardHero';
import { FilterCards } from './FilterCards';
import { VisualizationPanel } from './VisualizationPanel';
import { TopEmployersTable } from './TopEmployersTable';
import { H1BAggregatedData } from '../../lib/types';
import { 
  FileText,
  DollarSign,
  Building,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Database,
  BarChart3,
  Home,
  Settings,
} from 'lucide-react';
import { Card, CardContent } from '@docujourney/ui';
import './dashboard.css';

// Extend the H1BAggregatedData type to include cache information
interface H1BDashboardData extends H1BAggregatedData {
  isFromCache?: boolean;
}


export const H1BDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<H1BDashboardData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '', // Keep this for search functionality
    fiscalYears: [],
    salaryRange: [0, 500000],
    states: [],
    cities: [],
    jobCategories: [],
    skillLevels: [],
    companySizes: [],
    companyTypes: [],
  });
  const [activeNavItem, setActiveNavItem] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Create stable filter dependencies to prevent unnecessary re-renders
  const filterDependencies = useMemo(() => {
    return {
      fiscalYears: JSON.stringify(filters.fiscalYears.sort()),
      salaryRange: `${filters.salaryRange[0]}-${filters.salaryRange[1]}`,
      states: JSON.stringify(filters.states.sort()),
      cities: JSON.stringify(filters.cities.sort()),
      jobCategories: JSON.stringify(filters.jobCategories.sort()),
      skillLevels: JSON.stringify(filters.skillLevels.sort()),
      companySizes: JSON.stringify(filters.companySizes.sort()),
      companyTypes: JSON.stringify(filters.companyTypes.sort()),
    };
  }, [
    filters.fiscalYears,
    filters.salaryRange,
    filters.states,
    filters.cities,
    filters.jobCategories,
    filters.skillLevels,
    filters.companySizes,
    filters.companyTypes,
  ]);

  const handleHeroSearch = useCallback((query: string) => {
    console.log('Hero search:', query);
    // Implement search logic here
  }, []);

  // Memoize the dashboard data object to prevent unnecessary re-renders
  const memoizedDashboardData = useMemo(() => {
    if (!dashboardData) {
      return {
        salaryDistribution: [],
        yearlyTrends: [],
        stateDistribution: [],
        jobTitleDistribution: [],
      };
    }
    return dashboardData;
  }, [dashboardData]);

  // Memoize the fetchH1BData function using stable filter dependencies
  const fetchH1BData = useCallback(async () => {
    try {
      setChartsLoading(true);
      setLoadingError(null); // Clear any previous errors
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.fiscalYears.length > 0) {
        params.append('fiscalYears', filters.fiscalYears.join(','));
      }
      
      if (filters.states.length > 0) {
        params.append('states', filters.states.join(','));
      }
      
      if (filters.salaryRange[0] > 0) {
        params.append('minSalary', filters.salaryRange[0].toString());
      }
      
      if (filters.salaryRange[1] < 500000) {
        params.append('maxSalary', filters.salaryRange[1].toString());
      }
      
      // Don't include searchQuery - search is now only for autocomplete, not filtering
      
      console.log('Fetching H1B data with params:', params.toString());
      
      const response = await fetch(`/api/h1b-data?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log('H1B data loaded:', {
        totalApplications: data.totalApplications,
        avgSalary: data.avgSalary,
        topEmployersCount: data.topEmployers?.length || 0,
        statesCount: data.stateDistribution?.length || 0,
      });
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching H1B data:', error);
      
      setLoadingError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Set empty data on error to prevent crashes
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
        mostAppliedJob: {
          title: 'N/A',
          applications: 0,
        },
        topEmployers: [],
        topAttorneys: [],
        salaryDistribution: [],
        yearlyTrends: [],
        stateDistribution: [],
        jobTitleDistribution: [],
        industryDistribution: [],
        isFromCache: false,
      });
    } finally {
      setLoading(false);
      setChartsLoading(false);
    }
  }, [
    filterDependencies.fiscalYears,
    filterDependencies.salaryRange,
    filterDependencies.states,
    filterDependencies.cities,
    filterDependencies.jobCategories,
    filterDependencies.skillLevels,
    filterDependencies.companySizes,
    filterDependencies.companyTypes,
  ]); // Use stable filter dependencies instead of the entire filters object

  // Initial load effect - runs only once on mount
  useEffect(() => {
    console.log('H1BDashboard: Initial load effect triggered');
    fetchH1BData().finally(() => {
      setInitialLoadComplete(true);
      setLoading(false);
    });
  }, []);


  // Remove the problematic useEffect that triggers unnecessary re-renders
  // The chartsLoading state is already properly managed by the fetchH1BData function

  // Show skeleton layout while loading initial data, but not full-page spinner
  const showInitialLoading = loading && !dashboardData;

  if (!dashboardData && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground mt-2">Please check the console for more details</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          <div className={`p-2.5 ${
            color === 'primary' ? 'bg-primary/10 text-primary' :
            color === 'success' ? 'bg-success/10 text-success' :
            color === 'warning' ? 'bg-warning/10 text-warning' :
            'bg-muted/30 text-foreground'
          } rounded-lg`}>
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

  // Just return the content without sidebar since DashboardLayout handles the layout
  return (
    <>
      {/* Hero Section */}
      <DashboardHero
        filters={filters}
        setFilters={setFilters}
        onSearch={handleHeroSearch}
      />

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {showInitialLoading && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-gray-600 text-xs font-medium animate-pulse">
                <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                <span>Loading...</span>
              </div>
            )}
            {dashboardData?.isFromCache && !showInitialLoading && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-blue-600 text-xs font-medium">
                <Database className="w-3 h-3" />
                <span>Cached</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Cards */}
        <div className="mb-8">
          <FilterCards
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
        {showInitialLoading ? (
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
              value={dashboardData?.totalApplications.toLocaleString() || '0'}
              icon={<FileText className="w-6 h-6" />}
              color="primary"
            />
            <MetricCard
              title="Average Salary"
              value={`$${((dashboardData?.avgSalary || 0) / 1000).toFixed(0)}K`}
              icon={<DollarSign className="w-6 h-6" />}
              color="success"
            />
            <MetricCard
              title="Unique Employers"
              value={dashboardData?.uniqueEmployers.toLocaleString() || '0'}
              icon={<Building className="w-6 h-6" />}
              color="primary"
            />
            <MetricCard
              title="Approval Rate"
              value={`${(dashboardData?.certificationRate || 0).toFixed(1)}%`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="success"
            />
          </>
        )}
      </div>

        {/* Main Content */}
        <div className="space-y-6">
          <VisualizationPanel
            dashboardData={memoizedDashboardData}
            chartsLoading={showInitialLoading || chartsLoading}
          />
          
          {showInitialLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <TopEmployersTable dashboardData={dashboardData || { topEmployers: [] }} />
          )}
        </div>
      </div>
    </>
  );
};