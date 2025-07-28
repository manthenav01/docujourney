'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { TrendingUp, TrendingDown, LineChart } from 'lucide-react';

export interface YearlyTrend {
  fiscalYear: string;
  applications: number;
  avgSalary: number;
  certificationRate: number;
}

interface MarketTrendsCardProps {
  data: YearlyTrend[];
  title?: string;
  showSalary?: boolean;
  showCertificationRate?: boolean;
  maxYears?: number;
}

export const MarketTrendsCard: React.FC<MarketTrendsCardProps> = ({
  data,
  title = 'Market Trends',
  showSalary = true,
  showCertificationRate = true,
  maxYears = 5,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Sort years chronologically and limit to last N years
  const sortedYears = [...data]
    .sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear))
    .slice(-maxYears);
  
  // Calculate YOY growth for yearly trends
  const yearlyTrendsWithGrowth = sortedYears.map((year, index) => {
    let yoyGrowth = null;
    let yoyGrowthPercentage = null;
    
    // Compare with previous year (index - 1)
    if (index > 0) {
      const previousYear = sortedYears[index - 1];
      yoyGrowth = year.applications - previousYear.applications;
      yoyGrowthPercentage = previousYear.applications > 0 
        ? ((yoyGrowth / previousYear.applications) * 100)
        : 0;
    }
    
    return {
      ...year,
      yoyGrowth,
      yoyGrowthPercentage,
    };
  }).reverse(); // Reverse to show most recent year first

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LineChart className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {yearlyTrendsWithGrowth.map((year) => (
            <div key={year.fiscalYear} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  {year.fiscalYear.slice(-2)}
                </div>
                <div>
                  <div className="font-medium text-foreground">FY {year.fiscalYear}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(year.applications)} applications
                    </span>
                    {year.yoyGrowth !== null && (
                      <div className="flex items-center gap-1">
                        {year.yoyGrowth >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${
                          year.yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {year.yoyGrowth >= 0 ? '+' : ''}{formatNumber(year.yoyGrowth)} 
                          ({year.yoyGrowthPercentage >= 0 ? '+' : ''}{year.yoyGrowthPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {showSalary && (
                  <div className="font-semibold text-foreground">
                    {formatCurrency(year.avgSalary)}
                  </div>
                )}
                {showCertificationRate && (
                  <div className="text-xs text-muted-foreground">
                    {year.certificationRate.toFixed(1)}% certified
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};