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
      // Only show a percentage when the caller provides one computed against a
      // real total — dividing by the sum of the displayed list produced numbers
      // like "31.7%" for a company with 9% of actual filings.
      percentage: employer.percentage,
    }));
    const maxApplications = Math.max(...topEmployers.map(item => item.applications));
    const totalApplications = topEmployers.reduce((sum, item) => sum + item.applications, 0);
    
    return { topEmployers, maxApplications, totalApplications };
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No employer data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processedData.topEmployers.map((item, index) => {
            return (
              <div
                key={item.employer}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => handleEmployerClick(item.employer)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{item.employer}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.applications.toLocaleString()} applications
                      </span>
                      {item.percentage && (
                        <>
                          <span className="text-sm text-muted-foreground/60">•</span>
                          <span className="text-sm text-muted-foreground">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </>
                      )}
                      {showYoYGrowth && item.yoyGrowth !== null && item.yoyGrowth !== undefined && item.yoyGrowthPercentage !== null && item.yoyGrowthPercentage !== undefined && (
                        <>
                          <span className="text-sm text-muted-foreground/60">•</span>
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
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    ${(item.avgSalary / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-muted-foreground">avg salary</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

TopEmployersCardComponent.displayName = 'TopEmployersCard';

export const TopEmployersCard = React.memo(TopEmployersCardComponent);