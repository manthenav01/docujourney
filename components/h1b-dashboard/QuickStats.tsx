'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Building2, MapPin, CheckCircle, XCircle, FileX, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  dashboardData: {
    totalApplications: number;
    certifiedApplications: number;
    deniedApplications: number;
    withdrawnApplications: number;
    certificationRate: number;
    avgSalary: number;
    uniqueEmployers: number;
    uniqueStates: number;
    mostAppliedJob: {
      title: string;
      applications: number;
    };
  };
}

export const QuickStats: React.FC<QuickStatsProps> = ({ dashboardData }) => {
  // Application Volume & Success Rate Stats
  const volumeStats = [
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      label: 'Total Applications',
      value: dashboardData.totalApplications.toLocaleString(),
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      label: 'Certified Applications',
      value: dashboardData.certifiedApplications.toLocaleString(),
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      label: 'Denied Applications',
      value: dashboardData.deniedApplications.toLocaleString(),
    },
    {
      icon: <FileX className="h-5 w-5 text-orange-600" />,
      label: 'Withdrawn Applications',
      value: dashboardData.withdrawnApplications.toLocaleString(),
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      label: 'Certification Rate',
      value: `${dashboardData.certificationRate.toFixed(2)}%`,
    },
  ];

  // Overview Stats
  const overviewStats = [
    {
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      label: 'Avg Salary (Certified)',
      value: `$${dashboardData.avgSalary.toLocaleString()}`,
    },
    {
      icon: <Building2 className="h-5 w-5 text-purple-600" />,
      label: 'Unique Employers',
      value: dashboardData.uniqueEmployers.toLocaleString(),
    },
    {
      icon: <MapPin className="h-5 w-5 text-orange-600" />,
      label: 'Unique Locations',
      value: dashboardData.uniqueStates.toLocaleString(),
    },
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      label: 'Most Applied Job',
      value: dashboardData.mostAppliedJob.title || 'N/A',
      subValue: `${dashboardData.mostAppliedJob.applications.toLocaleString()} applications`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Application Volume & Success Rates Section */}
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground/90">
              Application Volume & Success Rates
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {volumeStats.map((stat, index) => (
              <div key={index} className="text-center p-5 bg-muted/30 rounded-xl border border-border/40 hover:bg-muted/50 hover:border-border/60 transition-all duration-200">
                <div className="flex justify-center mb-4">
                  <div className="p-2.5 bg-background rounded-lg shadow-sm border border-border/20">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats Section */}
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 bg-success/10 rounded-xl">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <span className="text-foreground/90">
              Overview Statistics
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewStats.map((stat, index) => (
              <div key={index} className="text-center p-5 bg-muted/30 rounded-xl border border-border/40 hover:bg-muted/50 hover:border-border/60 transition-all duration-200">
                <div className="flex justify-center mb-4">
                  <div className="p-2.5 bg-background rounded-lg shadow-sm border border-border/20">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.subValue && (
                  <p className="text-xs text-muted-foreground/80 mt-1">{stat.subValue}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
