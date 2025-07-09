"use client";

import React, { useState, useEffect } from 'react';
import { FilterState, TabType } from './types';
import { SearchAndFilters } from './SearchAndFilters';
import { VisualizationPanel } from './VisualizationPanel';
import { TopEmployersTable } from './TopEmployersTable';
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
    jobCategories: []
  });
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    fiscalYears: [],
    salaryRange: [0, 500000],
    states: [],
    cities: [],
    jobCategories: [],
    skillLevels: [],
    companySizes: [],
    companyTypes: []
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('salary');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchFilterOptions(),
      fetchH1BData()
    ]);
  }, []);

  useEffect(() => {
    // Debounce the API call when filters change
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchH1BData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    if (dashboardData) {
      setChartsLoading(true);
      setTimeout(() => {
        setChartsLoading(false);
      }, 100);
    }
  }, [dashboardData, activeTab]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/h1b-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getFilterOptions' })
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
      
      if (filters.searchQuery.trim()) {
        params.append('searchQuery', filters.searchQuery.trim());
      }
      
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
        statesCount: data.stateDistribution?.length || 0
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
          applications: 0
        },
        topEmployers: [],
        salaryDistribution: [],
        yearlyTrends: [],
        stateDistribution: []
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              H1B Analytics Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time insights from BigQuery • Interactive data exploration
            </p>
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
          />
        </div>

        {/* Results Summary */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-gray-700">
            Showing results for {dashboardData.totalApplications.toLocaleString()} applications
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {filters.searchQuery && `Search: "${filters.searchQuery}" • `}
            {filters.fiscalYears.length > 0 && `Years: ${filters.fiscalYears.join(', ')} • `}
            {filters.states.length > 0 && `States: ${filters.states.join(', ')} • `}
            {filters.salaryRange[0] > 0 || filters.salaryRange[1] < 500000 ? 
              `Salary: $${filters.salaryRange[0].toLocaleString()} - $${filters.salaryRange[1].toLocaleString()}` : 
              'All data'
            }
          </p>
        </div>

        {/* Overview Card */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Applications */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData.totalApplications.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Applications</div>
              </div>

              {/* Average Salary */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  ${(dashboardData.avgSalary / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600 font-medium">Avg Salary</div>
              </div>

              {/* Unique Employers */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {dashboardData.uniqueEmployers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Employers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Card */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Application Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Certified */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {dashboardData.certifiedApplications.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Certified</div>
              </div>

              {/* Denied */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {dashboardData.deniedApplications.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Denied</div>
              </div>

              {/* Approval Rate */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {dashboardData.certificationRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Approval Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <VisualizationPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dashboardData={dashboardData}
            chartsLoading={chartsLoading}
          />
          
          <TopEmployersTable dashboardData={dashboardData} />
        </div>
      </div>
    </div>
  );
};