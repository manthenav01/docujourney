'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@docujourney/ui';
import ReusableAreaChart from './ReusableAreaChart';
import { AreaChart, BarChart3, DollarSign } from 'lucide-react';
import { salaryDistributionColors, getSalaryRangeColor } from '../../../lib/chartColors';
import { useResponsiveChart } from '../../../hooks/useResponsiveChart';

/**
 * Standard salary distribution data interface
 */
export interface SalaryDistributionData {
  range: string;
  count: number;
  percentage?: number;
  minSalary?: number;
  maxSalary?: number;
}

/**
 * Props for the reusable salary distribution component
 */
export interface ReusableSalaryDistributionProps {
  data: SalaryDistributionData[];
  loading?: boolean;
  title?: string;
  showTitle?: boolean;
  height?: number;
  defaultChartType?: 'area' | 'bar';
  showChartToggle?: boolean;
  className?: string;
  compactSpacing?: boolean;
  onChartTypeChange?: (chartType: 'area' | 'bar') => void;
}

/**
 * Chart type toggle button component
 */
const ChartTypeToggle: React.FC<{
  chartType: 'area' | 'bar';
  onToggle: (type: 'area' | 'bar') => void;
  disabled?: boolean;
}> = ({ chartType, onToggle, disabled = false }) => (
  <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
    <Button
      variant={chartType === 'area' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onToggle('area')}
      disabled={disabled}
      className="h-8 px-3"
    >
      <AreaChart className="w-4 h-4 mr-1" />
      Area
    </Button>
    <Button
      variant={chartType === 'bar' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onToggle('bar')}
      disabled={disabled}
      className="h-8 px-3"
    >
      <BarChart3 className="w-4 h-4 mr-1" />
      Bar
    </Button>
  </div>
);

/**
 * Format number with commas
 */
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Process raw salary data into standardized 5-range format
 */
const processSalaryData = (data: SalaryDistributionData[]): SalaryDistributionData[] => {
  if (!data || data.length === 0) {
    return [];
  }

  // Define the 5 standard salary ranges as specified in requirements
  const standardRanges = [
    { range: 'Under $80K', min: 0, max: 80000, keywords: ['under', 'below', '< ', '60', '70', '75'] },
    { range: '$80K - $120K', min: 80000, max: 120000, keywords: ['80', '90', '100', '110', '115'] },
    { range: '$120K - $160K', min: 120000, max: 160000, keywords: ['120', '130', '140', '150', '155'] },
    { range: '$160K - $200K', min: 160000, max: 200000, keywords: ['160', '170', '180', '190', '195'] },
    { range: '$200K+', min: 200000, max: Infinity, keywords: ['200', '210', '220', '230', '240', '250'] },
  ];

  // Group data into standard ranges
  const groupedData = standardRanges.map(standardRange => {
    const matchingItems = data.filter(item => {
      const rangeText = item.range.toLowerCase();
      return standardRange.keywords.some(keyword => rangeText.includes(keyword));
    });

    const totalCount = matchingItems.reduce((sum, item) => sum + item.count, 0);
    const totalPercentage = matchingItems.reduce((sum, item) => sum + (item.percentage || 0), 0);

    return {
      range: standardRange.range,
      count: totalCount,
      percentage: totalPercentage,
      minSalary: standardRange.min,
      maxSalary: standardRange.max === Infinity ? 500000 : standardRange.max, // Cap for display
    };
  });

  // Filter out ranges with no data and recalculate percentages if needed
  const filteredData = groupedData.filter(item => item.count > 0);
  
  // Recalculate percentages if they weren't provided or don't sum to 100
  const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
  if (totalCount > 0) {
    filteredData.forEach(item => {
      if (!item.percentage || item.percentage === 0) {
        item.percentage = (item.count / totalCount) * 100;
      }
    });
  }

  return filteredData;
};

/**
 * Convert processed data to area chart format
 */
const convertToAreaChartData = (data: SalaryDistributionData[]) => {
  return data.map((item, index) => ({
    name: item.range,
    value: item.count,
    originalData: {
      percentage: item.percentage || 0,
      sortOrder: index + 1,
      total: data.reduce((sum, curr) => sum + curr.count, 0),
      minSalary: item.minSalary || 0,
      maxSalary: item.maxSalary || 0,
    },
  }));
};


