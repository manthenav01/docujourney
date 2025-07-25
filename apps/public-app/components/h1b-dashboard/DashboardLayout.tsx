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
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent border border-border"
            >
              <BarChart3 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};