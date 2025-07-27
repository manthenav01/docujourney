'use client';

import React, { useMemo, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getChartColor, createNivoTheme } from '../../../lib/chartColors';

export interface ActivityChartData {
  period: string;
  value: number;
  [key: string]: string | number;
}

export interface ReusableActivityChartProps {
  data: ActivityChartData[];
  title?: string;
  loading?: boolean;
  height?: number;
  colors?: string[];
  valueKey?: string;
  periodKey?: string;
  showGrid?: boolean;
  compact?: boolean;
  formatValue?: (value: number) => string;
  formatPeriod?: (period: string) => string;
  customTooltip?: (props: any) => React.ReactNode;
  animate?: boolean;
  maxBars?: number;
}

const ReusableActivityChartComponent: React.FC<ReusableActivityChartProps> = ({
  data,
  title,
  loading = false,
  height = 200,
  colors,
  valueKey = 'value',
  periodKey = 'period',
  showGrid = false,
  compact = true,
  formatValue = (value) => value.toLocaleString(),
  formatPeriod = (period) => period.split(' ')[0], // Show only month for compact view
  customTooltip,
  animate = true,
  maxBars = 12,
}) => {
  // Process data for activity chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Limit number of bars and ensure consistent structure
    const limitedData = data.slice(-maxBars); // Take most recent periods
    const maxValue = Math.max(...limitedData.map(item => Number(item[valueKey]) || 0));
    
    return limitedData.map((item, index) => ({
      ...item,
      id: item[periodKey],
      [valueKey]: Number(item[valueKey]) || 0,
      normalizedHeight: maxValue > 0 ? ((Number(item[valueKey]) || 0) / maxValue) * 100 : 0,
      color: colors ? colors[index % colors.length] : getChartColor(index, CHART_COLOR_ARRAYS.standard),
    }));
  }, [data, valueKey, periodKey, colors, maxBars]);

  // Memoize the Nivo theme
  const nivoTheme = useMemo(() => createNivoTheme(), []);

  // Color function for bars
  const getColorForBar = useCallback((bar: any) => {
    const index = processedData.findIndex(item => item.id === bar.indexValue);
    return colors ? colors[index % colors.length] : getChartColor(index, CHART_COLOR_ARRAYS.standard);
  }, [processedData, colors]);

  // Default tooltip component
  const DefaultTooltip = useCallback(({ indexValue, value, data: tooltipData }: any) => (
    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border rounded-lg shadow-lg">
      <div className="text-sm font-semibold text-foreground mb-2">{indexValue}</div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Count:</span>
        <span className="text-sm font-medium text-primary">
          {formatValue(value)}
        </span>
      </div>
    </div>
  ), [formatValue]);

  const tooltipComponent = customTooltip || DefaultTooltip;

  if (loading) {
    return (
      <Card className="w-full">
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-end justify-center space-x-1" style={{ height: `${height}px` }}>
            {[1,2,3,4,5,6].map(i => (
              <div 
                key={i} 
                className="bg-muted rounded-t-md animate-pulse"
                style={{ 
                  width: '12px',
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
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
            <div className="text-muted-foreground">No activity data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartContent = compact ? (
    // Compact activity chart using simple bars (similar to CompanyDashboard recentActivity)
    <div className={`grid gap-2`} style={{ 
      gridTemplateColumns: `repeat(${Math.min(processedData.length, 12)}, 1fr)`,
      height: `${height}px`,
    }}>
      {processedData.map((activity, index) => {
        const maxValue = Math.max(...processedData.map(a => Number(a[valueKey]) || 0));
        const heightPercentage = maxValue > 0 ? ((Number(activity[valueKey]) || 0) / maxValue) * 100 : 0;
        
        return (
          <div key={activity[periodKey]} className="text-center space-y-2 flex flex-col justify-end">
            <div className="text-xs font-medium text-muted-foreground">
              {formatPeriod(String(activity[periodKey]))}
            </div>
            <div className="flex items-end justify-center flex-1">
              <div 
                className="rounded-t-md transition-all duration-300 hover:opacity-80 cursor-pointer min-w-[8px]"
                style={{ 
                  height: `${Math.max(heightPercentage, 5)}%`,
                  backgroundColor: activity.color,
                  width: Math.min(24, Math.max(8, 100 / processedData.length - 2)) + 'px',
                }}
                title={`${activity[periodKey]}: ${formatValue(Number(activity[valueKey]) || 0)}`}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatValue(Number(activity[valueKey]) || 0)}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    // Full activity chart using Nivo
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveBar
        data={processedData}
        keys={[valueKey]}
        indexBy={periodKey}
        margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        padding={0.2}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={getColorForBar}
        borderRadius={2}
        borderWidth={0}
        theme={nivoTheme}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: -45,
          format: formatPeriod,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          tickRotation: 0,
          format: formatValue,
        }}
        enableGridX={false}
        enableGridY={showGrid}
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
          {chartContent}
        </CardContent>
      </Card>
    );
  }

  return chartContent;
};

ReusableActivityChartComponent.displayName = 'ReusableActivityChart';

export const ReusableActivityChart = React.memo(ReusableActivityChartComponent);