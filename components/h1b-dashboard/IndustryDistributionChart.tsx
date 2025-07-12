'use client'

import { ResponsivePie } from '@nivo/pie'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IndustryData {
  industry: string
  applications: number
  percentage: number
  avgSalary: number
}

interface IndustryDistributionChartProps {
  data: IndustryData[]
  loading?: boolean
}

export function IndustryDistributionChart({ data, loading }: IndustryDistributionChartProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Industry Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '400px', width: '100%' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading industries...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Industry Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '400px', width: '100%' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-muted-foreground">No industry data available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Process data for Nivo pie chart format
  const pieData = data.slice(0, 8).map((item, index) => ({
    id: item.industry,
    label: item.industry.length > 25 ? item.industry.substring(0, 25) + '...' : item.industry,
    value: item.applications,
    percentage: item.percentage,
    avgSalary: item.avgSalary,
    color: [
      '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', 
      '#93C5FD', '#DBEAFE', '#6366F1', '#8B5CF6'
    ][index]
  }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Industry Distribution (Top 8)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.4}
            padAngle={1}
            cornerRadius={2}
            activeOuterRadiusOffset={8}
            colors={{ datum: 'data.color' }}
            borderWidth={0}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 11,
                fill: '#64748B',
                fontFamily: 'Inter, system-ui, sans-serif'
              },
              legends: {
                text: {
                  fontSize: 10,
                  fill: '#64748B',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }
              },
              tooltip: {
                container: {
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }
              }
            }}
            arcLinkLabelsSkipAngle={15}
            arcLinkLabelsTextColor="#64748B"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={20}
            arcLabelsTextColor="#FFFFFF"
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#64748B',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#1E40AF'
                    }
                  }
                ]
              }
            ]}
            tooltip={({ datum }) => (
              <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl">
                <div className="text-sm font-semibold text-gray-900 mb-3 max-w-48">
                  {datum.data.id}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Applications:</span>
                    <span className="text-sm font-medium text-blue-600">{datum.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Percentage:</span>
                    <span className="text-sm font-medium text-blue-600">{datum.data.percentage?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Avg Salary:</span>
                    <span className="text-sm font-medium text-blue-600">${datum.data.avgSalary?.toLocaleString()}</span>
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