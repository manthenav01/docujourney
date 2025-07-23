'use client';

import { ResponsivePie } from '@nivo/pie';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';

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
  const [hoveredSegment, setHoveredSegment] = useState<any>(null);
  const [hoveredLegendItem, setHoveredLegendItem] = useState<string | null>(null);

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
    );
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
    );
  }

  // Shorten industry names for better display
  const shortenIndustryName = (name: string) => {
    const shortNames: { [key: string]: string } = {
      'Information & Technology': 'Tech',
      'Professional & Technical Services': 'Prof Services',
      'Healthcare & Social Assistance': 'Healthcare',
      'Finance & Insurance': 'Finance',
      'Administrative & Support Services': 'Admin Services',
      'Manufacturing': 'Manufacturing',
      'Educational Services': 'Education',
      'Accommodation & Food Services': 'Hospitality',
      'Transportation & Warehousing': 'Transport',
      'Arts, Entertainment & Recreation': 'Entertainment',
      'Real Estate & Rental': 'Real Estate',
      'Management of Companies': 'Management',
    };
    return shortNames[name] || (name.length > 12 ? name.substring(0, 12) + '...' : name);
  };

  // Enhanced color palette with better contrast (Top 5)
  const enhancedColors = [
    '#1E40AF', '#DC2626', '#059669', '#D97706', '#7C3AED',
  ];

  // Process data for Nivo pie chart format
  const pieData = data.slice(0, 5).map((item, index) => ({
    id: item.industry,
    label: shortenIndustryName(item.industry),
    value: item.applications,
    percentage: item.percentage,
    avgSalary: item.avgSalary,
    color: enhancedColors[index] || '#6B7280',
  }));

  const totalApplications = pieData.reduce((sum, item) => sum + item.value, 0);
  const topIndustry = pieData[0];

  // Center content component
  const CenterContent = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        {hoveredSegment && hoveredSegment.data ? (
          <>
            <div className="text-xs text-gray-500 font-medium mb-1">
              {hoveredSegment.data.id || hoveredSegment.id}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {(hoveredSegment.data.percentage || hoveredSegment.percentage || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {(hoveredSegment.value || hoveredSegment.applications || 0).toLocaleString()} apps
            </div>
          </>
        ) : (
          <>
            <div className="text-xs text-gray-500 font-medium mb-1">
              Total Applications
            </div>
            <div className="text-lg font-bold text-blue-600">
              {totalApplications.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              across {pieData.length} industries
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Industry Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%', position: 'relative' }}>
          <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
            innerRadius={0.55}
            padAngle={2}
            cornerRadius={3}
            activeOuterRadiusOffset={12}
            activeInnerRadiusOffset={-8}
            colors={{ datum: 'data.color' }}
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 11,
                fill: '#374151',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 500,
              },
            }}
            enableArcLinkLabels={false}
            arcLabelsSkipAngle={25}
            arcLabelsTextColor="#FFFFFF"
            enableArcLabels={false}
            onMouseEnter={(data) => {
              setHoveredSegment(data);
              setHoveredLegendItem(String(data.id));
            }}
            onMouseLeave={() => {
              setHoveredSegment(null);
              setHoveredLegendItem(null);
            }}
            tooltip={({ datum }) => (
              <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl">
                <div className="text-sm font-semibold text-gray-900 mb-3">
                  {datum.data.id}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Applications:</span>
                    <span className="text-sm font-semibold text-blue-600">{datum.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Percentage:</span>
                    <span className="text-sm font-semibold text-blue-600">{datum.data.percentage?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Avg Salary:</span>
                    <span className="text-sm font-semibold text-blue-600">${datum.data.avgSalary?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            animate={true}
            motionConfig="wobbly"
            transitionMode="pushIn"
          />
          <CenterContent />
          
          {/* Bottom Legend */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 px-4 pb-2">
              {pieData.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-2 p-1 rounded cursor-pointer transition-all duration-200 ${
                    hoveredLegendItem === item.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => {
                    setHoveredLegendItem(item.id);
                    setHoveredSegment(item);
                  }}
                  onMouseLeave={() => {
                    setHoveredLegendItem(null);
                    setHoveredSegment(null);
                  }}
                  title={item.id} // Full name on hover
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600 truncate font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
