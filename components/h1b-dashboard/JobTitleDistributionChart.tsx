'use client'

import { ResponsiveBar } from '@nivo/bar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface JobTitleData {
  jobTitle: string
  applications: number
  percentage: number
  avgSalary: number
}

interface JobTitleDistributionChartProps {
  data: JobTitleData[]
  loading?: boolean
}

export function JobTitleDistributionChart({ data, loading }: JobTitleDistributionChartProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Top Job Titles</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '400px', width: '100%' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading job titles...</p>
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
          <CardTitle>Top Job Titles</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '400px', width: '100%' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-muted-foreground">No job title data available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get top 10 job titles and truncate long names
  const processedData = data
    .slice(0, 10)
    .map(item => ({
      ...item,
      jobTitle: item.jobTitle.length > 30 
        ? item.jobTitle.substring(0, 30) + '...' 
        : item.jobTitle
    }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Job Titles (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveBar
            data={processedData}
            keys={['applications']}
            indexBy="jobTitle"
            layout="horizontal"
            margin={{ top: 20, right: 40, bottom: 80, left: 180 }}
            padding={0.4}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1D4ED8', '#6366F1', '#8B5CF6', '#A78BFA']}
            borderRadius={2}
            borderWidth={0}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 11,
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
                    fontSize: 12,
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
                    fontSize: 10,
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
              tickRotation: 0,
              legend: 'Number of Applications',
              legendPosition: 'middle',
              legendOffset: 65
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
              legend: 'Job Title',
              legendPosition: 'middle',
              legendOffset: -160
            }}
            enableGridX={true}
            enableGridY={false}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#FFFFFF"
            tooltip={({ indexValue, value, data }) => (
              <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl">
                <div className="text-sm font-semibold text-gray-900 mb-3 max-w-48">
                  {data.jobTitle.length > 30 ? data.jobTitle.replace('...', '') : data.jobTitle}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Applications:</span>
                    <span className="text-sm font-medium text-blue-600">{value?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Percentage:</span>
                    <span className="text-sm font-medium text-blue-600">{data.percentage?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Avg Salary:</span>
                    <span className="text-sm font-medium text-blue-600">${data.avgSalary?.toLocaleString()}</span>
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