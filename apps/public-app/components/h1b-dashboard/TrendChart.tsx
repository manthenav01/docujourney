'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { ReusableBarChart, type BarChartData } from './charts';

interface TrendChartProps {
  data: Array<{
    fiscalYear: string;
    applications: number;
    avgSalary: number;
    medianSalary: number;
  }>;
  isActive: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, isActive }) => {
  const [activeTimeframe, setActiveTimeframe] = useState('1mo');

  // Simplified categories for trend analysis
  const categories = [
    { name: 'Applications', color: '#3b82f6', key: 'applications' },
    { name: 'Approvals', color: '#059669', key: 'approvals' },
    { name: 'Avg Salary', color: '#d97706', key: 'avgSalary' },
  ];

  // Convert fiscal year data to trend chart format
  const trendData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map((item): BarChartData => ({
      year: item.fiscalYear,
      applications: item.applications,
      approvals: Math.floor(item.applications * 0.85), // Assume 85% approval rate
      avgSalary: Math.floor(item.avgSalary / 1000), // Convert to thousands for better display
    }));
  }, [data]);

  const applicationsData = useMemo(() => {
    return trendData.map(item => ({
      year: item.year,
      value: item.applications as number,
    }));
  }, [trendData]);

  const approvalsData = useMemo(() => {
    return trendData.map(item => ({
      year: item.year,
      value: item.approvals as number,
    }));
  }, [trendData]);

  if (!isActive) {return null;}

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full p-6 bg-card rounded-lg border">
        <div className="text-center py-20">
          <div className="text-muted-foreground">No trend data available</div>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full w-full p-6 bg-card rounded-lg border">
      {/* Two panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* Applications Panel */}
        <Card className="bg-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Applications Trend</CardTitle>
              <div className="flex bg-background rounded-lg p-1 shadow-sm">
                {['24h', '7d', '1mo'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setActiveTimeframe(timeframe)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                      activeTimeframe === timeframe
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ReusableBarChart
              data={applicationsData}
              keys={['value']}
              indexBy="year"
              height={300}
              colors={['#3b82f6']}
              axisBottomLegend="Fiscal Year"
              axisLeftLegend="Applications"
              formatValue={(value) => value.toLocaleString()}
              margin={{ top: 20, right: 30, bottom: 60, left: 70 }}
            />
          </CardContent>
        </Card>

        {/* Approvals Panel */}
        <Card className="bg-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">Approvals Trend</CardTitle>
              <div className="flex bg-background rounded-lg p-1 shadow-sm">
                {['24h', '7d', '1mo'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setActiveTimeframe(timeframe)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                      activeTimeframe === timeframe
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ReusableBarChart
              data={approvalsData}
              keys={['value']}
              indexBy="year"
              height={300}
              colors={['#059669']}
              axisBottomLegend="Fiscal Year"
              axisLeftLegend="Approvals"
              formatValue={(value) => value.toLocaleString()}
              margin={{ top: 20, right: 30, bottom: 60, left: 70 }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
