'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { ReusableAreaChart } from './charts';
import { salaryDistributionColors } from '../../lib/chartColors';
import { DollarSign } from 'lucide-react';

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
      return { chartData: [] };
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
    const chartData = sortedData.map((item, index) => {
      // Extract min and max salary from range string for tooltip
      let minSalary = 0;
      let maxSalary = 0;
      
      switch (item.range) {
        case 'Under $90K':
          minSalary = 0;
          maxSalary = 90000;
          break;
        case '$90K - $130K':
          minSalary = 90000;
          maxSalary = 130000;
          break;
        case '$130K - $170K':
          minSalary = 130000;
          maxSalary = 170000;
          break;
        case '$170K - $220K':
          minSalary = 170000;
          maxSalary = 220000;
          break;
        case '$220K+':
          minSalary = 220000;
          maxSalary = 500000; // Cap for display purposes
          break;
      }
      
      return {
        name: item.range,
        value: item.count,
        originalData: {
          percentage: item.percentage,
          sortOrder: index + 1,
          total: sortedData.reduce((sum, curr) => sum + curr.count, 0),
          minSalary,
          maxSalary,
        },
      };
    });

    return {
      chartData,
    };
  }, [data]);

  // The ReusableAreaChart already has a custom tooltip, so we don't need this

  // Loading state component
  if (loading || !data || data.length === 0) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Salary Distribution
          </CardTitle>
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
        <CardTitle className="text-lg font-semibold flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Salary Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ReusableAreaChart
          data={processedData.chartData}
          height={400}
          curve="monotoneX"
          gradientId="salaryGradient"
        />
      </CardContent>
    </Card>
  );
};

SalaryDistributionChartComponent.displayName = 'SalaryDistributionChart';

export const SalaryDistributionChart = React.memo(SalaryDistributionChartComponent);
