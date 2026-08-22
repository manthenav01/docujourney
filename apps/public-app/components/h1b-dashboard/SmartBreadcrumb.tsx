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
  const attorney = searchParams.get('attorney');
  
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  // Handle standalone pages (Contact, About, etc.)
  if (pathname === '/contact') {
    items.push({ label: 'Contact Us', href: '#', current: true });
  } else if (pathname === '/about') {
    items.push({ label: 'About Us', href: '#', current: true });
  } else if (pathname === '/privacy-policy') {
    items.push({ label: 'Privacy Policy', href: '#', current: true });
  } else if (pathname === '/terms-of-service') {
    items.push({ label: 'Terms of Service', href: '#', current: true });
  }
  // Only show breadcrumb for H1B dashboard sub-pages (not the main dashboard page itself)
  // Since H1B Dashboard is our home, we don't need to show it again
  else if (pathname.includes('/h1b-dashboard') && pathname !== '/h1b-dashboard') {
    
    // Handle specific route patterns
    if (pathname.includes('/h1b-dashboard/locations')) {
      // Handle hierarchical location structure
      items.push({ label: 'Locations', href: '/h1b-dashboard/locations' });
      
      if (city && state) {
        // City page: Home → Locations → State → City
        const stateSlug = state.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        items.push({ 
          label: state, 
          href: `/h1b-dashboard/locations/${encodeURIComponent(stateSlug)}?state=${encodeURIComponent(state)}`,
        });
        items.push({ label: `${city}, ${state}`, href: '#', current: true });
      } else if (state) {
        // State page: Home → Locations → State
        items.push({ label: state, href: '#', current: true });
      }
    } else if (pathname.includes('/h1b-sponsors') || pathname.includes('/h1b-dashboard/employers') || pathname.includes('/h1b-dashboard/company/')) {
      // H1B Sponsors section (matching menu label)
      items.push({ label: 'H1B Sponsors', href: '/h1b-sponsors' });
      if (employer || pathname.includes('/company/')) {
        const companyName = employer || decodeURIComponent(pathname.split('/company/')[1]?.split('?')[0] || '')
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        if (companyName && companyName.trim()) {
          items.push({ label: companyName, href: '#', current: true });
        }
      }
    } else if (pathname.includes('/h1b-dashboard/jobs') || pathname.includes('/h1b-dashboard/job/')) {
      // Jobs section
      items.push({ label: 'Jobs', href: '/h1b-dashboard/jobs' });
      if (job || pathname.includes('/job/')) {
        const jobTitle = job || decodeURIComponent(pathname.split('/job/')[1]?.split('?')[0] || '')
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        if (jobTitle && jobTitle.trim()) {
          items.push({ label: jobTitle, href: '#', current: true });
        }
      }
    } else if (pathname.includes('/h1b-dashboard/attorneys') || pathname.includes('/h1b-dashboard/attorney/')) {
      // Attorneys section
      items.push({ label: 'Attorneys', href: '/h1b-dashboard/attorneys' });
      if (attorney || pathname.includes('/attorney/')) {
        const attorneyName = attorney || decodeURIComponent(pathname.split('/attorney/')[1]?.split('?')[0] || '')
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        if (attorneyName && attorneyName.trim()) {
          items.push({ label: attorneyName, href: '#', current: true });
        }
      }
    } else if (employer) {
      // Query parameter based employer
      items.push({ label: 'H1B Sponsors', href: '/h1b-sponsors' });
      items.push({ label: employer, href: '#', current: true });
    } else if (job) {
      // Query parameter based job
      items.push({ label: 'Jobs', href: '/h1b-dashboard/jobs' });
      items.push({ label: job, href: '#', current: true });
    } else if (attorney) {
      // Query parameter based attorney
      items.push({ label: 'Attorneys', href: '/h1b-dashboard/attorneys' });
      items.push({ label: attorney, href: '#', current: true });
    } else if (city || state) {
      // Fallback for old structure (will be deprecated)
      const location = city || state;
      if (location) {
        items.push({ label: 'Locations', href: '/h1b-dashboard/locations' });
        const displayLocation = city && state ? `${city}, ${state}` : location;
        items.push({ label: displayLocation, href: '#', current: true });
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
              item: item.href !== '#' ? `https://www.usimmigrantcentral.com${item.href}` : undefined,
            })),
          }),
        }}
      />
    </nav>
  );
};