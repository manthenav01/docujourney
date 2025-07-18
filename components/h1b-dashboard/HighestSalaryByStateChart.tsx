'use client';

import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StateSalaryData {
  state: string;
  highestSalary: number;
  avgSalary: number;
  applications: number;
  [key: string]: string | number; // Index signature for compatibility with @nivo/bar
}

interface HighestSalaryByStateChartProps {
  data: StateSalaryData[]
  loading?: boolean
}

export function HighestSalaryByStateChart({ data, loading }: HighestSalaryByStateChartProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Highest Salary by State</CardTitle>
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
          <CardTitle>Highest Salary by State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => b.highestSalary - a.highestSalary).slice(0, 5);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Highest Salary by State (Top 5)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveBar
            data={sortedData}
            keys={['highestSalary']}
            indexBy="state"
            margin={{ top: 20, right: 30, bottom: 80, left: 80 }}
            padding={0.4}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(d) => {
              const index = sortedData.findIndex(item => item.state === d.indexValue);
              const colorMap = [
                '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
              ];
              return colorMap[index % colorMap.length];
            }}
            borderRadius={2}
            borderWidth={0}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 12,
                fill: '#64748B',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
              axis: {
                domain: {
                  line: {
                    stroke: '#E2E8F0',
                    strokeWidth: 1,
                  },
                },
                legend: {
                  text: {
                    fontSize: 13,
                    fill: '#475569',
                    fontWeight: 500,
                    fontFamily: 'Inter, system-ui, sans-serif',
                  },
                },
                ticks: {
                  line: {
                    stroke: '#E2E8F0',
                    strokeWidth: 1,
                  },
                  text: {
                    fontSize: 11,
                    fill: '#64748B',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  },
                },
              },
              grid: {
                line: {
                  stroke: '#F1F5F9',
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
              legend: 'State',
              legendPosition: 'middle',
              legendOffset: 65,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
              legend: 'Highest Salary ($)',
              legendPosition: 'middle',
              legendOffset: -70,
              format: (value) => `$${(value / 1000).toFixed(0)}K`,
            }}
            enableGridX={false}
            enableGridY={true}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#FFFFFF"
            tooltip={({ indexValue, value, data }) => (
              <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl">
                <div className="text-sm font-semibold text-gray-900 mb-3">{indexValue}</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Highest Salary:</span>
                    <span className="text-sm font-medium text-blue-600">${value?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Average Salary:</span>
                    <span className="text-sm font-medium text-blue-600">${data.avgSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Applications:</span>
                    <span className="text-sm font-medium text-blue-600">{data.applications?.toLocaleString()}</span>
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