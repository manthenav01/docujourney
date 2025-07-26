'use client';

import React, { useMemo, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getChartColor, createNivoTheme } from '../../../lib/chartColors';

export interface ProgressChartData {
  label: string;
  value: number;
  maxValue?: number;
  percentage?: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface ReusableProgressChartProps {
  data: ProgressChartData[];
  title?: string;
  loading?: boolean;
  height?: number;
  colors?: string[];
  showPercentage?: boolean;
  showValues?: boolean;
  orientation?: 'horizontal' | 'vertical';
  maxBars?: number;
  formatValue?: (value: number) => string;
  customTooltip?: (props: any) => React.ReactNode;
  animate?: boolean;
}

const ReusableProgressChartComponent: React.FC<ReusableProgressChartProps> = ({
  data,
  title,
  loading = false,
  height = 300,
  colors,
  showPercentage = true,
  showValues = true,
  orientation = 'horizontal',
  maxBars = 10,
  formatValue = (value) => value.toLocaleString(),
  customTooltip,
  animate = true,
}) => {
  // Process data for progress chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Limit number of bars and calculate percentages if not provided
    const limitedData = data.slice(0, maxBars);
    const maxValue = Math.max(...limitedData.map(item => item.maxValue || item.value));
    
    return limitedData.map((item, index) => ({
      ...item,
      percentage: item.percentage || ((item.value / maxValue) * 100),
      displayValue: item.value,
      normalizedValue: (item.value / maxValue) * 100,
      color: item.color || (colors ? colors[index % colors.length] : getChartColor(index, CHART_COLOR_ARRAYS.standard)),
    }));
  }, [data, maxBars, colors]);

  // Memoize the Nivo theme
  const nivoTheme = useMemo(() => createNivoTheme(), []);

  // Color function for bars
  const getColorForBar = useCallback((bar: any) => {
    const item = processedData.find(d => d.label === bar.indexValue);
    return item?.color || getChartColor(0, CHART_COLOR_ARRAYS.standard);
  }, [processedData]);

  // Default tooltip component
  const DefaultTooltip = useCallback(({ indexValue, value, data: tooltipData }: any) => {
    const item = processedData.find(d => d.label === indexValue);
    return (
      <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
        <div className="text-sm font-semibold text-foreground mb-3">{indexValue}</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Value:</span>
            <span className="text-sm font-medium text-primary">
              {formatValue(item?.displayValue || 0)}
            </span>
          </div>
          {showPercentage && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Percentage:</span>
              <span className="text-sm font-medium text-success">
                {(item?.percentage || 0).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }, [processedData, formatValue, showPercentage]);

  const tooltipComponent = customTooltip || DefaultTooltip;

  // Transform data for Nivo
  const chartData = useMemo(() => {
    return processedData.map(item => ({
      label: item.label,
      value: item.normalizedValue,
      displayValue: item.displayValue,
      percentage: item.percentage,
    }));
  }, [processedData]);

  if (loading) {
    return (
      <Card className="w-full">
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3" style={{ height: `${height}px` }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-24 h-4 bg-muted rounded animate-pulse"></div>
                <div className="flex-1 h-4 bg-muted/50 rounded animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
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
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartContent = orientation === 'horizontal' ? (
    // Horizontal progress bars using CSS (more appropriate for progress visualization)
    <div className="space-y-4">
      {processedData.map((item, index) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground text-sm">{item.label}</span>
            <div className="flex items-center space-x-2">
              {showValues && (
                <span className="text-sm text-muted-foreground">{formatValue(item.displayValue)}</span>
              )}
              {showPercentage && (
                <span className="text-sm text-muted-foreground">({item.percentage?.toFixed(1)}%)</span>
              )}
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ 
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    // Vertical bar chart using Nivo
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveBar
        data={chartData}
        keys={['value']}
        indexBy="label"
        margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear', min: 0, max: 100 }}
        indexScale={{ type: 'band', round: true }}
        colors={getColorForBar}
        borderRadius={4}
        borderWidth={0}
        theme={nivoTheme}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: -45,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: 0,
          format: showPercentage ? (value) => `${value}%` : undefined,
        }}
        enableGridX={false}
        enableGridY={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#FFFFFF"
        tooltip={tooltipComponent}
        animate={animate}
        motionConfig="gentle"
      />
    </div>
  );

  if (title) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: `${height}px` }}>
            {chartContent}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div style={{ height: `${height}px` }}>
      {chartContent}
    </div>
  );
};

ReusableProgressChartComponent.displayName = 'ReusableProgressChart';

export const ReusableProgressChart = React.memo(ReusableProgressChartComponent);