/**
 * Main reusable salary distribution component
 */
const ReusableSalaryDistributionComponent: React.FC<ReusableSalaryDistributionProps> = ({
  data,
  loading = false,
  title = 'Salary Distribution',
  showTitle = true,
  height = 400,
  defaultChartType = 'area',
  showChartToggle = true,
  className = '',
  compactSpacing = true,
  onChartTypeChange,
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>(defaultChartType);

  // Memoize responsive chart config to prevent infinite re-renders
  const responsiveConfig = useMemo(() => ({
    defaultHeight: height,
    defaultMargin: { top: 40, right: 40, bottom: 80, left: 80 },
    mobileHeight: Math.min(height * 0.7, 250),
  }), [height]);

  // Responsive dimensions
  const { height: responsiveHeight } = useResponsiveChart(responsiveConfig);

  // Process and memoize the salary data
  const processedData = useMemo(() => processSalaryData(data), [data]);

  // Memoize chart data conversions
  const areaChartData = useMemo(() => convertToAreaChartData(processedData), [processedData]);

  // Handle chart type toggle
  const handleChartTypeToggle = useCallback((newType: 'area' | 'bar') => {
    setChartType(newType);
    onChartTypeChange?.(newType);
  }, [onChartTypeChange]);


  // Loading state
  if (loading) {
    return (
      <Card className={`h-[${height + 100}px] ${className}`}>
        {showTitle && (
          <CardHeader className={`flex flex-row items-center justify-between ${compactSpacing ? 'pb-4' : ''}`}>
            <CardTitle className="text-lg font-semibold flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              {title}
            </CardTitle>
            {showChartToggle && (
              <ChartTypeToggle
                chartType={chartType}
                onToggle={handleChartTypeToggle}
                disabled={true}
              />
            )}
          </CardHeader>
        )}
        <CardContent className={`h-[${height}px] ${showTitle && compactSpacing ? 'pt-0' : ''}`}>
          {chartType === 'area' ? (
            <ReusableAreaChart
              data={[]}
              height={responsiveHeight}
              loading={true}
            />
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div className="bg-muted h-2 rounded-full animate-pulse" style={{ width: `${70 - i * 10}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!processedData || processedData.length === 0) {
    return (
      <Card className={`h-[${height + 100}px] ${className}`}>
        {showTitle && (
          <CardHeader className={`flex flex-row items-center justify-between ${compactSpacing ? 'pb-4' : ''}`}>
            <CardTitle className="text-lg font-semibold flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              {title}
            </CardTitle>
            {showChartToggle && (
              <ChartTypeToggle
                chartType={chartType}
                onToggle={handleChartTypeToggle}
                disabled={true}
              />
            )}
          </CardHeader>
        )}
        <CardContent className={`h-[${height}px] ${showTitle && compactSpacing ? 'pt-0' : ''}`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">No salary data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main component render
  return (
    <Card className={`w-full chart-card ${className}`}>
      {showTitle && (
        <CardHeader className={`flex flex-row items-center justify-between ${compactSpacing ? 'pb-2 px-3' : 'pb-4'}`}>
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            {title}
          </CardTitle>
          {showChartToggle && (
            <ChartTypeToggle
              chartType={chartType}
              onToggle={handleChartTypeToggle}
            />
          )}
        </CardHeader>
      )}
      <CardContent className={`${showTitle && compactSpacing ? 'pt-0 px-2 pb-2' : 'p-4'}`}>
        {chartType === 'area' ? (
          <ReusableAreaChart
            data={areaChartData}
            height={responsiveHeight}
            curve="monotoneX"
            gradientId="salaryGradient"
          />
        ) : (
          <div className="space-y-4">
            {processedData.map((item, index) => {
              const maxCount = Math.max(...processedData.map(d => d.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const displayPercentage = item.percentage || 0;
              
              return (
                <div key={item.range} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{item.range}</span>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(item.count)} ({displayPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getSalaryRangeColor(index),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

ReusableSalaryDistributionComponent.displayName = 'ReusableSalaryDistribution';

export const ReusableSalaryDistribution = React.memo(ReusableSalaryDistributionComponent);