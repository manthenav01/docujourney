'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopEmployersTableProps {
  dashboardData: {
    topEmployers: Array<{
      employer: string;
      applications: number;
      avgSalary: number;
      topState: string;
    }>;
  };
}

export const TopEmployersTable: React.FC<TopEmployersTableProps> = ({ dashboardData }) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center space-x-3 text-gray-900">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Employer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Applications</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Avg Salary</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Top Location</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topEmployers.map((employer, index) => (
                <tr key={employer.employer} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${index === dashboardData.topEmployers.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-900 text-sm">{employer.employer}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm font-medium">{employer.applications.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm font-medium">${employer.avgSalary.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{employer.topState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
