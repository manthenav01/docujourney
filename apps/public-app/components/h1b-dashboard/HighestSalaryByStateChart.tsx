'use client';

import { useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';

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

export function HighestSalaryByStateChart({ data, loading }: HighestSalaryByStateChartProps) {
  const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top');
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Average Salary by State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Average Salary by State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.avgSalary - a.avgSalary).slice(0, 5);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Average Salary by State</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={viewMode === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('top')}
              className="h-7 text-xs"
              aria-pressed={viewMode === 'top'}
            >
              Top 5
            </Button>
            <Button
              type="button"
              variant={viewMode === 'bottom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('bottom')}
              className="h-7 text-xs"
              aria-pressed={viewMode === 'bottom'}
            >
              Bottom 5
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveBar
            data={sortedData}
            keys={['avgSalary']}
            indexBy="state"
            margin={{ top: 20, right: 30, bottom: 80, left: 80 }}
            padding={0.4}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(d) => {
              const index = sortedData.findIndex(item => item.state === d.indexValue);
              const colorMap = [
                'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 
                'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
              ];
              return colorMap[index % colorMap.length];
            }}
            borderRadius={2}
            borderWidth={0}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 12,
                fill: 'hsl(var(--muted-foreground))',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
              axis: {
                domain: {
                  line: {
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1,
                  },
                },
                legend: {
                  text: {
                    fontSize: 13,
                    fill: 'hsl(var(--foreground))',
                    fontWeight: 500,
                    fontFamily: 'Inter, system-ui, sans-serif',
                  },
                },
                ticks: {
                  line: {
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1,
                  },
                  text: {
                    fontSize: 11,
                    fill: 'hsl(var(--muted-foreground))',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  },
                },
              },
              grid: {
                line: {
                  stroke: 'hsl(var(--border) / 0.5)',
                  strokeWidth: 1,
                },
              },
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: -45,
              legend: null,
              legendPosition: 'middle',
              legendOffset: 0,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
              legend: null,
              legendPosition: 'middle',
              legendOffset: 0,
              format: (value) => `$${(value / 1000).toFixed(0)}K`,
            }}
            enableGridX={false}
            enableGridY={true}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#FFFFFF"
            tooltip={({ indexValue, value, data }) => (
              <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
                <div className="text-sm font-semibold text-foreground mb-3">{indexValue}</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Average Salary:</span>
                    <span className="text-sm font-medium text-primary">${value?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Applications:</span>
                    <span className="text-sm font-medium text-primary">{data.applications?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      </CardContent>
    </Card>
  );
}
