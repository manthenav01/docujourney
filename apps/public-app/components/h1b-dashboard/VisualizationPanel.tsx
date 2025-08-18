'use client';

import React, { useMemo } from 'react';
import { SalaryDistributionChart } from './SalaryDistributionChart';
import { HighestSalaryByStateChart } from './HighestSalaryByStateChart';
import { TopJobTitlesCard } from './TopJobTitlesCard';
import { TopAttorneysCard } from './TopAttorneysCard';
import { Card, CardContent } from '@docujourney/ui';
import { H1BAggregatedData } from '../../lib/types';

interface VisualizationPanelProps {
  dashboardData: H1BAggregatedData;
  chartsLoading: boolean;
}

const VisualizationPanelComponent: React.FC<VisualizationPanelProps> = ({
  dashboardData,
  chartsLoading,
}) => {
  // Always call hooks at the top level
  const salaryDistributionData = useMemo(() => {
    if (!dashboardData.salaryDistribution || dashboardData.salaryDistribution.length === 0) {
      return [];
    }
    
    const totalCount = dashboardData.salaryDistribution.reduce((sum, s) => sum + s.count, 0);
    return dashboardData.salaryDistribution.map(item => ({
      range: item.range,
      count: item.count,
      percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
    }));
  }, [dashboardData.salaryDistribution]);

  const stateDistributionData = useMemo(() => {
    if (!dashboardData.stateDistribution) {
      return [];
    }
    
    return dashboardData.stateDistribution.map(item => ({
      state: item.state,
      avgSalary: item.avgSalary,
      applications: item.applications,
    }));
  }, [dashboardData.stateDistribution]);

  const jobTitleDistributionData = useMemo(() => {
    if (!dashboardData.jobTitleDistribution) {
      return [];
    }
    
    return dashboardData.jobTitleDistribution.map(item => ({
      jobTitle: item.jobTitle,
      applications: item.applications,
      avgSalary: item.avgSalary,
      percentage: item.percentage,
      yoyGrowth: item.yoyGrowth,
      yoyGrowthPercentage: item.yoyGrowthPercentage,
    }));
  }, [dashboardData.jobTitleDistribution]);

  if (chartsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="h-5 bg-muted rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-80 bg-muted/30 rounded-lg animate-pulse flex items-center justify-center">
                <div className="space-y-3 text-center">
                  <div className="flex justify-center space-x-1">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="h-16 w-8 bg-muted rounded animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">Loading salary distribution chart...</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="h-5 bg-muted rounded w-40 animate-pulse"></div>
              </div>
              <div className="h-80 bg-muted/30 rounded-lg animate-pulse flex items-center justify-center">
                <div className="space-y-3 text-center">
                  <div className="flex justify-center space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-20 w-12 bg-muted rounded animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">Loading state salary data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopJobTitlesCard data={[]} loading={true} />
          <TopAttorneysCard data={[]} loading={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Market Intelligence - Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalaryDistributionChart 
          data={salaryDistributionData}
          loading={chartsLoading}
        />
        <HighestSalaryByStateChart 
          data={stateDistributionData}
          loading={chartsLoading}
        />
      </div>
      
      {/* Row 2: Deep Analysis - Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopJobTitlesCard 
          data={jobTitleDistributionData}
          loading={chartsLoading}
          showYoYGrowth={true}
        />
        <TopAttorneysCard 
          data={dashboardData.topAttorneys || []}
          loading={chartsLoading}
        />
      </div>
    </div>
  );
};

VisualizationPanelComponent.displayName = 'VisualizationPanel';

export const VisualizationPanel = React.memo(VisualizationPanelComponent);
