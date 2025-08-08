'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { ReusableBarChart, type BarChartData } from './charts';
import { SalaryChartSchema } from '../seo/ChartSchemaWrapper';
import { DollarSign } from 'lucide-react';

interface SalaryChartProps {
  salaryData: Array<{
    range: string;
    count: number;
    minSalary: number;
    maxSalary: number;
  }>;
  stateData: Array<{
    state: string;
    applications: number;
    avgSalary: number;
  }>;
  isActive: boolean;
}

export const SalaryChart: React.FC<SalaryChartProps> = ({ salaryData, stateData, isActive }) => {
  // Transform salary data for bar chart
  const distributionData = useMemo(() => {
    if (!salaryData || salaryData.length === 0) {
      return [];
    }
    
    return salaryData.map((item): BarChartData => ({
      range: item.range,
      count: item.count,
      percentage: (item.count / salaryData.reduce((sum, d) => sum + d.count, 0)) * 100,
    }));
  }, [salaryData]);

  // Transform state data for salary by state visualization
  const stateSalaryData = useMemo(() => {
    if (!stateData || stateData.length === 0) {
      return [];
    }
    
    return stateData
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 8)
      .map((item): BarChartData => ({
        state: item.state,
        avgSalary: item.avgSalary,
        applications: item.applications,
      }));
  }, [stateData]);
  
  if (!isActive) {
    return null;
  }
  
  if (!salaryData || !stateData || salaryData.length === 0 || stateData.length === 0) {
    return (
      <div className="h-full w-full bg-card rounded-2xl border border-border/60">
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">No salary data available</div>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full w-full bg-card rounded-2xl border border-border/60">
      {/* Two panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6">
        
        {/* Salary Distribution Panel with Schema */}
        <SalaryChartSchema
          chartConfig={{
            title: 'H1B Salary Distribution Analysis',
            description: 'Distribution of H1B visa applications across salary ranges showing compensation patterns',
            chartType: 'bar',
            dataSource: 'H1B LCA database salary distribution data',
            dataPoints: distributionData.length,
            categories: ['salary_analysis', 'compensation_data'],
            metrics: ['application_count', 'salary_range'],
          }}
          visualConfig={{
            visualType: 'chart',
            dataSubject: 'Salary Distribution',
            interactivity: 'interactive',
          }}
        >
          <Card className="bg-muted/20 border border-border/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground tracking-tight flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Salary Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Total Applications: {salaryData.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <ReusableBarChart
                data={distributionData}
                keys={['count']}
                indexBy="range"
              height={300}
              colors={['#3b82f6']}
              axisBottomLegend="Salary Range"
              axisLeftLegend="Count"
              formatValue={(value) => value.toLocaleString()}
              margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
            />
          </CardContent>
        </Card>
        </SalaryChartSchema>

        {/* Salary by State Panel with Schema */}
        <SalaryChartSchema
          chartConfig={{
            title: 'H1B Average Salary by State',
            description: 'Geographic analysis of H1B visa salaries across US states showing regional compensation patterns',
            chartType: 'bar',
            dataSource: 'H1B LCA database geographic salary data',
            dataPoints: stateSalaryData.length,
            categories: ['geographic_analysis', 'state_comparison'],
            metrics: ['average_salary', 'state_location'],
          }}
          visualConfig={{
            visualType: 'chart',
            dataSubject: 'Geographic Salary Distribution',
            interactivity: 'interactive',
          }}
        >
          <Card className="bg-muted/20 border border-border/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground tracking-tight flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Salary by State
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Top {stateSalaryData.length} States by Application Volume
              </p>
            </CardHeader>
            <CardContent>
              <ReusableBarChart
                data={stateSalaryData}
                keys={['avgSalary']}
                indexBy="state"
                height={300}
                colors={['#1e40af']}
                axisBottomLegend="State"
                axisLeftLegend="Average Salary"
                formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
                margin={{ top: 20, right: 30, bottom: 60, left: 70 }}
              />
            </CardContent>
          </Card>
        </SalaryChartSchema>
      </div>
    </div>
  );
};
