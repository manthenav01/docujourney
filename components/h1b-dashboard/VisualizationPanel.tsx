"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Map 
} from 'lucide-react';
import { TabType } from './types';
import { SalaryChart } from './SalaryChart';
import { TrendChart } from './TrendChart';
import { GeographicChart } from './GeographicChart';

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
    { id: 'trends' as TabType, label: 'Trends', icon: TrendingUp },
    { id: 'comparison' as TabType, label: 'Comparison', icon: BarChart3 },
    { id: 'map' as TabType, label: 'Geographic', icon: Map },
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
      <CardContent>
        <div className="h-96 w-full">
          {chartsLoading ? (
            <div className="chart-loading">
              <div className="text-center">
                <div className="loading-spinner"></div>
                <p className="text-gray-500 mt-2">Loading visualization...</p>
              </div>
            </div>
          ) : (
            <>                      {activeTab === 'salary' && (
                        <div className="chart-container h-full">
                          <SalaryChart data={dashboardData.salaryDistribution} isActive={activeTab === 'salary'} />
                        </div>
                      )}
                      {activeTab === 'trends' && (
                        <div className="chart-container h-full">
                          <TrendChart data={dashboardData.yearlyTrends} isActive={activeTab === 'trends'} />
                        </div>
                      )}
                      {activeTab === 'comparison' && (
                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Comparison Analysis</p>
                            <p className="text-sm text-gray-400">Coming soon - Compare employers side by side</p>
                          </div>
                        </div>
                      )}
                      {activeTab === 'map' && (
                        <div className="chart-container h-full">
                          <GeographicChart data={dashboardData.stateDistribution} isActive={activeTab === 'map'} />
                        </div>
                      )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
