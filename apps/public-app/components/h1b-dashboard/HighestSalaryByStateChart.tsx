'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { CHART_COLOR_ARRAYS, getChartColor } from '../../lib/chartColors';
import { ReusableBarChart, type BarChartData } from './charts';
import { MapPin, BarChart3 } from 'lucide-react';

interface StateSalaryData {
  state: string;
  avgSalary: number;
  applications: number;
  [key: string]: string | number; // Index signature for compatibility with @nivo/bar
}

interface HighestSalaryByStateChartProps {
  data: StateSalaryData[]
  loading?: boolean
}

const HighestSalaryByStateChartComponent: React.FC<HighestSalaryByStateChartProps> = ({ data, loading }) => {
  const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top');
  
  // Process data for the reusable bar chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    const sorted = [...data].sort((a, b) => 
      viewMode === 'top' ? b.avgSalary - a.avgSalary : a.avgSalary - b.avgSalary,
    );
    
    return sorted.slice(0, 7).map((item): BarChartData => ({
      state: item.state,
      avgSalary: item.avgSalary,
      applications: item.applications,
    }));
  }, [data, viewMode]);


  // Geographic colors for states
  const stateColors = useMemo(() => {
    return CHART_COLOR_ARRAYS.geographic;
  }, []);

  // Custom tooltip for state salary data
  const stateTooltip = useCallback(({ indexValue, value, data: tooltipData }: any) => (
    <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
      <div className="text-sm font-semibold text-foreground mb-3">{indexValue}</div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Average Salary:</span>
          <span className="text-sm font-medium text-primary">${value?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Applications:</span>
          <span className="text-sm font-medium text-primary">{tooltipData.applications?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  ), []);

  // Memoize the button click handlers
  const handleTopClick = useCallback(() => setViewMode('top'), []);
  const handleBottomClick = useCallback(() => setViewMode('bottom'), []);

  if (loading || !data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Average Salary by State
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={viewMode === 'top' ? 'default' : 'outline'}
                size="sm"
                disabled={loading}
                onClick={handleTopClick}
                className="h-7 text-xs"
              >
                Top 7
              </Button>
              <Button
                type="button"
                variant={viewMode === 'bottom' ? 'default' : 'outline'}
                size="sm"
                disabled={loading}
                onClick={handleBottomClick}
                className="h-7 text-xs"
              >
                Bottom 7
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReusableBarChart
            data={[]}
            keys={['avgSalary']}
            indexBy="state"
            loading={loading}
            height={400}
            colors={stateColors}
            formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Average Salary by State
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={viewMode === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={handleTopClick}
              className="h-7 text-xs"
              aria-pressed={viewMode === 'top'}
            >
              Top 7
            </Button>
            <Button
              type="button"
              variant={viewMode === 'bottom' ? 'default' : 'outline'}
              size="sm"
              onClick={handleBottomClick}
              className="h-7 text-xs"
              aria-pressed={viewMode === 'bottom'}
            >
              Bottom 7
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ReusableBarChart
          data={chartData}
          keys={['avgSalary']}
          indexBy="state"
          height={400}
          colors={stateColors}
          margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
          innerPadding={0.4}
          borderRadius={2}
          formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
          formatTooltipValue={(value) => `$${value.toLocaleString()}`}
          customTooltip={stateTooltip}
        />
      </CardContent>
    </Card>
  );
};

HighestSalaryByStateChartComponent.displayName = 'HighestSalaryByStateChart';

export const HighestSalaryByStateChart = React.memo(HighestSalaryByStateChartComponent);
