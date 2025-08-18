'use client';

import React from 'react';
import { ReusableSalaryDistribution, type SalaryDistributionData } from './charts';

interface SalaryDistributionChartProps {
  data: SalaryDistributionData[]
  loading?: boolean
}

const SalaryDistributionChartComponent: React.FC<SalaryDistributionChartProps> = ({ data, loading }) => {
  return (
    <ReusableSalaryDistribution
      data={data}
      loading={loading}
      title="Salary Distribution"
      showTitle={true}
      height={400}
    />
  );
};

SalaryDistributionChartComponent.displayName = 'SalaryDistributionChart';

export const SalaryDistributionChart = React.memo(SalaryDistributionChartComponent);
