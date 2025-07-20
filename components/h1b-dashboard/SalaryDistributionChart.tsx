'use client';

import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalaryDistributionData {
  range: string;
  count: number;
  percentage: number;
  [key: string]: string | number; // Index signature for compatibility with @nivo/bar
}

interface SalaryDistributionChartProps {
  data: SalaryDistributionData[]
  loading?: boolean
}

export function SalaryDistributionChart({ data, loading }: SalaryDistributionChartProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Salary Distribution</CardTitle>
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
          <CardTitle>Salary Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group salary ranges into 6 meaningful brackets for better clarity
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
    } else if (range.includes('200') || range.includes('210') || range.includes('220') || range.includes('230') || range.includes('240')) {
      broadRange = '$200K - $250K';
    } else {
      broadRange = '$250K+';
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
      });
    }
    
    return acc;
  }, [] as SalaryDistributionData[]);

  // Sort by salary range order
  const sortOrder = ['Under $80K', '$80K - $120K', '$120K - $160K', '$160K - $200K', '$200K - $250K', '$250K+'];
  const sortedData = groupedData.sort((a, b) => sortOrder.indexOf(a.range) - sortOrder.indexOf(b.range));

  // Calculate statistics for overlays
  const totalApplications = sortedData.reduce((sum, item) => sum + item.count, 0);
  const averageApplications = totalApplications / sortedData.length;
  const medianIndex = Math.floor(sortedData.length / 2);
  const medianApplications = sortedData[medianIndex]?.count || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Salary Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '450px', width: '100%', position: 'relative' }}>
          <ResponsiveBar
            data={sortedData}
            keys={['count']}
            indexBy="range"
            margin={{ top: 40, right: 40, bottom: 80, left: 80 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={({ index }) => {
              const gradientColors = [
                '#1E3A8A', '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
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
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">vs Average:</span>
                    <span className={`text-sm font-semibold ${
                      (value || 0) > averageApplications ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {((((value || 0) - averageApplications) / averageApplications) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            animate={true}
            motionConfig="gentle"
          />
          
          {/* Statistical Overlay Lines */}
          <div className="absolute top-12 right-12 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs font-semibold text-gray-700 mb-2">Statistics</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-xs text-gray-600">Avg: {averageApplications.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-emerald-500"></div>
                <span className="text-xs text-gray-600">Total: {totalApplications.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}