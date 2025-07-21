'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SalaryDistributionChart } from './SalaryDistributionChart';
import { HighestSalaryByStateChart } from './HighestSalaryByStateChart';
import { TopJobTitlesCard } from './TopJobTitlesCard';
import { CaseStatusByJobCategoryChart } from './CaseStatusByJobCategoryChart';

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
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="loading-spinner mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading salary distribution...</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="loading-spinner mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading state salary data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopJobTitlesCard data={[]} loading={true} />
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="loading-spinner mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading case status data...</p>
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
            highestSalary: item.highestSalary,
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
