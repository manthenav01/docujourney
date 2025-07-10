'use client'

import { ResponsiveBar } from '@nivo/bar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SalaryDistributionData {
  range: string
  count: number
  percentage: number
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
    )
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
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Salary Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveBar
            data={data}
            keys={['count']}
            indexBy="range"
            margin={{ top: 30, right: 40, bottom: 80, left: 80 }}
            padding={0.2}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1E40AF', '#2563EB', '#1D4ED8', '#6366F1']}
            borderRadius={4}
            borderWidth={0}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 12,
                fill: '#64748B',
                fontFamily: 'Inter, system-ui, sans-serif'
              },
              axis: {
                domain: {
                  line: {
                    stroke: '#E2E8F0',
                    strokeWidth: 1
                  }
                },
                legend: {
                  text: {
                    fontSize: 13,
                    fill: '#475569',
                    fontWeight: 500,
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }
                },
                ticks: {
                  line: {
                    stroke: '#E2E8F0',
                    strokeWidth: 1
                  },
                  text: {
                    fontSize: 11,
                    fill: '#64748B',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#F1F5F9',
                  strokeWidth: 1
                }
              }
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: -45,
              legend: 'Salary Range',
              legendPosition: 'middle',
              legendOffset: 60
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
              legend: 'Number of Applications',
              legendPosition: 'middle',
              legendOffset: -60
            }}
            enableGridX={false}
            enableGridY={true}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#FFFFFF"
            tooltip={({ indexValue, value, data }) => (
              <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl">
                <div className="text-sm font-semibold text-gray-900 mb-2">{indexValue}</div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Count:</span>
                    <span className="text-sm font-medium text-blue-600">{value?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Percentage:</span>
                    <span className="text-sm font-medium text-blue-600">{data.percentage?.toFixed(1)}%</span>
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
  )
}