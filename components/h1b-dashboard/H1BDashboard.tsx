'use client';

import React, { useState, useEffect } from 'react';
import { FilterState } from './types';
import { SearchAndFilters } from './SearchAndFilters';
import { VisualizationPanel } from './VisualizationPanel';
import { TopEmployersTable } from './TopEmployersTable';
import { 
  BarChart3, 
  Home, 
  Users, 
  Settings, 
  Activity,
  TrendingUp,
  FileText,
  Building,
  DollarSign,
  XCircle,
  Share2,
  Eye,
  Pause,
  Settings2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
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
}

interface FilterOptions {
  fiscalYears: string[];
  states: string[];
  jobCategories: string[];
}

export const H1BDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<H1BDashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fiscalYears: [],
    states: [],
    jobCategories: [],
  });
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '', // Keep this for now but don't use it
    fiscalYears: [],
    salaryRange: [0, 500000],
    states: [],
    cities: [],
    jobCategories: [],
    skillLevels: [],
    companySizes: [],
    companyTypes: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchFilterOptions(),
      fetchH1BData(),
    ]);
  }, []);

  useEffect(() => {
    // Debounce the API call when filters change
    // Exclude searchQuery from dependencies since it's only used for autocomplete
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchH1BData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.fiscalYears, filters.salaryRange, filters.states, filters.cities, filters.jobCategories, filters.skillLevels, filters.companySizes, filters.companyTypes, loading]);

  useEffect(() => {
    if (dashboardData) {
      setChartsLoading(true);
      setTimeout(() => {
        setChartsLoading(false);
      }, 100);
    }
  }, [dashboardData]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/h1b-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getFilterOptions' }),
      });
      
      if (response.ok) {
        const options = await response.json();
        setFilterOptions(options);
        console.log('Filter options loaded:', options);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };


  const fetchH1BData = async () => {
    try {
      setChartsLoading(true);
      
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
      });
    } finally {
      setLoading(false);
      setChartsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading H1B Dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Fetching real data from BigQuery...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500 mt-2">Please check the console for more details</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
  }> = ({ title, value, change, status, icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 bg-${color}-50 rounded-lg text-${color}-600`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            status === 'up' ? 'text-green-600' : 
            status === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {status === 'up' && <ArrowUp className="w-4 h-4" />}
            {status === 'down' && <ArrowDown className="w-4 h-4" />}
            {change}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">H1B Analytics</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNavItem(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeNavItem === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 border border-gray-200"
            >
              <BarChart3 className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 text-sm lg:text-base">Real-time insights from BigQuery • Interactive data exploration</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchAndFilters
            filters={filters}
            setFilters={setFilters}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterOptions={filterOptions}
            enableSemanticSearch={true}
            showSearchInstructions={true}
          />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <MetricCard
            title="Total Applications"
            value={dashboardData.totalApplications.toLocaleString()}
            icon={<FileText className="w-6 h-6" />}
            color="gray"
          />
          <MetricCard
            title="Average Salary"
            value={`$${(dashboardData.avgSalary / 1000).toFixed(0)}K`}
            icon={<DollarSign className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Unique Employers"
            value={dashboardData.uniqueEmployers.toLocaleString()}
            icon={<Building className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            title="Approval Rate"
            value={`${dashboardData.certificationRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
        </div>


        {/* Main Content */}
        <div className="space-y-8">
          <VisualizationPanel
            dashboardData={dashboardData}
            chartsLoading={chartsLoading}
          />
          
          <TopEmployersTable dashboardData={dashboardData} />
        </div>
      </div>
    </div>
  );
};