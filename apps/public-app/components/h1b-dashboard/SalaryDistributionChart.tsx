'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { ReusableAreaChart } from './charts';
import { salaryDistributionColors } from '../../lib/chartColors';

interface SalaryDistributionData {
  range: string;
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature for compatibility with @nivo/bar
}

interface SalaryDistributionChartProps {
  data: SalaryDistributionData[]
  loading?: boolean
}

const SalaryDistributionChartComponent: React.FC<SalaryDistributionChartProps> = ({ data, loading }) => {
  // Process data for the reusable area chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], statistics: { total: 0, average: 0, median: 0 } };
    }

    // Group salary ranges into 5 meaningful brackets for better clarity
    const groupedData = data.reduce((acc, item) => {
      let broadRange = '';
      let sortOrder = 0;
      const range = item.range.toLowerCase();
      
      if (range.includes('under') || range.includes('below') || range.includes('< ') || 
          range.includes('60') || range.includes('70') || range.includes('80')) {
        broadRange = 'Under $90K';
        sortOrder = 1;
      } else if (range.includes('90') || range.includes('100') || range.includes('110') || range.includes('120')) {
        broadRange = '$90K - $130K';
        sortOrder = 2;
      } else if (range.includes('130') || range.includes('140') || range.includes('150') || range.includes('160')) {
        broadRange = '$130K - $170K';
        sortOrder = 3;
      } else if (range.includes('170') || range.includes('180') || range.includes('190') || range.includes('200') || range.includes('210')) {
        broadRange = '$170K - $220K';
        sortOrder = 4;
      } else {
        broadRange = '$220K+';
        sortOrder = 5;
      }
      
      const existing = acc.find(item => item.range === broadRange);
      if (existing) {
        existing.count += item.count;
        existing.percentage += item.percentage;
      } else {
        acc.push({
          range: broadRange,
          count: item.count,
          percentage: item.percentage,
          sortOrder,
        });
      }
      
      return acc;
    }, [] as (SalaryDistributionData & { sortOrder: number })[]);

    // Sort by salary range order
    const sortedData = groupedData.sort((a, b) => a.sortOrder - b.sortOrder);

    // Convert to area chart data format compatible with ReusableAreaChart
    const chartData = sortedData.map((item, index) => ({
      name: item.range,
      value: item.count,
      originalData: {
        percentage: item.percentage,
        sortOrder: index + 1,
        total: sortedData.reduce((sum, curr) => sum + curr.count, 0),
      },
    }));

    // Calculate statistics
    const totalApplications = sortedData.reduce((sum, item) => sum + item.count, 0);
    const averageApplications = sortedData.length > 0 ? totalApplications / sortedData.length : 0;
    const medianIndex = Math.floor(sortedData.length / 2);
    const medianApplications = sortedData[medianIndex]?.count || 0;

    return {
      chartData,
      statistics: {
        total: totalApplications,
        average: averageApplications,
        median: medianApplications,
      },
    };
  }, [data]);

  // The ReusableAreaChart already has a custom tooltip, so we don't need this

  // Loading state component
  if (loading || !data || data.length === 0) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Salary Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ReusableAreaChart
            data={[]}
            height={400}
            loading={loading}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Salary Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] relative">
        <ReusableAreaChart
          data={processedData.chartData}
          height={400}
          curve="monotoneX"
          gradientId="salaryGradient"
        />
        
        {/* Enhanced Statistical Overlay */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-md z-10">
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span>Key Metrics</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-0.5 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-slate-500">Average:</span>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {Math.round(processedData.statistics.average).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-0.5 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-500">Total:</span>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {processedData.statistics.total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-0.5 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-slate-500">Median:</span>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {Math.round(processedData.statistics.median).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

SalaryDistributionChartComponent.displayName = 'SalaryDistributionChart';

export const SalaryDistributionChart = React.memo(SalaryDistributionChartComponent);
