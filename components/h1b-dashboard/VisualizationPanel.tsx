"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { 
  DollarSign, 
  Map 
} from 'lucide-react';
import { TabType } from './types';
import { SalaryDistributionChart } from './SalaryDistributionChart';
import { HighestSalaryByStateChart } from './HighestSalaryByStateChart';

interface VisualizationPanelProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
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
    }>;
  };
  chartsLoading: boolean;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  activeTab,
  setActiveTab,
  dashboardData,
  chartsLoading
}) => {
  const tabs = [
    { id: 'salary' as TabType, label: 'Salary Distribution', icon: DollarSign },
    { id: 'map' as TabType, label: 'Highest Salary by State', icon: Map },
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="tab-buttons">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2 filter-toggle rounded-xl transition-all duration-200"
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full">
          {chartsLoading ? (
            <div className="chart-loading h-full flex items-center justify-center">
              <div className="text-center">
                <div className="loading-spinner"></div>
                <p className="text-gray-500 mt-2">Loading visualization...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'salary' && (
                <div className="h-full">
                  <SalaryDistributionChart 
                    data={dashboardData.salaryDistribution ? dashboardData.salaryDistribution.map(item => ({
                      range: item.range,
                      count: item.count,
                      percentage: (item.count / dashboardData.salaryDistribution.reduce((sum, s) => sum + s.count, 0)) * 100
                    })) : []}
                    loading={chartsLoading}
                  />
                </div>
              )}
              {activeTab === 'map' && (
                <div className="h-full">
                  <HighestSalaryByStateChart 
                    data={dashboardData.stateDistribution ? dashboardData.stateDistribution.map(item => ({
                      state: item.state,
                      highestSalary: item.avgSalary,
                      avgSalary: item.avgSalary,
                      applications: item.applications
                    })) : []}
                    loading={chartsLoading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
