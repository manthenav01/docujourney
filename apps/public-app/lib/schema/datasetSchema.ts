/**
 * Dataset Schema Generators
 * Creates structured data for H1B datasets and data collections
 */

export interface DatasetConfig {
  name: string;
  description: string;
  category: 'employer' | 'job' | 'location' | 'salary' | 'trend' | 'attorney' | 'general';
  dataScope: string;
  temporalCoverage?: {
    startDate: string;
    endDate: string;
  };
  spatialCoverage?: string;
  measurementTechnique?: string[];
  variablesMeasured?: string[];
  sampleSize?: number;
}

/**
 * Generates comprehensive Dataset schema for H1B data collections
 */
export const generateDatasetSchema = (config: DatasetConfig) => {
  const baseUrl = 'https://usimmigrantcentral.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: config.name,
    description: config.description,
    
    // Creator and publisher
    creator: {
      '@type': 'Organization',
      name: 'Immigrant Central',
      url: baseUrl,
      description: 'H1B visa analytics and immigration data platform',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Immigrant Central',
      url: baseUrl,
    },
    
    // Dates and versioning
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    datePublished: new Date().toISOString(),
    version: '2025.1',
    
    // Data characteristics
    measurementTechnique: config.measurementTechnique || [
      'Administrative data collection',
      'Statistical aggregation',
      'Data mining',
    ],
    
    variableMeasured: config.variablesMeasured || [
      'salary',
      'job_title',
      'employer_name',
      'worksite_location',
      'application_status',
    ],
    
    // Coverage
    temporalCoverage: config.temporalCoverage ? 
      `${config.temporalCoverage.startDate}/${config.temporalCoverage.endDate}` : 
      '2016-10-01/2025-09-30',
    
    spatialCoverage: config.spatialCoverage || {
      '@type': 'Place',
      name: 'United States',
      geo: {
        '@type': 'GeoShape',
        addressCountry: 'US',
      },
    },
    
    // Size and scope
    size: config.sampleSize ? `${config.sampleSize.toLocaleString()} records` : undefined,
    
    // Keywords and categories
    keywords: [
      'H1B visa',
      'immigration data',
      'salary data',
      'employment statistics',
      config.category,
      config.dataScope,
    ],
    
    // Data source and methodology
    isBasedOn: {
      '@type': 'Dataset',
      name: 'USCIS H1B LCA Disclosure Data',
      description: 'Official H1B Labor Condition Application data from U.S. Citizenship and Immigration Services',
      publisher: {
        '@type': 'Organization',
        name: 'U.S. Department of Labor',
      },
    },
    
    // Distribution and access
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${baseUrl}/api/h1b-data`,
        description: 'JSON API endpoint for H1B data queries',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/html',
        contentUrl: `${baseUrl}/h1b-dashboard`,
        description: 'Interactive dashboard for H1B data exploration',
      },
    ],
    
    // License and usage
    license: `${baseUrl}/terms-of-service`,
    isAccessibleForFree: true,
    
    // Category-specific properties
    ...(getCategorySpecificProperties(config.category, config)),
    
    // Quality indicators
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'dataQuality',
        value: 'high',
        description: 'Data undergoes validation and cleansing processes',
      },
      {
        '@type': 'PropertyValue',
        name: 'updateFrequency',
        value: 'quarterly',
      },
      {
        '@type': 'PropertyValue',
        name: 'completeness',
        value: '95%+',
      },
    ],
  };
};

/**
 * Adds category-specific schema properties
 */
function getCategorySpecificProperties(category: DatasetConfig['category'], config: DatasetConfig) {
  const baseUrl = 'https://usimmigrantcentral.com';
  
  switch (category) {
    case 'employer':
      return {
        about: {
          '@type': 'Organization',
          name: 'H1B Sponsoring Employers',
          description: 'Companies and organizations that sponsor H1B visa applications',
        },
        mainEntity: {
          '@type': 'ItemList',
          name: 'H1B Employers',
          description: 'List of employers with H1B sponsorship data',
          url: `${baseUrl}/h1b-dashboard/employers`,
        },
      };
      
    case 'job':
      return {
        about: {
          '@type': 'Occupation',
          name: 'H1B Eligible Occupations',
          description: 'Job titles and occupations eligible for H1B visa sponsorship',
        },
        mainEntity: {
          '@type': 'ItemList',
          name: 'H1B Job Titles',
          description: 'List of job titles with H1B application data',
          url: `${baseUrl}/h1b-dashboard/jobs`,
        },
      };
      
    case 'location':
      return {
        about: {
          '@type': 'Place',
          name: 'H1B Job Locations',
          description: 'Geographic distribution of H1B employment opportunities',
        },
        mainEntity: {
          '@type': 'ItemList',
          name: 'H1B Cities and States',
          description: 'Geographic breakdown of H1B applications',
          url: `${baseUrl}/h1b-dashboard/locations`,
        },
      };
      
    case 'salary':
      return {
        about: {
          '@type': 'MonetaryAmount',
          name: 'H1B Salary Data',
          description: 'Wage and compensation information for H1B positions',
        },
        measurementMethod: 'prevailing wage determination',
      };
      
    case 'attorney':
      return {
        about: {
          '@type': 'Person',
          name: 'H1B Immigration Attorneys',
          description: 'Legal professionals handling H1B visa applications',
        },
        mainEntity: {
          '@type': 'ItemList',
          name: 'H1B Attorneys',
          description: 'Immigration attorneys with H1B application data',
          url: `${baseUrl}/h1b-dashboard/attorneys`,
        },
      };
      
    default:
      return {};
  }
}

/**
 * Generates employer-specific dataset schema
 */
export const generateEmployerDatasetSchema = (employerName: string) => {
  return generateDatasetSchema({
    name: `${employerName} H1B Sponsorship Data`,
    description: `Comprehensive H1B visa sponsorship data for ${employerName}, including salary ranges, job titles, and application trends`,
    category: 'employer',
    dataScope: `${employerName} employment data`,
    variablesMeasured: [
      'salary_range',
      'job_categories',
      'application_volume',
      'approval_rate',
      'geographic_distribution',
    ],
  });
};

/**
 * Generates job-specific dataset schema
 */
export const generateJobDatasetSchema = (jobTitle: string) => {
  return generateDatasetSchema({
    name: `${jobTitle} H1B Salary and Market Data`,
    description: `H1B visa market analysis for ${jobTitle} positions, including salary benchmarks and employer landscape`,
    category: 'job',
    dataScope: `${jobTitle} market analysis`,
    variablesMeasured: [
      'salary_distribution',
      'employer_diversity',
      'geographic_concentration',
      'experience_levels',
      'skill_requirements',
    ],
  });
};