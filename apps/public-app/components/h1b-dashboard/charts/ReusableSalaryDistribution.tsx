'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@docujourney/ui';
import { AreaChart, BarChart3, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getSalaryRangeColor, salaryDistributionColors } from '../../../lib/chartColors';

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
      className="h-8 px-3 text-xs"
    >
      <AreaChart className="w-3 h-3 mr-1" />
      Area
    </Button>
    <Button
      variant={chartType === 'bar' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onToggle('bar')}
      disabled={disabled}
      className="h-8 px-3 text-xs"
    >
      <BarChart3 className="w-3 h-3 mr-1" />
      Bar
    </Button>
  </div>
);

/**
 * Format number with commas
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format salary range labels responsively
 */
const formatSalaryLabel = (range: string, isMobile: boolean = false): string => {
  const labelMappings: { [key: string]: { mobile: string; desktop: string } } = {
    'Under $80K': { mobile: '<80K', desktop: '<80K' },
    '$80K - $120K': { mobile: '80-120K', desktop: '80-120K' },
    '$120K - $160K': { mobile: '120-160K', desktop: '120-160K' },
    '$160K - $200K': { mobile: '160-200K', desktop: '160-200K' },
    '$200K+': { mobile: '200K+', desktop: '200K+' },
  };

  const mapping = labelMappings[range];
  if (mapping) {
    return isMobile ? mapping.mobile : mapping.desktop;
  }
  
  // Fallback for any unrecognized ranges
  return range.replace(/\$|Under |Over /, '').replace(' - ', '-');
};

/**
 * Custom tooltip component for area chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  const value = payload[0].value;
  // Use original name if available, otherwise fall back to label
  const displayLabel = data.originalName || label;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="space-y-2">
        <div className="font-semibold text-foreground text-sm">
          {displayLabel}
        </div>
        
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: salaryDistributionColors.line }}
          />
          <span className="text-muted-foreground text-xs">Count:</span>
          <span className="font-semibold text-foreground text-xs">
            {formatNumber(value)}
          </span>
        </div>

        {data.percentage && (
          <div className="text-xs text-muted-foreground">
            {data.percentage.toFixed(1)}% of total
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Responsive container wrapper that adapts to screen size
 */
const ResponsiveChartWrapper: React.FC<{
  children: React.ReactNode;
  height: number;
}> = ({ children, height }) => {
  // Calculate responsive dimensions with better space utilization
  const responsiveHeight = useMemo(() => {
    if (typeof window === 'undefined') {
      return height;
    }
    
    const width = window.innerWidth;
    if (width < 375) {
      return Math.max(height * 0.7, 240); // Slightly taller for very small screens
    }
    if (width < 640) {
      return Math.max(height * 0.8, 260); // Better height for mobile
    }
    if (width < 1024) {
      return Math.max(height * 0.9, 300); // Better height for tablets
    }
    return height;
  }, [height]);

  return (
    <div className="w-full" style={{ height: responsiveHeight }}>
      {children}
    </div>
  );
};

/**
 * Process raw salary data into standardized format
 */
const processSalaryData = (data: SalaryDistributionData[]): SalaryDistributionData[] => {
  if (!data || data.length === 0) {
    return [];
  }

  // Standard salary ranges
  const standardRanges = [
    { range: 'Under $80K', keywords: ['under', 'below', '< ', '60', '70', '75'] },
    { range: '$80K - $120K', keywords: ['80', '90', '100', '110', '115'] },
    { range: '$120K - $160K', keywords: ['120', '130', '140', '150', '155'] },
    { range: '$160K - $200K', keywords: ['160', '170', '180', '190', '195'] },
    { range: '$200K+', keywords: ['200', '210', '220', '230', '240', '250'] },
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
      percentage: totalPercentage || (totalCount > 0 ? 0 : 0),
    };
  });

  // Filter out ranges with no data and recalculate percentages
  const filteredData = groupedData.filter(item => item.count > 0);
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
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="w-full animate-pulse" style={{ height }}>
    <div className="h-full bg-gradient-to-b from-muted/20 to-muted/10 rounded-lg flex items-end justify-between p-4 space-x-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-muted/40 rounded-t flex-1"
          style={{
            height: `${Math.random() * 60 + 20}%`,
            maxWidth: '18%',
          }}
        />
      ))}
    </div>
  </div>
);

