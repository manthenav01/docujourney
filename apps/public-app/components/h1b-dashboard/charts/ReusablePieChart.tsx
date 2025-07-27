'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getChartColor, createNivoTheme } from '../../../lib/chartColors';

export interface PieChartData {
  id: string;
  label?: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface ReusablePieChartProps {
  data: PieChartData[];
  title?: string;
  loading?: boolean;
  height?: number;
  colors?: string[];
  innerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sortByValue?: boolean;
  maxSlices?: number;
  enableArcLabels?: boolean;
  enableArcLinkLabels?: boolean;
  arcLabelsSkipAngle?: number;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showCenterContent?: boolean;
  formatValue?: (value: number) => string;
  customTooltip?: (props: any) => React.ReactNode;
  customCenterContent?: (props: { hoveredData?: any; totalValue: number }) => React.ReactNode;
  animate?: boolean;
  motionConfig?: string;
}

const ReusablePieChartComponent: React.FC<ReusablePieChartProps> = ({
  data,
  title,
  loading = false,
  height = 400,
  colors,
  innerRadius = 0.5,
  padAngle = 2,
  cornerRadius = 3,
  sortByValue = true,
  maxSlices = 10,
  enableArcLabels = false,
  enableArcLinkLabels = false,
  arcLabelsSkipAngle = 25,
  showLegend = true,
  legendPosition = 'bottom',
  showCenterContent = true,
  formatValue = (value) => value.toLocaleString(),
  customTooltip,
  customCenterContent,
  animate = true,
  motionConfig = 'wobbly',
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<any>(null);
  const [hoveredLegendItem, setHoveredLegendItem] = useState<string | null>(null);

  // Process data for pie chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    let processedItems = [...data];
    
    // Sort by value if requested
    if (sortByValue) {
      processedItems = processedItems.sort((a, b) => b.value - a.value);
    }
    
    // Limit number of slices
    if (maxSlices && processedItems.length > maxSlices) {
      const topItems = processedItems.slice(0, maxSlices - 1);
      const otherItems = processedItems.slice(maxSlices - 1);
      const otherTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
      
      if (otherTotal > 0) {
        topItems.push({
          id: 'Others',
          label: 'Others',
          value: otherTotal,
        });
      }
      
      processedItems = topItems;
    }
    
    // Add colors and calculate percentages
    const totalValue = processedItems.reduce((sum, item) => sum + item.value, 0);
    
    return processedItems.map((item, index) => ({
      ...item,
      label: item.label || item.id,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
      color: item.color || (colors ? colors[index % colors.length] : getChartColor(index, CHART_COLOR_ARRAYS.standard)),
    }));
  }, [data, sortByValue, maxSlices, colors]);

  const totalValue = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.value, 0);
  }, [processedData]);

  // Memoize the Nivo theme
  const nivoTheme = useMemo(() => createNivoTheme(), []);

  // Default tooltip component
  const DefaultTooltip = useCallback(({ datum }: any) => (
    <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-xl shadow-xl">
      <div className="text-sm font-semibold text-foreground mb-3">
        {datum.data.label || datum.data.id}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Value:</span>
          <span className="text-sm font-semibold text-primary">{formatValue(datum.value)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Percentage:</span>
          <span className="text-sm font-semibold text-success">{datum.data.percentage?.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  ), [formatValue]);

  const tooltipComponent = customTooltip || DefaultTooltip;

  // Default center content component
  const DefaultCenterContent = useCallback(() => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        {hoveredSegment && hoveredSegment.data ? (
          <>
            <div className="text-xs text-muted-foreground font-medium mb-1">
              {hoveredSegment.data.label || hoveredSegment.data.id}
            </div>
            <div className="text-lg font-bold text-foreground">
              {(hoveredSegment.data.percentage || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {formatValue(hoveredSegment.value || 0)}
            </div>
          </>
        ) : (
          <>
            <div className="text-xs text-muted-foreground font-medium mb-1">
              Total
            </div>
            <div className="text-lg font-bold text-primary">
              {formatValue(totalValue)}
            </div>
            <div className="text-xs text-muted-foreground">
              {processedData.length} items
            </div>
          </>
        )}
      </div>
    </div>
  ), [hoveredSegment, totalValue, processedData.length, formatValue]);

  const centerContent = customCenterContent ? 
    customCenterContent({ hoveredData: hoveredSegment, totalValue }) : 
    (showCenterContent ? <DefaultCenterContent /> : null);

  if (loading) {
    return (
      <Card className="w-full">
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <div className="text-center">
              <div className="w-32 h-32 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
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

  const legendMargin = showLegend ? (
    legendPosition === 'bottom' ? { bottom: 80 } :
    legendPosition === 'top' ? { top: 80 } :
    legendPosition === 'left' ? { left: 120 } :
    { right: 120 }
  ) : {};

  const chartContent = (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <ResponsivePie
        data={processedData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20, ...legendMargin }}
        innerRadius={innerRadius}
        padAngle={padAngle}
        cornerRadius={cornerRadius}
        activeOuterRadiusOffset={12}
        activeInnerRadiusOffset={-8}
        colors={{ datum: 'data.color' }}
        borderWidth={2}
        borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
        theme={nivoTheme}
        enableArcLinkLabels={enableArcLinkLabels}
        arcLabelsSkipAngle={arcLabelsSkipAngle}
        arcLabelsTextColor="#FFFFFF"
        enableArcLabels={enableArcLabels}
        onMouseEnter={(data) => {
          setHoveredSegment(data);
          setHoveredLegendItem(String(data.id));
        }}
        onMouseLeave={() => {
          setHoveredSegment(null);
          setHoveredLegendItem(null);
        }}
        tooltip={tooltipComponent}
        animate={animate}
        motionConfig={motionConfig}
        transitionMode="pushIn"
      />
      {centerContent}
      
      {/* Custom Legend */}
      {showLegend && legendPosition === 'bottom' && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 px-4 pb-2">
            {processedData.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-2 p-1 rounded cursor-pointer transition-all duration-200 ${
                  hoveredLegendItem === item.id ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
                onMouseEnter={() => {
                  setHoveredLegendItem(String(item.id));
                  setHoveredSegment(item);
                }}
                onMouseLeave={() => {
                  setHoveredLegendItem(null);
                  setHoveredSegment(null);
                }}
                title={`${item.label}: ${formatValue(item.value)} (${item.percentage?.toFixed(1)}%)`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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

ReusablePieChartComponent.displayName = 'ReusablePieChart';

export const ReusablePieChart = React.memo(ReusablePieChartComponent);