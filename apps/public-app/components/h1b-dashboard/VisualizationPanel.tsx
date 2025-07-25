'use client';

import React from 'react';
import { SalaryDistributionChart } from './SalaryDistributionChart';
import { HighestSalaryByStateChart } from './HighestSalaryByStateChart';
import { TopJobTitlesCard } from './TopJobTitlesCard';
import { CaseStatusByJobCategoryChart } from './CaseStatusByJobCategoryChart';
import { Card, CardContent } from '@docujourney/ui';

interface VisualizationPanelProps {
  dashboardData: {
    salaryDistribution: Array<{
      range: string;
      count: number;
      minSalary: number;
      maxSalary: number;
    }>;
    yearlyTrends: Array<{
      fiscalYear: string;
      applications: number;
      avgSalary: number;
      medianSalary: number;
    }>;
    stateDistribution: Array<{
      state: string;
      applications: number;
      avgSalary: number;
      highestSalary: number;
    }>;
    jobTitleDistribution: Array<{
      jobTitle: string;
      applications: number;
      avgSalary: number;
      percentage: number;
    }>;
    caseStatusByJobCategory: Array<{
      jobCategory: string;
      caseStatus: string;
      applicationCount: number;
      avgSalary: number;
    }>;
  };
  chartsLoading: boolean;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  dashboardData,
  chartsLoading,
}) => {
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
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="h-5 bg-muted rounded w-44 animate-pulse"></div>
              </div>
              <div className="h-80 bg-muted/30 rounded-lg animate-pulse flex items-center justify-center">
                <div className="space-y-3 text-center">
                  <div className="flex justify-center space-x-6">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-20 h-20 bg-muted rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">Loading case status breakdown...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalaryDistributionChart 
          data={dashboardData.salaryDistribution ? dashboardData.salaryDistribution.map(item => ({
            range: item.range,
            count: item.count,
            percentage: (item.count / dashboardData.salaryDistribution.reduce((sum, s) => sum + s.count, 0)) * 100,
          })) : []}
          loading={chartsLoading}
        />
        <HighestSalaryByStateChart 
          data={dashboardData.stateDistribution ? dashboardData.stateDistribution.map(item => ({
            state: item.state,
            avgSalary: item.avgSalary,
            applications: item.applications,
          })) : []}
          loading={chartsLoading}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopJobTitlesCard 
          data={dashboardData.jobTitleDistribution ? dashboardData.jobTitleDistribution.map(item => ({
            jobTitle: item.jobTitle,
            applications: item.applications,
            avgSalary: item.avgSalary,
            percentage: item.percentage,
          })) : []}
          loading={chartsLoading}
        />
        <CaseStatusByJobCategoryChart 
          data={dashboardData.caseStatusByJobCategory || []}
          loading={chartsLoading}
        />
      </div>
    </div>
  );
};
