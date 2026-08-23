'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CheckCircle } from 'lucide-react';
import { H1BJobTitleDistribution, H1BQueryFilters } from '../../lib/types';
import { formatJobTitle } from '../../lib/utils/stringUtils';
import { slugify } from '@docujourney/utils';

interface TopCertifiedJobsCardProps {
  filters?: H1BQueryFilters;
  loading?: boolean;
}

const TopCertifiedJobsCardComponent: React.FC<TopCertifiedJobsCardProps> = ({ 
  filters = {},
  loading = false,
}) => {
  const [certifiedJobsData, setCertifiedJobsData] = useState<H1BJobTitleDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Map<string, H1BJobTitleDistribution[]>>(new Map());

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

  // Memoize filters to prevent unnecessary re-renders and re-fetches
  const memoizedFilters = useMemo(() => {
    return {
      fiscalYears: filters.fiscalYears,
      states: filters.states,
      salaryRange: filters.salaryRange,
    };
  }, [filters.fiscalYears, filters.states, filters.salaryRange]);

  // Create cache key from filters
  const cacheKey = useMemo(() => {
    return JSON.stringify(memoizedFilters);
  }, [memoizedFilters]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format salary compactly
  const formatSalary = (salary: number) => {
    if (salary >= 1000000) {
      return `$${(salary / 1000000).toFixed(1)}M`;
    }
    if (salary >= 1000) {
      return `$${(salary / 1000).toFixed(0)}K`;
    }
    return `$${salary}`;
  };

  // Fetch certified job titles data
  useEffect(() => {
    const fetchCertifiedJobs = async () => {
      // Check cache first
      if (cache.has(cacheKey)) {
        console.log('Using cached data for certified jobs');
        setCertifiedJobsData(cache.get(cacheKey)!);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (memoizedFilters.fiscalYears?.length) {
          params.append('fiscalYears', memoizedFilters.fiscalYears.join(','));
        } else {
          // Default to current fiscal year
          params.append('fiscalYears', getCurrentFiscalYear());
        }
        
        if (memoizedFilters.states?.length) {
          params.append('states', memoizedFilters.states.join(','));
        }
        
        if (memoizedFilters.salaryRange) {
          params.append('salaryRange', memoizedFilters.salaryRange.join(','));
        }
        
        console.log('Fetching certified jobs data with params:', params.toString(), 'cacheKey:', cacheKey);
        
        const response = await fetch(`/api/h1b-data/certified-jobs?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        
        if (apiResponse.error) {
          throw new Error(apiResponse.error.message || 'API error occurred');
        }
        
        const data = apiResponse.data || [];
        console.log('Fetched certified jobs data:', data.length, 'items');
        setCertifiedJobsData(data);
        
        // Cache the result
        setCache(prev => new Map(prev).set(cacheKey, data));
        
      } catch (err) {
        console.error('Error fetching certified jobs data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertifiedJobs();
  }, [memoizedFilters, cacheKey]);

  // Process the data for display
  const processedData = useMemo(() => {
    if (!certifiedJobsData || certifiedJobsData.length === 0) {
      return { topCertifiedJobs: [], totalApplications: 0 };
    }
    
    const topCertifiedJobs = certifiedJobsData.slice(0, 5); // Show top 5 most certified job titles
    const totalApplications = topCertifiedJobs.reduce((sum, job) => sum + job.applications, 0);
    
    return { topCertifiedJobs, totalApplications };
  }, [certifiedJobsData]);

  if (loading || isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Top Certified Job Titles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded w-48"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Top Certified Job Titles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground text-center">
              <p>Failed to load certification data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!certifiedJobsData || certifiedJobsData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Top Certified Job Titles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No job certification data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Top Certified Job Titles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {processedData.topCertifiedJobs.map((job, index) => {
            const jobSlug = slugify(formatJobTitle(job.jobTitle));
            const href = `/h1b-dashboard/job/${jobSlug}?title=${encodeURIComponent(formatJobTitle(job.jobTitle))}`;
            
            return (
              <Link
                key={`${job.jobTitle}-${index}`}
                href={href}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer block"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      {formatJobTitle(job.jobTitle).length > 35 
                        ? `${formatJobTitle(job.jobTitle).substring(0, 35)}...` 
                        : formatJobTitle(job.jobTitle)
                      }
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {formatNumber(job.applications)} applications
                      </span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="text-muted-foreground">
                        {formatSalary(job.avgSalary)} avg
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-foreground">
                    {job.certificationRate?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-xs text-muted-foreground">certified</div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

TopCertifiedJobsCardComponent.displayName = 'TopCertifiedJobsCard';

export const TopCertifiedJobsCard = React.memo(TopCertifiedJobsCardComponent);