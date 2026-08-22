'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const InvisibleSEO: React.FC = () => {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }
    // Remove existing schema script
    const existingSchema = document.querySelector('script[data-schema="h1b-dynamic"]');
    if (existingSchema) {
      existingSchema.remove();
    }
    
    const employer = searchParams.get('employer');
    const job = searchParams.get('job') || searchParams.get('title');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    
    let schemaData: any = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'H1B Visa Application Database',
      description: 'Comprehensive database of H1B visa applications with salary, employer, and approval data',
      keywords: ['H1B visa', 'immigration data', 'salary data', 'visa sponsorship'],
      url: 'https://www.usimmigrantcentral.com',
      creator: {
        '@type': 'Organization',
        name: 'Immigrant Central',
      },
      isAccessibleForFree: true,
      license: 'https://www.usimmigrantcentral.com/terms-of-service',
    };

    // Add specific schema based on what's being viewed
    if (employer) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: employer,
        description: `H1B visa sponsorship data for ${employer} including salary ranges and approval statistics`,
        url: `https://www.usimmigrantcentral.com/h1b-dashboard/company/${employer.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        additionalType: 'H1BVisaSponsor',
        knowsAbout: [
          'H1B visa sponsorship',
          'Immigration compliance', 
          'Labor condition applications',
          'Visa approval processes',
        ],
      };
    } else if (job) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Occupation',
        name: job,
        description: `H1B salary and visa sponsorship information for ${job} positions`,
        occupationLocation: {
          '@type': 'Country',
          name: 'United States',
        },
        skills: 'H1B visa eligible',
        qualifications: 'Bachelor degree or equivalent',
        additionalType: 'H1BEligibleOccupation',
      };
    } else if (city || state) {
      const location = city || state;
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: location,
        description: `H1B visa job opportunities and salary data in ${location}`,
        geo: {
          '@type': 'GeoCoordinates',
          addressCountry: 'US',
        },
        additionalType: 'H1BJobMarket',
      };
    }

    // Create and insert new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'h1b-dynamic');
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Add invisible SEO text for crawlers
    const seoText = document.getElementById('invisible-seo-content');
    if (seoText) {
      let content = '';
      
      if (employer) {
        content = `
          ${employer} H1B visa sponsorship information. View salary data, approval rates, job titles, 
          and application trends for ${employer}. H1B sponsor analysis and visa statistics.
        `;
      } else if (job) {
        content = `
          ${job} H1B salary database. Compare wages across employers, locations, and experience levels. 
          H1B visa requirements and sponsorship opportunities for ${job} professionals.
        `;
      } else if (city || state) {
        const location = city || state;
        content = `
          H1B jobs in ${location}. Local salary data, top sponsoring employers, visa application trends,
          and job market analysis for ${location}. Find H1B opportunities in your area.
        `;
      } else {
        content = `
          H1B visa database with salary information for software engineers, data scientists, financial analysts,
          architects, and other professionals. Comprehensive employer directory, approval rates, and wage statistics.
        `;
      }
      
      seoText.textContent = content.trim();
    }

    return () => {
      const schema = document.querySelector('script[data-schema="h1b-dynamic"]');
      if (schema) {
        schema.remove();
      }
    };
  }, [searchParams]);
  
  // Invisible container for SEO content
  return (
    <div 
      id="invisible-seo-content" 
      className="sr-only"
      aria-hidden="true"
    />
  );
};