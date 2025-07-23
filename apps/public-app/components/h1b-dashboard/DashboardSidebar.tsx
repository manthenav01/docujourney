'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Home, 
  Users, 
  Settings, 
  TrendingUp,
  Building,
  XCircle,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active nav item based on current path
  const getActiveNavItem = () => {
    if (pathname === '/h1b-dashboard') return 'overview';
    if (pathname.includes('/company/')) return 'employers';
    if (pathname.includes('/job/')) return 'analytics';
    if (pathname.includes('/city/')) return 'trends';
    return 'overview';
  };

  const activeNavItem = getActiveNavItem();

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home, path: '/h1b-dashboard' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/h1b-dashboard' },
    { id: 'trends', label: 'Trends', icon: TrendingUp, path: '/h1b-dashboard' },
    { id: 'employers', label: 'Employers', icon: Building, path: '/h1b-dashboard' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/h1b-dashboard' },
  ];

  const handleNavigation = (item: typeof sidebarItems[0]) => {
    if (item.id === 'overview') {
      router.push('/h1b-dashboard');
    } else {
      // For now, all navigation goes to main dashboard
      // This can be extended later for different sections
      router.push('/h1b-dashboard');
    }
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">H1B Analytics</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeNavItem === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};