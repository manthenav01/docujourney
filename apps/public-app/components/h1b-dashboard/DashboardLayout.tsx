'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { BarChart3 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">

        {/* Content */}
        {children}
      </div>
    </div>
  );
};