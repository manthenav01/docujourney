'use client';

import React, { useMemo, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getSalaryRangeColor, createNivoTheme } from '../../lib/chartColors';
import { ReusableBarChart, type BarChartData } from './charts';

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
  // Process data for the reusable bar chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], statistics: { total: 0, average: 0, median: 0 } };
    }

    // Group salary ranges into 5 meaningful brackets for better clarity
    const groupedData = data.reduce((acc, item) => {
      let broadRange = '';
      const range = item.range.toLowerCase();
      
      if (range.includes('under') || range.includes('below') || range.includes('< ') || 
          range.includes('60') || range.includes('70') || range.includes('80')) {
        broadRange = 'Under $90K';
      } else if (range.includes('90') || range.includes('100') || range.includes('110') || range.includes('120')) {
        broadRange = '$90K - $130K';
      } else if (range.includes('130') || range.includes('140') || range.includes('150') || range.includes('160')) {
        broadRange = '$130K - $170K';
      } else if (range.includes('170') || range.includes('180') || range.includes('190') || range.includes('200') || range.includes('210')) {
        broadRange = '$170K - $220K';
      } else {
        broadRange = '$220K+';
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
        });
      }
      
      return acc;
    }, [] as SalaryDistributionData[]);

    // Sort by salary range order
    const sortOrder = ['Under $90K', '$90K - $130K', '$130K - $170K', '$170K - $220K', '$220K+'];
    const sortedData = groupedData.sort((a, b) => sortOrder.indexOf(a.range) - sortOrder.indexOf(b.range));

    // Convert to chart data format
    const chartData: BarChartData[] = sortedData.map(item => ({
      range: item.range,
      count: item.count,
      percentage: item.percentage,
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

  // Custom tooltip for salary distribution
  const salaryTooltip = useCallback(({ indexValue, value, data: tooltipData }: any) => (
    <div className="bg-card/95 backdrop-blur-sm p-5 border border-border rounded-xl shadow-2xl">
      <div className="text-sm font-bold text-foreground mb-3 border-b border-border pb-2">{indexValue}</div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium">Applications:</span>
          <span className="text-sm font-bold text-primary">{value?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium">Share:</span>
          <span className="text-sm font-bold text-success">{tooltipData.percentage?.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">vs Average:</span>
          <span className={`text-sm font-semibold ${
            (value || 0) > processedData.statistics.average ? 'text-success' : 'text-warning'
          }`}>
            {processedData.statistics.average > 0 
              ? ((((value || 0) - processedData.statistics.average) / processedData.statistics.average) * 100).toFixed(0)
              : '0'
            }%
          </span>
        </div>
      </div>
    </div>
  ), [processedData.statistics.average]);

  // Salary range colors
  const salaryColors = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => getSalaryRangeColor(index));
  }, []);

  if (loading || !data || data.length === 0) {
    return (
      <ReusableBarChart
        data={[]}
        keys={['count']}
        indexBy="range"
        title="Salary Distribution"
        loading={loading}
        height={450}
        colors={salaryColors}
        axisBottomLegend="Salary Range"
        axisLeftLegend="Number of Applications"
        formatValue={(value) => `${(value / 1000).toFixed(0)}K`}
        innerPadding={0.2}
      />
    );
  }

  return (
    <div className="relative">
      <ReusableBarChart
        data={processedData.chartData}
        keys={['count']}
        indexBy="range"
        title="Salary Distribution"
        height={450}
        colors={salaryColors}
        axisBottomLegend="Salary Range"
        axisLeftLegend="Number of Applications"
        formatValue={(value) => `${(value / 1000).toFixed(0)}K`}
        customTooltip={salaryTooltip}
        margin={{ top: 40, right: 40, bottom: 80, left: 80 }}
        borderRadius={6}
        innerPadding={0.2}
      />
      
      {/* Statistical Overlay */}
      <div className="absolute top-16 right-12 bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm z-10">
        <div className="text-xs font-semibold text-foreground mb-2">Statistics</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span className="text-xs text-muted-foreground">
              Avg: {Math.round(processedData.statistics.average).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-success"></div>
            <span className="text-xs text-muted-foreground">
              Total: {processedData.statistics.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SalaryDistributionChartComponent.displayName = 'SalaryDistributionChart';

export const SalaryDistributionChart = React.memo(SalaryDistributionChartComponent);
