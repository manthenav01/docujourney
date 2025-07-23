'use client';

import React from 'react';
import { Users, DollarSign, Building2, MapPin, CheckCircle, XCircle, FileX, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';

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
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Application Volume & Success Rates
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {volumeStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats Section */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Overview Statistics
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, index) => (
              <div key={index} className="text-center p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subValue && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
