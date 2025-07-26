'use client';

import React, { useMemo, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getChartColor, createNivoTheme } from '../../../lib/chartColors';

export interface BarChartData {
  [key: string]: string | number;
}

export interface ReusableBarChartProps {
  data: BarChartData[];
  keys: string[];
  indexBy: string;
  title?: string;
  loading?: boolean;
  height?: number;
  colors?: string[];
  orientation?: 'horizontal' | 'vertical';
  enableGridX?: boolean;
  enableGridY?: boolean;
  axisBottomLegend?: string;
  axisLeftLegend?: string;
  groupMode?: 'stacked' | 'grouped';
  innerPadding?: number;
  borderRadius?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  customTooltip?: (props: any) => React.ReactNode;
  animate?: boolean;
  motionConfig?: string;
}

const ReusableBarChartComponent: React.FC<ReusableBarChartProps> = ({
  data,
  keys,
  indexBy,
  title,
  loading = false,
  height = 400,
  colors,
  orientation = 'vertical',
  enableGridX = false,
  enableGridY = true,
  axisBottomLegend,
  axisLeftLegend,
  groupMode = 'grouped',
  innerPadding = 0.1,
  borderRadius = 4,
  margin = { top: 40, right: 40, bottom: 80, left: 80 },
  formatValue,
  formatTooltipValue,
  customTooltip,
  animate = true,
  motionConfig = 'gentle',
}) => {
  // Memoize the Nivo theme to prevent recreation
  const nivoTheme = useMemo(() => createNivoTheme(), []);

  // Memoize the color function
  const getColorForBar = useCallback((bar: any) => {
    if (colors) {
      const keyIndex = keys.indexOf(bar.id);
      return colors[keyIndex % colors.length];
    }
    const index = data.findIndex(item => item[indexBy] === bar.indexValue);
    return getChartColor(index, CHART_COLOR_ARRAYS.standard);
  }, [colors, keys, data, indexBy]);

  // Default tooltip component
  const DefaultTooltip = useCallback(({ indexValue, value, id, data: tooltipData }: any) => (
    <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
      <div className="text-sm font-semibold text-foreground mb-3">{indexValue}</div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{id}:</span>
          <span className="text-sm font-medium text-primary">
            {formatTooltipValue ? formatTooltipValue(value) : value?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  ), [formatTooltipValue]);

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
          <div className={`h-${height / 4} bg-muted/20 rounded-lg animate-pulse flex items-center justify-center`} style={{ height: `${height}px` }}>
            <div className="space-y-3 text-center">
              <div className="flex justify-center space-x-1">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-16 w-8 bg-muted rounded animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">Loading chart...</p>
            </div>
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

  const chartContent = (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={margin}
        padding={innerPadding}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={getColorForBar}
        borderRadius={borderRadius}
        borderWidth={0}
        theme={nivoTheme}
        layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        axisTop={null}
        axisRight={null}
        axisBottom={orientation === 'horizontal' ? null : {
          tickSize: 0,
          tickPadding: 12,
          tickRotation: -35,
          legend: axisBottomLegend,
          legendPosition: 'middle',
          legendOffset: axisBottomLegend ? 65 : 0,
        }}
        axisLeft={orientation === 'horizontal' ? {
          tickSize: 0,
          tickPadding: 12,
          tickRotation: 0,
          legend: axisLeftLegend,
          legendPosition: 'middle',
          legendOffset: axisLeftLegend ? -65 : 0,
        } : {
          tickSize: 0,
          tickPadding: 12,
          tickRotation: 0,
          legend: axisLeftLegend,
          legendPosition: 'middle',
          legendOffset: axisLeftLegend ? -65 : 0,
          format: formatValue,
        }}
        enableGridX={enableGridX}
        enableGridY={enableGridY}
        groupMode={groupMode}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#FFFFFF"
        tooltip={tooltipComponent}
        animate={animate}
        motionConfig={motionConfig}
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

ReusableBarChartComponent.displayName = 'ReusableBarChart';

export const ReusableBarChart = React.memo(ReusableBarChartComponent);