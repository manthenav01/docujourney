'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

interface NavigationItem {
  label: string;
  href: string;
  description: string;
  category: 'employer' | 'job' | 'location' | 'analysis';
  relevance: number;
}

interface ContextualNavigationProps {
  maxItems?: number;
  includeCategories?: NavigationItem['category'][];
  className?: string;
}

/**
 * Contextual Navigation Component
 * Provides SEO-optimized navigation links based on current page context
 * Invisible to users while providing comprehensive site structure for crawlers
 */
export const ContextualNavigation: React.FC<ContextualNavigationProps> = ({
  maxItems = 25,
  includeCategories,
  className = 'sr-only',
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Extract context from current page
  const employer = searchParams.get('employer');
  const job = searchParams.get('job') || searchParams.get('title');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const year = searchParams.get('year');
  
  // Generate contextual navigation items
  const navigationItems: NavigationItem[] = [];
  
  // Employer-specific navigation
  if (employer) {
    navigationItems.push(
      {
        label: `${employer} H1B Jobs`,
        href: `/h1b-dashboard?employer=${encodeURIComponent(employer)}`,
        description: `All H1B job openings at ${employer}`,
        category: 'employer',
        relevance: 1.0,
      },
      {
        label: `${employer} Salary Data`,
        href: `/h1b-dashboard/company/${employer.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        description: `Salary information for H1B positions at ${employer}`,
        category: 'employer',
        relevance: 0.9,
      },
      {
        label: `${employer} Office Locations`,
        href: `/h1b-dashboard?employer=${encodeURIComponent(employer)}&category=locations`,
        description: `Geographic distribution of ${employer} H1B positions`,
        category: 'employer',
        relevance: 0.8,
      },
      {
        label: `Companies Similar to ${employer}`,
        href: `/h1b-dashboard/employers?similar=${encodeURIComponent(employer)}`,
        description: `H1B employers similar to ${employer}`,
        category: 'employer',
        relevance: 0.7,
      },
    );
  }
  
  // Job-specific navigation
  if (job) {
    navigationItems.push(
      {
        label: `${job} Salary Analysis`,
        href: `/h1b-dashboard/job/${job.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        description: `Comprehensive salary data for ${job} positions`,
        category: 'job',
        relevance: 1.0,
      },
      {
        label: `${job} Top Employers`,
        href: `/h1b-dashboard?job=${encodeURIComponent(job)}&category=employers`,
        description: `Companies hiring ${job} professionals on H1B visas`,
        category: 'job',
        relevance: 0.9,
      },
      {
        label: `${job} by Location`,
        href: `/h1b-dashboard?job=${encodeURIComponent(job)}&category=locations`,
        description: `Geographic distribution of ${job} H1B opportunities`,
        category: 'job',
        relevance: 0.8,
      },
      {
        label: `${job} Market Trends`,
        href: `/h1b-dashboard?job=${encodeURIComponent(job)}&category=trends`,
        description: `Historical trends and growth patterns for ${job}`,
        category: 'analysis',
        relevance: 0.8,
      },
    );
  }
  
  // Location-specific navigation
  if (city || state) {
    const location = city || state!;
    navigationItems.push(
      {
        label: `${location} H1B Employers`,
        href: `/h1b-dashboard?${city ? 'city' : 'state'}=${encodeURIComponent(location)}&category=employers`,
        description: `Top H1B sponsoring companies in ${location}`,
        category: 'location',
        relevance: 1.0,
      },
      {
        label: `${location} Job Market`,
        href: `/h1b-dashboard?${city ? 'city' : 'state'}=${encodeURIComponent(location)}&category=jobs`,
        description: `H1B job opportunities and market analysis in ${location}`,
        category: 'location',
        relevance: 0.9,
      },
      {
        label: `${location} Salary Ranges`,
        href: `/h1b-dashboard?${city ? 'city' : 'state'}=${encodeURIComponent(location)}&category=salaries`,
        description: `H1B salary statistics and cost of living data for ${location}`,
        category: 'location',
        relevance: 0.8,
      },
      {
        label: `${location} Immigration Attorneys`,
        href: `/h1b-dashboard/attorneys?${city ? 'city' : 'state'}=${encodeURIComponent(location)}`,
        description: `H1B immigration lawyers and legal services in ${location}`,
        category: 'location',
        relevance: 0.7,
      },
    );
  }
  
  // General analysis navigation
  if (!employer && !job && !city && !state) {
    navigationItems.push(
      {
        label: 'Top H1B Employers',
        href: '/h1b-dashboard/employers',
        description: 'Leading companies sponsoring H1B visas',
        category: 'analysis',
        relevance: 1.0,
      },
      {
        label: 'H1B Salary Database',
        href: '/h1b-dashboard/jobs',
        description: 'Comprehensive H1B salary information by job title',
        category: 'analysis',
        relevance: 1.0,
      },
      {
        label: 'H1B Jobs by Location',
        href: '/h1b-dashboard/locations',
        description: 'Geographic distribution of H1B employment opportunities',
        category: 'analysis',
        relevance: 1.0,
      },
      {
        label: 'H1B Immigration Attorneys',
        href: '/h1b-dashboard/attorneys',
        description: 'Directory of H1B immigration lawyers and law firms',
        category: 'analysis',
        relevance: 0.9,
      },
    );
  }
  
  // Add comparative and analytical links
  const currentYear = new Date().getFullYear();
  const fiscalYearNum = parseInt(year || currentYear.toString());
  
  navigationItems.push(
    {
      label: `H1B Data ${fiscalYearNum}`,
      href: `/h1b-dashboard?year=${fiscalYearNum}`,
      description: `${fiscalYearNum} H1B visa statistics and trends`,
      category: 'analysis',
      relevance: 0.6,
    },
    {
      label: `H1B Trends ${fiscalYearNum-1} vs ${fiscalYearNum}`,
      href: `/h1b-dashboard?compare=${fiscalYearNum-1}&to=${fiscalYearNum}`,
      description: `Year-over-year comparison of H1B application data`,
      category: 'analysis',
      relevance: 0.5,
    },
  );
  
  // Add cross-cutting analysis links
  if (employer || job) {
    navigationItems.push(
      {
        label: 'H1B Salary Benchmarking',
        href: '/h1b-dashboard?category=salary-analysis',
        description: 'Compare H1B salaries across industries and roles',
        category: 'analysis',
        relevance: 0.6,
      },
      {
        label: 'H1B Market Intelligence',
        href: '/h1b-dashboard?category=market-intelligence',
        description: 'Advanced analytics and market insights for H1B data',
        category: 'analysis',
        relevance: 0.5,
      },
    );
  }
  
  // Filter by category if specified
  const filteredItems = includeCategories
    ? navigationItems.filter(item => includeCategories.includes(item.category))
    : navigationItems;
  
  // Sort by relevance and limit
  const sortedItems = filteredItems
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxItems);
  
  if (sortedItems.length === 0) {
    return null;
  }
  
  return (
    <nav className={className} aria-hidden="true">
      <h3>H1B Data Navigation</h3>
      
      {/* Employer-focused navigation */}
      {sortedItems.some(item => item.category === 'employer') && (
        <section>
          <h4>Employer Analysis</h4>
          <ul>
            {sortedItems
              .filter(item => item.category === 'employer')
              .map((item, index) => (
                <li key={`employer-nav-${index}`}>
                  <Link href={item.href} title={item.description}>
                    {item.label}
                  </Link>
                  <span className="nav-description">{item.description}</span>
                </li>
              ))}
          </ul>
        </section>
      )}
      
      {/* Job market navigation */}
      {sortedItems.some(item => item.category === 'job') && (
        <section>
          <h4>Job Market Analysis</h4>
          <ul>
            {sortedItems
              .filter(item => item.category === 'job')
              .map((item, index) => (
                <li key={`job-nav-${index}`}>
                  <Link href={item.href} title={item.description}>
                    {item.label}
                  </Link>
                  <span className="nav-description">{item.description}</span>
                </li>
              ))}
          </ul>
        </section>
      )}
      
      {/* Location-based navigation */}
      {sortedItems.some(item => item.category === 'location') && (
        <section>
          <h4>Geographic Analysis</h4>
          <ul>
            {sortedItems
              .filter(item => item.category === 'location')
              .map((item, index) => (
                <li key={`location-nav-${index}`}>
                  <Link href={item.href} title={item.description}>
                    {item.label}
                  </Link>
                  <span className="nav-description">{item.description}</span>
                </li>
              ))}
          </ul>
        </section>
      )}
      
      {/* Analytical navigation */}
      {sortedItems.some(item => item.category === 'analysis') && (
        <section>
          <h4>Advanced Analytics</h4>
          <ul>
            {sortedItems
              .filter(item => item.category === 'analysis')
              .map((item, index) => (
                <li key={`analysis-nav-${index}`}>
                  <Link href={item.href} title={item.description}>
                    {item.label}
                  </Link>
                  <span className="nav-description">{item.description}</span>
                </li>
              ))}
          </ul>
        </section>
      )}
      
      {/* Structured navigation schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: 'H1B Data Navigation',
            description: 'Contextual navigation for H1B visa data analysis',
            url: `https://www.usimmigrantcentral.com${pathname}`,
            hasPart: sortedItems.slice(0, 15).map((item, index) => ({
              '@type': 'WebPage',
              name: item.label,
              description: item.description,
              url: `https://www.usimmigrantcentral.com${item.href}`,
              about: {
                '@type': item.category === 'employer' ? 'Organization' :
                        item.category === 'job' ? 'Occupation' :
                        item.category === 'location' ? 'Place' : 'AnalysisNewsArticle',
                name: item.label,
              },
            })),
          }),
        }}
      />
    </nav>
  );
};

/**
 * Employer-focused contextual navigation
 */
export const EmployerNavigation: React.FC<Omit<ContextualNavigationProps, 'includeCategories'>> = (props) => (
  <ContextualNavigation {...props} includeCategories={['employer', 'analysis']} />
);

/**
 * Job-focused contextual navigation
 */
export const JobNavigation: React.FC<Omit<ContextualNavigationProps, 'includeCategories'>> = (props) => (
  <ContextualNavigation {...props} includeCategories={['job', 'analysis']} />
);

/**
 * Location-focused contextual navigation
 */
export const LocationNavigation: React.FC<Omit<ContextualNavigationProps, 'includeCategories'>> = (props) => (
  <ContextualNavigation {...props} includeCategories={['location', 'analysis']} />
);