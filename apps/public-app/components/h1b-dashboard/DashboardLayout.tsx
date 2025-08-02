'use client';

import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      
      {/* Main Content */}
      <main className="flex-1 pt-6">
        {children}
      </main>
      
      <DashboardFooter />
    </div>
  );
};