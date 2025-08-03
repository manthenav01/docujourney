'use client';

import React from 'react';
import { Card, CardContent } from '@docujourney/ui';
import { METRIC_CONFIGS, getMetricConfig } from '../../lib/metricCardConfig';

interface StatsCardProps {
  /**
   * The type of metric (e.g., 'totalApplications', 'averageSalary', etc.)
   * This determines the icon and styling automatically
   */
  metricType: string;
  
  /**
   * The display title for the card
   */
  title: string;
  
  /**
   * The formatted value to display
   */
  value: string;
  
  /**
   * Optional className for additional styling
   */
  className?: string;
  
  /**
   * Optional onClick handler
   */
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  metricType,
  title,
  value,
  className = '',
  onClick,
}) => {
  const config = getMetricConfig(metricType);
  const IconComponent = config.icon;

  return (
    <Card 
      className={`hover:shadow-md transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 ${config.bgClass} rounded-lg ${config.colorClass}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
};

// Helper component for common usage patterns
export const ApplicationsCard: React.FC<{ value: number; onClick?: () => void }> = ({ value, onClick }) => (
  <StatsCard
    metricType="totalApplications"
    title="Total Applications"
    value={value.toLocaleString()}
    onClick={onClick}
  />
);

export const SalaryCard: React.FC<{ value: number; onClick?: () => void }> = ({ value, onClick }) => (
  <StatsCard
    metricType="averageSalary"
    title="Average Salary"
    value={`$${((value || 0) / 1000).toFixed(0)}K`}
    onClick={onClick}
  />
);

export const ApprovalRateCard: React.FC<{ value: number; onClick?: () => void }> = ({ value, onClick }) => (
  <StatsCard
    metricType="approvalRate"
    title="Approval Rate"
    value={`${(value || 0).toFixed(1)}%`}
    onClick={onClick}
  />
);

export const EmployersCard: React.FC<{ value: number; onClick?: () => void }> = ({ value, onClick }) => (
  <StatsCard
    metricType="uniqueEmployers"
    title="Unique Employers"
    value={value.toLocaleString()}
    onClick={onClick}
  />
);