/**
 * Bar chart visualization component
 */
const BarChartVisualization: React.FC<{
  data: SalaryDistributionData[];
}> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-3 p-2">
      {data.map((item, index) => {
        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const displayPercentage = item.percentage || 0;
        
        return (
          <div key={item.range} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground text-sm">{item.range}</span>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  {formatNumber(item.count)} ({displayPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 ease-out" 
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
  );
};

/**
 * Area chart visualization component
 */
const AreaChartVisualization: React.FC<{
  data: SalaryDistributionData[];
  height: number;
}> = ({ data, height }) => {
  // Detect if mobile screen
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  }, []);

  const chartData = useMemo(() => 
    data.map(item => ({
      name: formatSalaryLabel(item.range, isMobile),
      originalName: item.range, // Keep original for tooltip
      value: item.count,
      percentage: item.percentage || 0,
    })), [data, isMobile],
  );

  const maxValue = useMemo(() => 
    Math.max(...chartData.map(d => d.value)) * 1.1, [chartData],
  );

  // Responsive margins based on screen size and label rotation
  const chartMargins = useMemo(() => {
    if (isMobile) {
      return {
        top: 5,
        right: 10,
        left: 15,
        bottom: 35, // Reduced for mobile
      };
    }
    return {
      top: 10,
      right: 20,
      left: 20,
      bottom: 45, // Reduced from 60
    };
  }, [isMobile]);

  return (
    <ResponsiveChartWrapper height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={chartData}
          margin={chartMargins}
        >
          <defs>
            <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="0%" 
                stopColor={salaryDistributionColors.gradient.startColor}
                stopOpacity={0.8}
              />
              <stop 
                offset="50%" 
                stopColor={salaryDistributionColors.gradient.startColor}
                stopOpacity={0.3}
              />
              <stop 
                offset="100%" 
                stopColor={salaryDistributionColors.gradient.endColor}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={salaryDistributionColors.grid}
            strokeOpacity={0.3}
          />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: isMobile ? 10 : 11,
              fill: salaryDistributionColors.text,
              fontWeight: 500,
            }}
            angle={isMobile ? -15 : -20}
            textAnchor="middle"
            height={isMobile ? 35 : 45}
            interval={0}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fill: salaryDistributionColors.text,
              fontWeight: 400,
            }}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            domain={[0, maxValue]}
            width={35}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotoneX"
            dataKey="value"
            stroke={salaryDistributionColors.line}
            strokeWidth={2}
            fill="url(#salaryGradient)"
            fillOpacity={1}
            dot={{
              fill: salaryDistributionColors.line,
              strokeWidth: 2,
              stroke: '#fff',
              r: 3,
            }}
            activeDot={{
              r: 5,
              fill: salaryDistributionColors.line,
              stroke: '#fff',
              strokeWidth: 2,
              style: { 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              },
            }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ResponsiveChartWrapper>
  );
};

/**
 * Main reusable salary distribution component
 */
const ReusableSalaryDistribution: React.FC<ReusableSalaryDistributionProps> = ({
  data,
  loading = false,
  title = 'Salary Distribution',
  showTitle = true,
  height = 350,
  defaultChartType = 'area',
  showChartToggle = true,
  className = '',
  onChartTypeChange,
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>(defaultChartType);

  // Process and memoize the salary data
  const processedData = useMemo(() => processSalaryData(data), [data]);

  // Handle chart type toggle
  const handleChartTypeToggle = useCallback((newType: 'area' | 'bar') => {
    setChartType(newType);
    onChartTypeChange?.(newType);
  }, [onChartTypeChange]);

  // Loading state
  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        {showTitle && (
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
        <CardContent className="p-4">
          <LoadingSkeleton height={height} />
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!processedData || processedData.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        {showTitle && (
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground text-sm">No salary data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main component render
  return (
    <Card className={`w-full ${className}`}>
      {showTitle && (
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
      <CardContent className="p-4 pt-2">
        {chartType === 'area' ? (
          <AreaChartVisualization data={processedData} height={height} />
        ) : (
          <BarChartVisualization data={processedData} />
        )}
      </CardContent>
    </Card>
  );
};

ReusableSalaryDistribution.displayName = 'ReusableSalaryDistribution';

export { ReusableSalaryDistribution };
export default ReusableSalaryDistribution;