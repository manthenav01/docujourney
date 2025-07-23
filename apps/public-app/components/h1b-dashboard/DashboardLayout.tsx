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
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 border border-gray-200"
            >
              <BarChart3 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};