'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart as AreaChartIcon, BarChart3, DollarSign } from 'lucide-react';

interface SalaryDistributionData {
  range: string;
  count: number;
  percentage: number;
  minSalary?: number;
  maxSalary?: number;
  [key: string]: string | number; // Index signature for compatibility with @nivo/bar
}

interface SalaryDistributionChartProps {
  data: SalaryDistributionData[]
  loading?: boolean
}

/**
 * Chart type toggle component
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
      <AreaChartIcon className="w-4 h-4 mr-1" />
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
 * Process raw salary data into standardized 5-range format
 */
const processSalaryData = (data: SalaryDistributionData[]): SalaryDistributionData[] => {
  if (!data || data.length === 0) {
    return [];
  }

  // Group salary ranges into 5 meaningful brackets as per requirements
  const groupedData = data.reduce((acc, item) => {
    let broadRange = '';
    const range = item.range.toLowerCase();
    
    if (range.includes('under') || range.includes('below') || range.includes('< ') || 
        range.includes('60') || range.includes('70')) {
      broadRange = 'Under $80K';
    } else if (range.includes('80') || range.includes('90') || range.includes('100') || range.includes('110')) {
      broadRange = '$80K - $120K';
    } else if (range.includes('120') || range.includes('130') || range.includes('140') || range.includes('150')) {
      broadRange = '$120K - $160K';
    } else if (range.includes('160') || range.includes('170') || range.includes('180') || range.includes('190')) {
      broadRange = '$160K - $200K';
    } else {
      broadRange = '$200K+';
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
        minSalary: getMinSalary(broadRange),
        maxSalary: getMaxSalary(broadRange),
      });
    }
    
    return acc;
  }, [] as SalaryDistributionData[]);

  // Sort by salary range order
  const sortOrder = ['Under $80K', '$80K - $120K', '$120K - $160K', '$160K - $200K', '$200K+'];
  return groupedData.sort((a, b) => sortOrder.indexOf(a.range) - sortOrder.indexOf(b.range));
};

const getMinSalary = (range: string): number => {
  switch (range) {
    case 'Under $80K': return 0;
    case '$80K - $120K': return 80000;
    case '$120K - $160K': return 120000;
    case '$160K - $200K': return 160000;
    case '$200K+': return 200000;
    default: return 0;
  }
};

const getMaxSalary = (range: string): number => {
  switch (range) {
    case 'Under $80K': return 80000;
    case '$80K - $120K': return 120000;
    case '$120K - $160K': return 160000;
    case '$160K - $200K': return 200000;
    case '$200K+': return 500000; // Cap for display
    default: return 0;
  }
};

/**
 * Custom tooltip for area chart
 */
const CustomAreaTooltip = ({ active, payload, label }: any) => {
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
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600 text-sm">Applications:</span>
          <span className="font-semibold text-slate-900">
            {value?.toLocaleString()}
          </span>
        </div>

        {data.percentage && (
          <div className="border-t border-slate-100 pt-2 mt-2">
            <div className="text-xs text-slate-500">
              Percentage: {data.percentage.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function SalaryDistributionChart({ data, loading }: SalaryDistributionChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Process and memoize the salary data
  const processedData = useMemo(() => processSalaryData(data), [data]);

  // Handle chart type toggle
  const handleChartTypeToggle = useCallback((newType: 'area' | 'bar') => {
    setChartType(newType);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Salary Distribution
          </CardTitle>
          <ChartTypeToggle
            chartType={chartType}
            onToggle={handleChartTypeToggle}
            disabled={true}
          />
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Salary Distribution
          </CardTitle>
          <ChartTypeToggle
            chartType={chartType}
            onToggle={handleChartTypeToggle}
            disabled={true}
          />
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Salary Distribution
        </CardTitle>
        <ChartTypeToggle
          chartType={chartType}
          onToggle={handleChartTypeToggle}
        />
      </CardHeader>
      <CardContent>
        <div style={{ height: '450px', width: '100%', position: 'relative' }}>
          {chartType === 'area' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" strokeOpacity={0.3} />
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#salaryGradient)"
                  fillOpacity={1}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, stroke: '#fff', r: 4 }}
                  activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveBar
              data={processedData}
              keys={['count']}
              indexBy="range"
              margin={{ top: 40, right: 40, bottom: 80, left: 80 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={({ index }) => {
                const gradientColors = [
                  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'
                ];
                return gradientColors[index] || '#3B82F6';
              }}
              borderRadius={6}
              borderWidth={0}
              theme={{
                background: 'transparent',
                text: {
                  fontSize: 13,
                  fill: '#374151',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 500,
                },
                axis: {
                  domain: {
                    line: {
                      stroke: '#E5E7EB',
                      strokeWidth: 1,
                    },
                  },
                  legend: {
                    text: {
                      fontSize: 14,
                      fill: '#1F2937',
                      fontWeight: 600,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    },
                  },
                  ticks: {
                    line: {
                      stroke: '#E5E7EB',
                      strokeWidth: 1,
                    },
                    text: {
                      fontSize: 12,
                      fill: '#6B7280',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 500,
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: '#F3F4F6',
                    strokeWidth: 1,
                    strokeDasharray: '2 4',
                  },
                },
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 0,
                tickPadding: 12,
                tickRotation: -35,
                legend: 'Salary Range',
                legendPosition: 'middle',
                legendOffset: 65,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 12,
                tickRotation: 0,
                legend: 'Number of Applications',
                legendPosition: 'middle',
                legendOffset: -65,
              }}
              enableGridX={false}
              enableGridY={true}
              labelSkipWidth={0}
              labelSkipHeight={0}
              labelTextColor="#FFFFFF"
              labelFormat={(value) => `${(Number(value) / 1000).toFixed(0)}K`}
              tooltip={({ indexValue, value, data }) => (
                <div className="bg-white/95 backdrop-blur-sm p-5 border border-gray-200 rounded-xl shadow-2xl">
                  <div className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{indexValue}</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-medium">Applications:</span>
                      <span className="text-sm font-bold text-blue-600">{value?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-medium">Share:</span>
                      <span className="text-sm font-bold text-emerald-600">{data.percentage?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
              animate={true}
              motionConfig="gentle"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}