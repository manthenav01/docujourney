'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { Building2, TrendingUp, TrendingDown } from 'lucide-react';

interface EmployerData {
  employer: string
  applications: number
  percentage?: number
  avgSalary: number
  yoyGrowth?: number | null
  yoyGrowthPercentage?: number | null
}

interface TopEmployersCardProps {
  data: EmployerData[]
  loading?: boolean
  showYoYGrowth?: boolean
  title?: string
}

const TopEmployersCardComponent: React.FC<TopEmployersCardProps> = ({ 
  data, 
  loading, 
  showYoYGrowth = false,
  title = 'Top Employers',
}) => {
  const router = useRouter();

  const handleEmployerClick = useCallback((employerName: string) => {
    const employerSlug = employerName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/h1b-dashboard/company/${encodeURIComponent(employerSlug)}?name=${encodeURIComponent(employerName)}`);
  }, [router]);

  // Calculate percentage if not provided
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { topEmployers: [], maxApplications: 0, totalApplications: 0 };
    }
    
    const topEmployers = data.slice(0, 5).map(employer => ({
      ...employer,
      percentage: employer.percentage ?? ((employer.applications / data.reduce((sum, e) => sum + e.applications, 0)) * 100),
    }));
    const maxApplications = Math.max(...topEmployers.map(item => item.applications));
    const totalApplications = topEmployers.reduce((sum, item) => sum + item.applications, 0);
    
    return { topEmployers, maxApplications, totalApplications };
  }, [data]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            {title}
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
            <Building2 className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No employer data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {processedData.topEmployers.map((item, index) => {
          return (
            <div
              key={item.employer}
              className="group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
              onClick={() => handleEmployerClick(item.employer)}
            >
              {/* Content */}
              <div className="flex items-center justify-between">
                {/* Left side: Rank and employer name */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.employer}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.applications.toLocaleString()} applications
                      </span>
                      {item.percentage && (
                        <>
                          <span className="text-xs text-muted-foreground/60">•</span>
                          <span className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </>
                      )}
                      {showYoYGrowth && item.yoyGrowth !== null && item.yoyGrowth !== undefined && item.yoyGrowthPercentage !== null && item.yoyGrowthPercentage !== undefined && (
                        <>
                          <span className="text-xs text-muted-foreground/60">•</span>
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
                        </>
                      )}
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
            <span>Showing top 5 employers</span>
            <span>
              {processedData.totalApplications.toLocaleString()} total applications
            </span>
          </div>
          {!showYoYGrowth && (
            <div className="mt-2 p-2 bg-muted/10 rounded-lg border border-dashed border-muted">
              <div className="text-xs text-muted-foreground text-center">
                💡 YoY growth data requires historical employer analytics by year
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

TopEmployersCardComponent.displayName = 'TopEmployersCard';

export const TopEmployersCard = React.memo(TopEmployersCardComponent);