'use client';

import React, { Suspense } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { SmartBreadcrumb } from './SmartBreadcrumb';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      
      {/* Breadcrumb Navigation */}
      <Suspense fallback={null}>
        <SmartBreadcrumb />
      </Suspense>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      <DashboardFooter />
    </div>
  );
};