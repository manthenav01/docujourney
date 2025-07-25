'use client';

import { ResponsivePie } from '@nivo/pie';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';

interface CaseStatusData {
  jobCategory: string
  caseStatus: string
  applicationCount: number
  avgSalary: number
}

interface CaseStatusByJobCategoryChartProps {
  data: CaseStatusData[]
  loading?: boolean
}

interface ProcessedJobCategory {
  jobCategory: string
  fullName: string
  certified: number
  denied: number
  withdrawn: number
  certifiedWithdrawn: number
  total: number
  certificationRate: number
  pieData: Array<{
    id: string
    label: string
    value: number
    color: string
  }>
}

export function CaseStatusByJobCategoryChart({ data, loading }: CaseStatusByJobCategoryChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top');

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Case Status by Job Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '500px', width: '100%' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading case status data...</p>
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
          <CardTitle>Case Status by Job Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '500px', width: '100%' }}>
            <div className="h-full flex items-center justify-center">
              <div className="text-muted-foreground">No case status data available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const shortenJobCategoryName = (name: string) => {
    const shortNames: { [key: string]: string } = {
      'Computer and Mathematical Occupations': 'Computer & Math',
      'Business and Financial Operations Occupations': 'Business & Finance',
      'Architecture and Engineering Occupations': 'Architecture & Engineering',
      'Life, Physical, and Social Science Occupations': 'Life & Physical Science',
      'Management Occupations': 'Management',
      'Healthcare Support Occupations': 'Healthcare Support',
      'Healthcare Practitioners and Technical Occupations': 'Healthcare Practitioners',
      'Education, Training, and Library Occupations': 'Education & Training',
      'Legal Occupations': 'Legal',
      'Arts, Design, Entertainment, Sports, and Media Occupations': 'Arts & Media',
    };
    return shortNames[name] || (name.length > 20 ? name.substring(0, 20) + '...' : name);
  };

  // Color scheme for different case statuses
  const statusColors = {
    Certified: 'hsl(var(--success))',          // Green
    Denied: 'hsl(var(--destructive))',         // Red
    Withdrawn: 'hsl(var(--warning))',          // Orange
    'Certified-Withdrawn': 'hsl(var(--chart-5))', // Purple
  };

  // Process data to create donut chart data for each job category
  const processedCategories: ProcessedJobCategory[] = (() => {
    const jobCategoryMap = new Map<string, any>();
    
    // Group by job category
    data.forEach(item => {
      const shortName = shortenJobCategoryName(item.jobCategory);
      if (!jobCategoryMap.has(shortName)) {
        jobCategoryMap.set(shortName, {
          jobCategory: shortName,
          fullName: item.jobCategory,
          certified: 0,
          denied: 0,
          withdrawn: 0,
          certifiedWithdrawn: 0,
          total: 0,
        });
      }
      
      const category = jobCategoryMap.get(shortName)!;
      const status = item.caseStatus;
      
      if (status === 'Certified') {
        category.certified += item.applicationCount;
      } else if (status === 'Denied') {
        category.denied += item.applicationCount;
      } else if (status === 'Withdrawn') {
        category.withdrawn += item.applicationCount;
      } else if (status === 'Certified-Withdrawn') {
        category.certifiedWithdrawn += item.applicationCount;
      }
      
      category.total += item.applicationCount;
    });

    // Convert to array and sort by total applications
    const allCategories = Array.from(jobCategoryMap.values())
      .sort((a, b) => b.total - a.total)
      .map(category => ({
        ...category,
        certificationRate: category.total > 0 ? (category.certified / category.total) * 100 : 0,
        pieData: [
          {
            id: 'Certified',
            label: 'Certified',
            value: category.certified,
            color: statusColors.Certified,
          },
          {
            id: 'Denied',
            label: 'Denied',
            value: category.denied,
            color: statusColors.Denied,
          },
          {
            id: 'Withdrawn',
            label: 'Withdrawn',
            value: category.withdrawn,
            color: statusColors.Withdrawn,
          },
          {
            id: 'Certified-Withdrawn',
            label: 'Certified-Withdrawn',
            value: category.certifiedWithdrawn,
            color: statusColors['Certified-Withdrawn'],
          },
        ].filter(item => item.value > 0), // Only include non-zero values
      }));
    
    // Return top 3 or bottom 3 based on view mode
    if (viewMode === 'top') {
      return allCategories.slice(0, 3);
    } else {
      return allCategories.slice(-3).reverse(); // Bottom 3, but keep descending order
    }
  })();

  // Individual donut chart component
  const DonutChart = ({ categoryData }: { categoryData: ProcessedJobCategory }) => {
    const isHovered = hoveredCategory === categoryData.jobCategory;
    
    return (
      <div 
        className={`relative transition-all duration-300 ${isHovered ? 'transform scale-105' : ''}`}
        onMouseEnter={() => setHoveredCategory(categoryData.jobCategory)}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="text-center mb-2">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {categoryData.jobCategory}
          </h3>
        </div>
        
        <div className="relative" style={{ height: '140px', width: '140px', margin: '0 auto' }}>
          <ResponsivePie
            data={categoryData.pieData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.6}
            padAngle={2}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ datum: 'data.color' }}
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            enableArcLinkLabels={false}
            enableArcLabels={false}
            animate={true}
            motionConfig="gentle"
            tooltip={({ datum }) => (
              <div className="bg-card/95 backdrop-blur-sm p-3 border border-border rounded-lg shadow-lg">
                <div className="text-sm font-semibold text-foreground mb-2">
                  {categoryData.fullName}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <span className="text-sm font-semibold" style={{ color: datum.color }}>
                      {datum.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Applications:</span>
                    <span className="text-sm font-semibold text-primary">{datum.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Percentage:</span>
                    <span className="text-sm font-semibold text-primary">
                      {((datum.value / categoryData.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
          
          {/* Center content showing success rate */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {categoryData.certificationRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Success Rate
              </div>
            </div>
          </div>
        </div>
        
        {/* Status breakdown */}
        <div className="mt-3 space-y-1">
          {categoryData.pieData.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <span className="font-medium text-foreground">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Case Status by Job Category</CardTitle>
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
              Top 3
            </Button>
            <Button
              type="button"
              variant={viewMode === 'bottom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('bottom')}
              className="h-7 text-xs"
              aria-pressed={viewMode === 'bottom'}
            >
              Bottom 3
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
          {processedCategories.map((category) => (
            <DonutChart key={category.jobCategory} categoryData={category} />
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
