'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SEOConfig {
  employer?: string;
  job?: string;
  city?: string;
  state?: string;
  year?: string;
  salaryRange?: string;
}

export const useDynamicSEO = () => {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    const config: SEOConfig = {
      employer: searchParams.get('employer') || undefined,
      job: searchParams.get('job') || searchParams.get('title') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      year: searchParams.get('year') || undefined,
      salaryRange: searchParams.get('salary') || undefined,
    };

    // Build dynamic title based on what user is viewing
    let title = 'H1B Visa Data Analytics Platform';
    let description = 'Comprehensive H1B visa statistics, salary data, and employer analytics.';

    if (config.employer) {
      title = `${config.employer} H1B Visa Data - Salary, Sponsorship & Approval Rates`;
      description = `${config.employer} H1B sponsorship data: salary ranges, approval rates, job titles, and visa statistics. Real-time analytics from USCIS LCA database.`;
    } else if (config.job) {
      title = `${config.job} H1B Salary Data - Wage Statistics & Visa Sponsorship`;
      description = `${config.job} H1B salary information across all employers. Compare wages, sponsorship rates, and requirements. Updated 2025 data.`;
    } else if (config.city || config.state) {
      const location = config.city || config.state;
      title = `${location} H1B Jobs & Salaries - Local Visa Sponsor Data`;
      description = `H1B visa data for ${location}: top employers, salary ranges, job opportunities, and sponsorship trends in the area.`;
    } else if (config.year) {
      title = `H1B Visa Data ${config.year} - Annual Statistics & Trends`;
      description = `${config.year} H1B visa statistics: application volumes, approval rates, salary trends, and top sponsors. Historical data analysis.`;
    }


    try {
      document.title = title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    } catch (error) {
      console.warn('Failed to update SEO metadata:', error);
    }
  }, [searchParams]);
};