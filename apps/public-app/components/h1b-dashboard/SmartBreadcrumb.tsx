'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export const SmartBreadcrumb: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const employer = searchParams.get('employer');
  const job = searchParams.get('job') || searchParams.get('title');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  // Build breadcrumb based on current context
  if (pathname.includes('/h1b-dashboard')) {
    items.push({ label: 'H1B Analytics', href: '/h1b-dashboard' });
    
    if (employer) {
      items.push({ label: 'Employers', href: '/h1b-dashboard/employers' });
      items.push({ label: employer, href: '#', current: true });
    } else if (job) {
      items.push({ label: 'Job Titles', href: '/h1b-dashboard/jobs' });
      items.push({ label: job, href: '#', current: true });
    } else if (city || state) {
      const location = city || state;
      if (location) {
        items.push({ label: 'Locations', href: '/h1b-dashboard/cities' });
        items.push({ label: location, href: '#', current: true });
      }
    }
  }

  // Don't render if only home
  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {items.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                )}
                
                {item.current ? (
                  <span className="text-gray-900 font-medium truncate max-w-xs">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
                  >
                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Hidden breadcrumb schema for SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.label,
              item: item.href !== '#' ? `https://usimmigrantcentral.com${item.href}` : undefined,
            })),
          }),
        }}
      />
    </nav>
  );
};