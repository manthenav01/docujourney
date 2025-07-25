'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';

interface JobTitleData {
  jobTitle: string
  applications: number
  percentage: number
  avgSalary: number
}

interface TopJobTitlesCardProps {
  data: JobTitleData[]
  loading?: boolean
}

const TopJobTitlesCardComponent: React.FC<TopJobTitlesCardProps> = ({ data, loading }) => {
  const router = useRouter();

  const handleJobClick = useCallback((jobTitle: string) => {
    const jobSlug = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/h1b-dashboard/job/${encodeURIComponent(jobSlug)}?title=${encodeURIComponent(jobTitle)}`);
  }, [router]);

  // Memoize processed data to prevent recalculation on every render
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { topJobTitles: [], maxApplications: 0, totalApplications: 0 };
    }
    
    const topJobTitles = data.slice(0, 5);
    const maxApplications = Math.max(...topJobTitles.map(item => item.applications));
    const totalApplications = topJobTitles.reduce((sum, item) => sum + item.applications, 0);
    
    return { topJobTitles, maxApplications, totalApplications };
  }, [data]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Job Titles</CardTitle>
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

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Job Titles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No job title data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Job Titles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {processedData.topJobTitles.map((item, index) => {
          const progressWidth = (item.applications / processedData.maxApplications) * 100;
          
          return (
            <div
              key={item.jobTitle}
              className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
              onClick={() => handleJobClick(item.jobTitle)}
            >
              {/* Content */}
              <div className="flex items-center justify-between">
                {/* Left side: Rank and job title */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.jobTitle}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.applications.toLocaleString()} applications
                      </span>
                      <span className="text-xs text-muted-foreground/60">•</span>
                      <span className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right side: Salary */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-primary">
                    ${(item.avgSalary / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-muted-foreground">avg salary</div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Summary footer */}
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Showing top 5 job titles</span>
            <span>
              {processedData.totalApplications.toLocaleString()} total applications
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

TopJobTitlesCardComponent.displayName = 'TopJobTitlesCard';

export const TopJobTitlesCard = React.memo(TopJobTitlesCardComponent);
