/**
 * SEO Utility Functions
 * Helper functions for SEO optimization and structured data management
 */

import { 
  generateChartSchema, 
  generateSalaryChartSchema, 
  generateTrendChartSchema,
  type ChartSchemaConfig,
} from './schema/chartSchema';
import { 
  generateOrganizationSchema, 
  generateSimpleOrganizationSchema,
  type OrganizationSchemaConfig,
} from './schema/organizationSchema';
import { 
  generateOccupationSchema, 
  generateTechOccupationSchema,
  type OccupationSchemaConfig,
} from './schema/occupationSchema';
import { 
  generatePlaceSchema, 
  generateTechHubSchema,
  type PlaceSchemaConfig,
} from './schema/placeSchema';
import { 
  generateDatasetSchema, 
  generateEmployerDatasetSchema,
  generateJobDatasetSchema,
  type DatasetConfig,
} from './schema/datasetSchema';

/**
 * SEO Context for dynamic optimization
 */
export interface SEOContext {
  pageType: 'dashboard' | 'employer' | 'job' | 'location' | 'attorney' | 'general';
  entityName?: string;
  entityType?: 'company' | 'job_title' | 'city' | 'state' | 'attorney';
  dataContext?: {
    totalApplications?: number;
    avgSalary?: number;
    topCategories?: string[];
    timeRange?: string;
  };
  chartContext?: {
    chartType: 'salary' | 'trend' | 'distribution' | 'comparison';
    dataPoints: number;
    title: string;
    description: string;
  };
}

/**
 * Generates comprehensive schema markup based on context
 */
export const generateContextualSchema = (context: SEOContext): any[] => {
  const schemas: any[] = [];
  
  switch (context.pageType) {
    case 'employer':
      if (context.entityName && context.dataContext) {
        schemas.push(generateOrganizationSchema({
          name: context.entityName,
          h1bStats: {
            totalApplications: context.dataContext.totalApplications || 0,
            avgSalary: context.dataContext.avgSalary || 0,
            topJobCategories: context.dataContext.topCategories,
          },
        }));
        
        schemas.push(generateEmployerDatasetSchema(context.entityName));
      }
      break;
      
    case 'job':
      if (context.entityName && context.dataContext) {
        const isTechy = isTechRole(context.entityName);
        const occupationSchema = isTechy 
          ? generateTechOccupationSchema({
              name: context.entityName,
              h1bStats: {
                totalApplications: context.dataContext.totalApplications || 0,
                avgSalary: context.dataContext.avgSalary || 0,
                topEmployers: context.dataContext.topCategories,
              },
            })
          : generateOccupationSchema({
              name: context.entityName,
              h1bStats: {
                totalApplications: context.dataContext.totalApplications || 0,
                avgSalary: context.dataContext.avgSalary || 0,
                topEmployers: context.dataContext.topCategories,
              },
            });
            
        schemas.push(occupationSchema);
        schemas.push(generateJobDatasetSchema(context.entityName));
      }
      break;
      
    case 'location':
      if (context.entityName && context.dataContext) {
        const isTechHub = isMajorTechHub(context.entityName);
        const placeSchema = isTechHub
          ? generateTechHubSchema({
              name: context.entityName,
              type: context.entityType === 'state' ? 'state' : 'city',
              h1bStats: {
                totalApplications: context.dataContext.totalApplications || 0,
                avgSalary: context.dataContext.avgSalary || 0,
                topEmployers: context.dataContext.topCategories,
              },
            })
          : generatePlaceSchema({
              name: context.entityName,
              type: context.entityType === 'state' ? 'state' : 'city',
              h1bStats: {
                totalApplications: context.dataContext.totalApplications || 0,
                avgSalary: context.dataContext.avgSalary || 0,
                topEmployers: context.dataContext.topCategories,
              },
            });
            
        schemas.push(placeSchema);
      }
      break;
      
    case 'dashboard':
      schemas.push(generateDatasetSchema({
        name: 'H1B Visa Analytics Dashboard',
        description: 'Comprehensive H1B visa data visualization and analysis platform',
        category: 'general',
        dataScope: 'complete H1B LCA database',
        temporalCoverage: {
          startDate: '2016-10-01',
          endDate: new Date().toISOString().split('T')[0],
        },
        sampleSize: context.dataContext?.totalApplications,
      }));
      break;
  }
  
  // Add chart schema if chart context is provided
  if (context.chartContext) {
    const chartConfig: ChartSchemaConfig = {
      title: context.chartContext.title,
      description: context.chartContext.description,
      chartType: mapChartType(context.chartContext.chartType),
      dataSource: `H1B LCA database for ${context.entityName || 'all entities'}`,
      dataPoints: context.chartContext.dataPoints,
    };
    
    switch (context.chartContext.chartType) {
      case 'salary':
        schemas.push(generateSalaryChartSchema(chartConfig));
        break;
      case 'trend':
        schemas.push(generateTrendChartSchema(chartConfig));
        break;
      default:
        schemas.push(generateChartSchema(chartConfig));
    }
  }
  
  return schemas;
};

/**
 * Generates SEO-optimized title based on context
 */
export const generateContextualTitle = (context: SEOContext): string => {
  const baseTitle = 'H1B Visa Data Analytics Platform';
  
  switch (context.pageType) {
    case 'employer':
      return `${context.entityName} H1B Visa Data - Salary, Sponsorship & Approval Rates | ${baseTitle}`;
    case 'job':
      return `${context.entityName} H1B Salary Data - Wage Statistics & Visa Sponsorship | ${baseTitle}`;
    case 'location':
      return `${context.entityName} H1B Jobs & Salaries - Local Visa Sponsor Data | ${baseTitle}`;
    case 'attorney':
      return `${context.entityName} H1B Immigration Attorney - Success Rates & Reviews | ${baseTitle}`;
    default:
      return baseTitle;
  }
};

