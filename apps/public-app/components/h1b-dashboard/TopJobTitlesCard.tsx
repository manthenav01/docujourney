'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

interface JobTitleData {
  jobTitle: string
  applications: number
  percentage: number
  avgSalary: number
  yoyGrowth?: number | null
  yoyGrowthPercentage?: number | null
}

interface TopJobTitlesCardProps {
  data: JobTitleData[]
  loading?: boolean
  showYoYGrowth?: boolean
}

const TopJobTitlesCardComponent: React.FC<TopJobTitlesCardProps> = ({ data, loading, showYoYGrowth = false }) => {
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
          <CardTitle className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Top Job Titles
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

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Top Job Titles
        </CardTitle>
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
        <CardTitle className="text-lg font-semibold flex items-center">
          <Briefcase className="w-5 h-5 mr-2" />
          Top Job Titles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processedData.topJobTitles.map((item, index) => (
            <div
              key={item.jobTitle}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => handleJobClick(item.jobTitle)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-foreground">{item.jobTitle}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.applications.toLocaleString()} applications ({item.percentage.toFixed(1)}%)
                    </span>
                    {showYoYGrowth && item.yoyGrowth !== null && item.yoyGrowth !== undefined && item.yoyGrowthPercentage !== null && item.yoyGrowthPercentage !== undefined && (
                      <div className="flex items-center gap-1">
                        {item.yoyGrowth >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${
                          item.yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.yoyGrowth >= 0 ? '+' : ''}{item.yoyGrowth.toLocaleString()} 
                          ({item.yoyGrowthPercentage >= 0 ? '+' : ''}{item.yoyGrowthPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">
                  ${(item.avgSalary / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-muted-foreground">avg salary</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

TopJobTitlesCardComponent.displayName = 'TopJobTitlesCard';

export const TopJobTitlesCard = React.memo(TopJobTitlesCardComponent);
