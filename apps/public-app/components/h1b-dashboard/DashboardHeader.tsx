'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { ImmigrantCentralLogo } from './ImmigrantCentralLogo';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
}

export const DashboardHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', path: '/h1b-dashboard' },
    { id: 'employers', label: 'Employers', path: '/h1b-dashboard' },
    { id: 'jobs', label: 'Jobs', path: '/h1b-dashboard' },
    { id: 'locations', label: 'Locations', path: '/h1b-dashboard' },
    { id: 'attorneys', label: 'Attorneys', path: '/h1b-dashboard' },
    { id: 'about', label: 'About', path: '/about' },
  ];

  const handleNavigation = (item: NavigationItem) => {
    router.push(item.path);
  };

  const getActiveItem = () => {
    if (pathname === '/h1b-dashboard') {return 'home';}
    if (pathname.includes('/company/')) {return 'employers';}
    if (pathname.includes('/job/')) {return 'jobs';}
    if (pathname.includes('/city/')) {return 'locations';}
    if (pathname.includes('/attorney/')) {return 'attorneys';}
    if (pathname === '/about') {return 'about';}
    return 'home';
  };

  const activeItem = getActiveItem();

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ImmigrantCentralLogo className="w-8 h-8" size={32} />
            <span className="text-xl font-semibold text-gray-900">Immigrant Central</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeItem === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};