/**
 * Generates SEO-optimized meta description based on context
 */
export const generateContextualDescription = (context: SEOContext): string => {
  const baseDesc = 'Comprehensive H1B visa statistics, salary data, and employer analytics.';
  
  switch (context.pageType) {
    case 'employer':
      return `${context.entityName} H1B sponsorship data: salary ranges, approval rates, job titles, and visa statistics. Real-time analytics from USCIS LCA database.`;
    case 'job':
      return `${context.entityName} H1B salary information across all employers. Compare wages, sponsorship rates, and requirements. Updated 2025 data.`;
    case 'location':
      return `H1B visa data for ${context.entityName}: top employers, salary ranges, job opportunities, and sponsorship trends in the area.`;
    case 'attorney':
      return `${context.entityName} H1B immigration attorney profile: success rates, client reviews, case history, and visa approval statistics.`;
    default:
      return baseDesc;
  }
};

/**
 * Generates structured keywords based on context
 */
export const generateContextualKeywords = (context: SEOContext): string[] => {
  const baseKeywords = ['H1B visa', 'immigration data', 'salary data', 'visa sponsorship'];
  
  switch (context.pageType) {
    case 'employer':
      return [
        ...baseKeywords,
        `${context.entityName} H1B`,
        `${context.entityName} visa sponsor`,
        `${context.entityName} salary`,
        `${context.entityName} jobs`,
        'H1B employer analysis',
      ];
    case 'job':
      return [
        ...baseKeywords,
        `${context.entityName} H1B salary`,
        `${context.entityName} visa sponsorship`,
        `${context.entityName} job market`,
        `${context.entityName} wages`,
        'H1B job analysis',
      ];
    case 'location':
      return [
        ...baseKeywords,
        `${context.entityName} H1B jobs`,
        `${context.entityName} visa sponsors`,
        `${context.entityName} salary data`,
        `H1B jobs ${context.entityName}`,
        'H1B location analysis',
      ];
    default:
      return baseKeywords;
  }
};

/**
 * Creates canonical URL for the current context
 */
export const generateCanonicalUrl = (context: SEOContext, baseUrl: string = 'https://usimmigrantcentral.com'): string => {
  switch (context.pageType) {
    case 'employer':
      return `${baseUrl}/h1b-dashboard/company/${createSlug(context.entityName || '')}`;
    case 'job':
      return `${baseUrl}/h1b-dashboard/job/${createSlug(context.entityName || '')}`;
    case 'location':
      return `${baseUrl}/h1b-dashboard/city/${createSlug(context.entityName || '')}`;
    case 'attorney':
      return `${baseUrl}/h1b-dashboard/attorney/${createSlug(context.entityName || '')}`;
    default:
      return `${baseUrl}/h1b-dashboard`;
  }
};

/**
 * Injects schema into document head
 */
export const injectSchemaMarkup = (schemas: any[], identifier: string): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  // Remove existing schema with same identifier
  const existing = document.querySelector(`script[data-schema-id="${identifier}"]`);
  if (existing) {
    existing.remove();
  }
  
  // Create and inject new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema-id', identifier);
  script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  document.head.appendChild(script);
};

/**
 * Updates page metadata dynamically
 */
export const updatePageMetadata = (context: SEOContext): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  const title = generateContextualTitle(context);
  const description = generateContextualDescription(context);
  const keywords = generateContextualKeywords(context);
  const canonical = generateCanonicalUrl(context);
  
  // Update title
  document.title = title;
  
  // Update meta description
  updateMetaTag('name', 'description', description);
  
  // Update keywords
  updateMetaTag('name', 'keywords', keywords.join(', '));
  
  // Update Open Graph tags
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:url', canonical);
  
  // Update canonical link
  updateLinkTag('canonical', canonical);
};

/**
 * Helper function to update or create meta tags
 */
function updateMetaTag(attribute: string, name: string, content: string): void {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Helper function to update or create link tags
 */
function updateLinkTag(rel: string, href: string): void {
  let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
}

/**
 * Creates URL-friendly slug
 */
function createSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Determines if a job title is tech-related
 */
function isTechRole(jobTitle: string): boolean {
  const techKeywords = [
    'software', 'engineer', 'developer', 'programmer', 'architect',
    'data scientist', 'analyst', 'devops', 'frontend', 'backend',
    'full stack', 'machine learning', 'ai', 'cloud', 'security',
  ];
  return techKeywords.some(keyword => 
    jobTitle.toLowerCase().includes(keyword.toLowerCase()),
  );
}

/**
 * Determines if a location is a major tech hub
 */
function isMajorTechHub(location: string): boolean {
  const techHubs = [
    'San Francisco', 'San Jose', 'Seattle', 'Austin', 'Boston',
    'New York', 'Los Angeles', 'Denver', 'Atlanta', 'Chicago',
    'California', 'Washington', 'Texas', 'Massachusetts',
  ];
  return techHubs.some(hub => 
    location.toLowerCase().includes(hub.toLowerCase()),
  );
}

/**
 * Maps chart context type to schema chart type
 */
function mapChartType(contextType: string): ChartSchemaConfig['chartType'] {
  switch (contextType) {
    case 'salary':
    case 'comparison':
      return 'bar';
    case 'trend':
      return 'line';
    case 'distribution':
      return 'pie';
    default:
      return 'bar';
  }
}