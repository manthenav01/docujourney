"use client";

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
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Top Employers
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mobile-table">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-semibold text-gray-700">Employer</th>
                <th className="text-left p-3 font-semibold text-gray-700">Applications</th>
                <th className="text-left p-3 font-semibold text-gray-700">Avg Salary</th>
                <th className="text-left p-3 font-semibold text-gray-700">Top Location</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topEmployers.map((employer) => (
                <tr key={employer.employer} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  <td className="p-3 font-medium text-gray-900">{employer.employer}</td>
                  <td className="p-3 text-blue-600 font-semibold">{employer.applications.toLocaleString()}</td>
                  <td className="p-3 text-green-600 font-semibold">${employer.avgSalary.toLocaleString()}</td>
                  <td className="p-3 text-purple-600 font-medium">{employer.topState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
