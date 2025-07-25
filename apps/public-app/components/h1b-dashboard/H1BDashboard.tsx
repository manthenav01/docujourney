'use client';

import React, { useState, useEffect } from 'react';
import { FilterState } from './types';
import { SearchAndFilters } from './SearchAndFilters';
import { VisualizationPanel } from './VisualizationPanel';
import { TopEmployersTable } from './TopEmployersTable';
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

// BigQuery data structure
interface H1BDashboardData {
  totalApplications: number;
  certifiedApplications: number;
  deniedApplications: number;
  withdrawnApplications: number;
  certificationRate: number;
  avgSalary: number;
  medianSalary: number;
  uniqueEmployers: number;
  uniqueStates: number;
  mostAppliedJob: {
    title: string;
    applications: number;
  };
  topEmployers: Array<{
    employer: string;
    applications: number;
    avgSalary: number;
    topState: string;
  }>;
  salaryDistribution: Array<{
    range: string;
    count: number;
    minSalary: number;
    maxSalary: number;
  }>;
  yearlyTrends: Array<{
    fiscalYear: string;
    applications: number;
    avgSalary: number;
    medianSalary: number;
  }>;
  stateDistribution: Array<{
    state: string;
    applications: number;
    avgSalary: number;
    highestSalary: number;
  }>;
  jobTitleDistribution: Array<{
    jobTitle: string;
    applications: number;
    avgSalary: number;
    percentage: number;
  }>;
  caseStatusByJobCategory: Array<{
    jobCategory: string;
    caseStatus: string;
    applicationCount: number;
    avgSalary: number;
  }>;
  industryDistribution: Array<{
    industry: string;
    applications: number;
    avgSalary: number;
    percentage: number;
  }>;
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

  useEffect(() => {
    // Safety timeout - force loading to end after 45 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('Safety timeout triggered - forcing loading to end');
      setLoading(false);
      setInitialLoadComplete(true);
      if (!dashboardData) {
        setLoadingError('Loading timed out. Please refresh the page.');
      }
    }, 45000);

    fetchH1BData().finally(() => {
      clearTimeout(safetyTimeout);
      setInitialLoadComplete(true);
      setLoading(false); // Ensure loading is always set to false after initial load
    });

    return () => clearTimeout(safetyTimeout);
  }, []);

  useEffect(() => {
    // Only run when filters change, not on initial load
    if (!initialLoadComplete) {
      return;
    }
    
    // Debounce the API call when filters change
    const timeoutId = setTimeout(() => {
      fetchH1BData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.fiscalYears, filters.salaryRange, filters.states, filters.cities, filters.jobCategories, filters.skillLevels, filters.companySizes, filters.companyTypes]);

  useEffect(() => {
    if (dashboardData) {
      setChartsLoading(true);
      setTimeout(() => {
        setChartsLoading(false);
      }, 100);
    }
  }, [dashboardData]);


  const fetchH1BData = async () => {
    try {
      setChartsLoading(true);
      setLoadingError(null); // Clear any previous errors
      
      // Add timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
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
      
      const response = await fetch(`/api/h1b-data?${params.toString()}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
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
      
      // Handle specific error types
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out after 30 seconds');
        setLoadingError('Request timed out. Please try again.');
      } else {
        setLoadingError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
      
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
        salaryDistribution: [],
        yearlyTrends: [],
        stateDistribution: [],
        jobTitleDistribution: [],
        caseStatusByJobCategory: [],
        industryDistribution: [],
        isFromCache: false,
      });
    } finally {
      setLoading(false);
      setChartsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading H1B Dashboard...</p>
          <p className="text-sm text-muted-foreground/80 mt-2">Fetching real data from BigQuery...</p>
          {loadingError && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg max-w-md mx-auto">
              <p className="text-destructive text-sm">{loadingError}</p>
              <button 
                onClick={() => {
                  setLoadingError(null);
                  setLoading(true);
                  fetchH1BData();
                }}
                className="mt-2 px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded hover:bg-destructive/90"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
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

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'employers', label: 'Employers', icon: Building },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const ActionButton: React.FC<{
    label: string;
    variant: 'primary' | 'secondary';
    icon?: React.ReactNode;
    onClick?: () => void;
  }> = ({ label, variant, icon, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    status?: 'up' | 'down' | 'stable';
    icon: React.ReactNode;  
    color?: string;
  }> = ({ title, value, change, status, icon, color = 'primary' }) => (
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
  );

  // Just return the content without sidebar since DashboardLayout handles the sidebar
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
              {dashboardData?.isFromCache && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary text-xs font-medium">
                  <Database className="w-3 h-3" />
                  <span>Cached</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm lg:text-base">Real-time insights from BigQuery • Interactive data exploration</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchAndFilters
          filters={filters}
          setFilters={setFilters}
          isFilterOpen={false}
          setIsFilterOpen={() => {}} 
          filterOptions={{fiscalYears: [], states: [], jobCategories: []}}
          enableSemanticSearch={true}
          showSearchInstructions={false}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
        <MetricCard
          title="Total Applications"
          value={dashboardData.totalApplications.toLocaleString()}
          icon={<FileText className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Average Salary"
          value={`$${(dashboardData.avgSalary / 1000).toFixed(0)}K`}
          icon={<DollarSign className="w-6 h-6" />}
          color="success"
        />
        <MetricCard
          title="Unique Employers"
          value={dashboardData.uniqueEmployers.toLocaleString()}
          icon={<Building className="w-6 h-6" />}
          color="primary"
        />
        <MetricCard
          title="Approval Rate"
          value={`${dashboardData.certificationRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="success"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <VisualizationPanel
          dashboardData={dashboardData}
          chartsLoading={chartsLoading}
        />
        
        <TopEmployersTable dashboardData={dashboardData} />
      </div>
    </>
  );
};