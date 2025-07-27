'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { ReusablePieChart, type PieChartData } from './charts';

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
  // Convert data to pie chart format
  const pieData: PieChartData[] = (data || []).slice(0, 5).map((item, index) => ({
    id: item.industry,
    label: shortenIndustryName(item.industry),
    value: item.applications,
    percentage: item.percentage,
    avgSalary: item.avgSalary,
    color: enhancedColors[index] || '#6B7280',
  }));

  if (loading || !data || data.length === 0) {
    return (
      <ReusablePieChart
        data={[]}
        title="Industry Distribution"
        loading={loading}
        height={400}
        maxSlices={5}
        showCenterContent={true}
        showLegend={true}
        legendPosition="bottom"
      />
    );
  }

  // Custom tooltip for industry data
  const industryTooltip = (props: any) => {
    const { datum } = props;
    return (
      <div className="bg-card/95 backdrop-blur-sm p-4 border border-border rounded-xl shadow-xl">
        <div className="text-sm font-semibold text-foreground mb-3">
          {datum.data.id}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Applications:</span>
            <span className="text-sm font-semibold text-primary">{datum.value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Percentage:</span>
            <span className="text-sm font-semibold text-success">{datum.data.percentage?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Avg Salary:</span>
            <span className="text-sm font-semibold text-primary">${datum.data.avgSalary?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ReusablePieChart
      data={pieData}
      title="Industry Distribution"
      height={400}
      innerRadius={0.55}
      padAngle={2}
      cornerRadius={3}
      maxSlices={5}
      showCenterContent={true}
      showLegend={true}
      legendPosition="bottom"
      customTooltip={industryTooltip}
      motionConfig="wobbly"
    />
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
