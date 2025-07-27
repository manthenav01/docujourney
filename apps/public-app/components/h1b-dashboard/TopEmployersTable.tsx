'use client';

import React from 'react';
import Link from 'next/link';
import { createCompanySlug } from '@docujourney/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TopEmployersTableProps {
  dashboardData: {
    topEmployers: Array<{
      employer: string;
      applications: number;
      avgSalary: number;
      minSalary: number;
      maxSalary: number;
      topState: string;
      yoyGrowthRate: number;
    }>;
  };
}

// Helper component for salary range display
const SalaryRange: React.FC<{ minSalary: number; maxSalary: number; avgSalary: number }> = ({ 
  minSalary, 
  maxSalary, 
  avgSalary,
}) => {
  const formatSalary = (salary: number) => {
    if (salary >= 1000000) {
      return `$${(salary / 1000000).toFixed(1)}M`;
    } else if (salary >= 1000) {
      return `$${(salary / 1000).toFixed(0)}K`;
    } else {
      return `$${salary.toLocaleString()}`;
    }
  };

  // Calculate progress percentage, handling edge cases
  const salaryRange = maxSalary - minSalary;
  const progressPercent = salaryRange > 0 
    ? Math.min(100, Math.max(0, ((avgSalary - minSalary) / salaryRange) * 100))
    : 50; // Default to middle if no range

  return (
    <div className="space-y-1.5 min-w-0">
      <div className="text-sm font-medium text-foreground flex items-center gap-1">
        <span className="truncate">
          {formatSalary(minSalary)} - {formatSalary(maxSalary)}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        Avg: {formatSalary(avgSalary)}
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

// Helper component for YoY growth indicator
const YoYGrowthIndicator: React.FC<{ growthRate: number }> = ({ growthRate }) => {
  const isPositive = growthRate > 0;
  const isNegative = growthRate < 0;
  const isFlat = growthRate === 0;

  const getColorClasses = () => {
    if (isPositive) {
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
    if (isNegative) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getIcon = () => {
    if (isPositive) {
      return <TrendingUp className="w-3 h-3" />;
    }
    if (isNegative) {
      return <TrendingDown className="w-3 h-3" />;
    }
    return <Minus className="w-3 h-3" />;
  };

  const getSign = () => {
    if (isPositive) {
      return '+';
    }
    if (isNegative) {
      return '';
    }
    return '';
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getColorClasses()}`}>
      {getIcon()}
      <span>{getSign()}{Math.abs(growthRate).toFixed(1)}%</span>
    </div>
  );
};

export const TopEmployersTable: React.FC<TopEmployersTableProps> = ({ dashboardData }) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center space-x-3">
          <div className="p-2 bg-muted rounded-lg">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span>Top Employers</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Employer</th>
                <th className="text-left py-3 px-4 font-medium text-foreground text-sm hidden sm:table-cell">Applications</th>
                <th className="text-left py-3 px-4 font-medium text-foreground text-sm">Salary Range</th>
                <th className="text-left py-3 px-4 font-medium text-foreground text-sm hidden md:table-cell">YoY Growth</th>
                <th className="text-left py-3 px-4 font-medium text-foreground text-sm hidden lg:table-cell">Top Location</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topEmployers.map((employer, index) => {
                const companySlug = createCompanySlug(employer.employer);
                return (
                  <tr key={employer.employer} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${index === dashboardData.topEmployers.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="py-4 px-4 text-sm">
                      <div className="space-y-1">
                        <Link 
                          href={`/h1b-dashboard/company/${companySlug}?name=${encodeURIComponent(employer.employer)}`}
                          className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors block"
                        >
                          {employer.employer}
                        </Link>
                        {/* Show applications count on mobile */}
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {employer.applications.toLocaleString()} applications
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground text-sm font-medium hidden sm:table-cell">
                      {employer.applications.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <SalaryRange 
                        minSalary={employer.minSalary}
                        maxSalary={employer.maxSalary}
                        avgSalary={employer.avgSalary}
                      />
                      {/* Show YoY growth on mobile */}
                      <div className="mt-2 md:hidden">
                        <YoYGrowthIndicator growthRate={employer.yoyGrowthRate} />
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <YoYGrowthIndicator growthRate={employer.yoyGrowthRate} />
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm hidden lg:table-cell">{employer.topState}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
