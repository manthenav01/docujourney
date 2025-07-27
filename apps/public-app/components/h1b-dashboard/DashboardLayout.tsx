'use client';

import React from 'react';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};