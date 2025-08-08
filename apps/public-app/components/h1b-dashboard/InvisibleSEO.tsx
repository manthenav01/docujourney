'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  generateContextualSchema, 
  generateContextualTitle, 
  generateContextualDescription,
  injectSchemaMarkup,
  updatePageMetadata,
  type SEOContext,
} from '@/lib/seo-utils';
import { SmartInternalLinks } from '@/components/seo/SmartInternalLinks';

interface InvisibleSEOProps {
  pageType?: SEOContext['pageType'];
  entityName?: string;
  entityType?: SEOContext['entityType'];
  dataContext?: SEOContext['dataContext'];
  chartContext?: SEOContext['chartContext'];
}

export const InvisibleSEO: React.FC<InvisibleSEOProps> = ({
  pageType,
  entityName,
  entityType,
  dataContext,
  chartContext,
}) => {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }
    
    // Extract context from URL params if not provided via props
    const employer = entityName || searchParams.get('employer') || undefined;
    const job = entityName || searchParams.get('job') || searchParams.get('title') || undefined;
    const city = entityName || searchParams.get('city') || undefined;
    const state = entityName || searchParams.get('state') || undefined;
    
    // Determine context
    const context: SEOContext = {
      pageType: pageType || (
        employer ? 'employer' :
        job ? 'job' :
        city || state ? 'location' :
        'dashboard'
      ),
      entityName: employer || job || city || state,
      entityType: entityType || (
        employer ? 'company' :
        job ? 'job_title' :
        state ? 'state' :
        city ? 'city' :
        undefined
      ),
      dataContext,
      chartContext,
    };
    
    // Generate and inject comprehensive schema markup
    const schemas = generateContextualSchema(context);
    if (schemas.length > 0) {
      injectSchemaMarkup(schemas, 'h1b-enhanced-dynamic');
    }
    
    // Update page metadata
    updatePageMetadata(context);
    
    // Legacy schema generation for backward compatibility
    const legacySchemaData = generateLegacySchema({
      employer,
      job,
      city,
      state,
    });
    
    // Create legacy schema script (for compatibility)
    const legacyScript = document.createElement('script');
    legacyScript.type = 'application/ld+json';
    legacyScript.setAttribute('data-schema', 'h1b-dynamic-legacy');
    legacyScript.textContent = JSON.stringify(legacySchemaData);
    document.head.appendChild(legacyScript);
    
    // Update invisible SEO content
    const seoContent = generateInvisibleContent(context);
    const seoTextElement = document.getElementById('invisible-seo-content');
    if (seoTextElement) {
      seoTextElement.textContent = seoContent;
    }
    
    // Cleanup function
    return () => {
      // Clean up enhanced schemas
      const enhancedSchema = document.querySelector('script[data-schema-id="h1b-enhanced-dynamic"]');
      if (enhancedSchema) {
        enhancedSchema.remove();
      }
      
      // Clean up legacy schema
      const legacySchema = document.querySelector('script[data-schema="h1b-dynamic-legacy"]');
      if (legacySchema) {
        legacySchema.remove();
      }
    };
  }, [searchParams, pageType, entityName, entityType, dataContext, chartContext]);
  
  return (
    <div className="sr-only" aria-hidden="true">
      {/* Main invisible SEO container */}
      <div id="invisible-seo-content" />
      
      {/* Smart internal links for contextual cross-references */}
      <SmartInternalLinks maxLinks={30} minRelevanceScore={0.2} />
      
      {/* Additional structured content for crawlers */}
      <section>
        <h3>H1B Visa Data Analysis</h3>
        <p>
          Comprehensive immigration analytics platform providing real-time insights into H1B visa
          applications, employer sponsorship patterns, salary benchmarks, and approval trends.
          Access detailed data from USCIS Labor Condition Applications (LCA) database covering
          millions of H1B applications across all industries and locations.
        </p>
        
        <h4>Key Features</h4>
        <ul>
          <li>Real-time H1B salary database with wage comparisons by job title and location</li>
          <li>Employer sponsorship analysis with approval rates and application volumes</li>
          <li>Geographic distribution of H1B opportunities across US cities and states</li>
          <li>Industry trends and year-over-year growth patterns in H1B applications</li>
          <li>Immigration attorney directory with success rates and case histories</li>
        </ul>
        
        <h4>Data Coverage</h4>
        <ul>
          <li>2M+ H1B applications from 2016-2025</li>
          <li>50K+ unique employers across all industries</li>
          <li>15K+ distinct job titles and occupations</li>
          <li>All 50 US states and major metropolitan areas</li>
          <li>Complete salary ranges from entry-level to executive positions</li>
        </ul>
      </section>
    </div>
  );
};

/**
 * Generates legacy schema for backward compatibility
 */
function generateLegacySchema(params: {
  employer?: string | null;
  job?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  const { employer, job, city, state } = params;
  let schemaData: any = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'H1B Visa Application Database',
    description: 'Comprehensive database of H1B visa applications with salary, employer, and approval data',
    keywords: ['H1B visa', 'immigration data', 'salary data', 'visa sponsorship'],
    url: 'https://usimmigrantcentral.com',
    creator: {
      '@type': 'Organization',
      name: 'Immigrant Central',
    },
    isAccessibleForFree: true,
    license: 'https://usimmigrantcentral.com/terms-of-service',
  };

  // Add specific schema based on what's being viewed
  if (employer) {
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: employer,
      description: `H1B visa sponsorship data for ${employer} including salary ranges and approval statistics`,
      url: `https://usimmigrantcentral.com/h1b-dashboard/company/${employer.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
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
  
  return schemaData;
}

/**
 * Generates context-aware invisible content for search engines
 */
function generateInvisibleContent(context: SEOContext): string {
  const { pageType, entityName } = context;
  
  switch (pageType) {
    case 'employer':
      return `
        ${entityName} H1B visa sponsorship comprehensive analysis. Access detailed salary data, 
        approval rates, job titles, geographic distribution, and application trends for ${entityName}. 
        Compare ${entityName} H1B sponsorship statistics with industry benchmarks. View ${entityName} 
        H1B jobs, wage levels, and visa application success rates across all locations and job categories.
      `.trim();
      
    case 'job':
      return `
        ${entityName} H1B salary database and market analysis. Compare ${entityName} wages across 
        employers, locations, and experience levels. H1B visa sponsorship opportunities for ${entityName} 
        professionals. View ${entityName} salary trends, top hiring companies, geographic distribution, 
        and visa approval patterns. Complete ${entityName} job market insights for international candidates.
      `.trim();
      
    case 'location':
      return `
        H1B jobs and salary data in ${entityName}. Comprehensive analysis of H1B visa opportunities, 
        top sponsoring employers, wage statistics, and application trends in ${entityName}. Find H1B 
        visa sponsors, compare salaries by job title, and explore immigration job market in ${entityName}. 
        Local H1B employment statistics and visa sponsorship landscape analysis.
      `.trim();
      
    case 'attorney':
      return `
        ${entityName} H1B immigration attorney profile and success rate analysis. View case history, 
        client reviews, visa approval statistics, and legal expertise for ${entityName}. Compare 
        immigration attorney performance, specializations, and H1B case outcomes. Find qualified 
        H1B legal representation with proven track record.
      `.trim();
      
    default:
      return `
        H1B visa database with comprehensive salary information for software engineers, data scientists, 
        financial analysts, architects, and thousands of other professionals. Complete employer directory 
        with approval rates, wage statistics, and visa sponsorship patterns. Analyze H1B job market 
        trends, geographic distribution, and immigration opportunities across all industries and locations.
      `.trim();
  }
}