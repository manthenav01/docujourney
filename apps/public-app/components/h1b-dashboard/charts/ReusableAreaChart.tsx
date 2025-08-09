'use client';

import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { salaryDistributionColors, generateHSLColor } from '../../../lib/chartColors';
import { useResponsiveChart } from '../../../hooks/useResponsiveChart';

interface DataPoint {
  name: string;
  value: number;
  originalData?: any;
}

interface ReusableAreaChartProps {
  data: DataPoint[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  curve?: 'monotone' | 'monotoneX' | 'monotoneY' | 'bump' | 'linear' | 'step' | 'stepBefore' | 'stepAfter';
  gradientId?: string;
  className?: string;
  loading?: boolean;
  onPointClick?: (data: DataPoint) => void;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  const value = payload[0].value;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-4 min-w-[200px]">
      <div className="space-y-2">
        <div className="font-semibold text-slate-900 text-sm">
          {label}
        </div>
        
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: salaryDistributionColors.line }}
          />
          <span className="text-slate-600 text-sm">Applications:</span>
          <span className="font-semibold text-slate-900">
            {value?.toLocaleString()}
          </span>
        </div>

        {data.originalData && (
          <>
            <div className="border-t border-slate-100 pt-2 mt-2">
              <div className="text-xs text-slate-500">
                <div>
                  Percentage: {((value / data.originalData.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton = ({ height }: { height: number }) => (
  <div className="w-full animate-pulse" style={{ height }}>
    <div className="h-full bg-gradient-to-b from-slate-100 to-slate-50 rounded-lg flex items-end justify-between p-4">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-200 rounded-t"
          style={{
            height: `${Math.random() * 60 + 20}%`,
            width: '12%',
          }}
        />
      ))}
    </div>
  </div>
);

const ReusableAreaChart: React.FC<ReusableAreaChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  showTooltip = true,
  curve = 'monotoneX',
  gradientId = 'areaGradient',
  className = '',
  loading = false,
  onPointClick,
  margin,
}) => {
  // Create stable margin reference to prevent infinite re-renders
  const defaultMargin = { top: 20, right: 30, bottom: 20, left: 0 };
  const stableMargin = useMemo(() => {
    if (!margin) return defaultMargin;
    return margin;
  }, [
    margin?.top,
    margin?.right,
    margin?.bottom,
    margin?.left,
  ]);

  // Memoize responsive chart config to prevent infinite re-renders
  const responsiveConfig = useMemo(() => ({
    defaultHeight: height,
    defaultMargin: stableMargin,
    mobileHeight: Math.min(height * 0.7, 250),
  }), [height, stableMargin]);

  // Responsive dimensions
  const { height: responsiveHeight, margin: responsiveMargin } = useResponsiveChart(responsiveConfig);

  const gradientColors = useMemo(() => ({
    start: salaryDistributionColors.gradient.startColor,
    end: salaryDistributionColors.gradient.endColor,
    line: salaryDistributionColors.line,
  }), []);

  const maxValue = useMemo(() => 
    Math.max(...data.map(d => d.value)) * 1.1
  , [data]);

  if (loading) {
    return <LoadingSkeleton height={responsiveHeight} />;
  }

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={responsiveHeight}>
        <AreaChart
          data={data}
          margin={responsiveMargin}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="0%" 
                stopColor={gradientColors.start} 
                stopOpacity={0.9}
              />
              <stop 
                offset="50%" 
                stopColor={gradientColors.start} 
                stopOpacity={0.4}
              />
              <stop 
                offset="100%" 
                stopColor={gradientColors.end} 
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={salaryDistributionColors.grid}
              strokeOpacity={0.3}
            />
          )}

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: responsiveMargin.bottom > 40 ? 12 : 10,
              fill: salaryDistributionColors.text,
              fontWeight: responsiveMargin.bottom > 40 ? 500 : 400,
            }}
            angle={responsiveMargin.bottom > 40 ? -45 : -30}
            textAnchor="end"
            height={responsiveMargin.bottom}
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
            width={responsiveMargin.left}
          />

          {showTooltip && (
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{
                strokeDasharray: '5 5',
                stroke: gradientColors.line,
                strokeOpacity: 0.5,
              }}
            />
          )}

          <Area
            type={curve}
            dataKey="value"
            stroke={gradientColors.line}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={{
              fill: gradientColors.line,
              strokeWidth: 2,
              stroke: '#fff',
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: gradientColors.line,
              stroke: '#fff',
              strokeWidth: 3,
              style: { 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                cursor: onPointClick ? 'pointer' : 'default',
              },
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(ReusableAreaChart);