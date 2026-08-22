/**
 * Occupation Schema for H1B Job Titles
 * Structured data for job titles and occupations in H1B context
 */

export interface OccupationSchemaConfig {
  name: string;
  description?: string;
  occupationalCategory?: string;
  skills?: string[];
  educationRequirements?: string[];
  experienceRequirements?: string;
  responsibilities?: string[];
  h1bStats?: {
    totalApplications: number;
    avgSalary: number;
    medianSalary?: number;
    salaryRange?: {
      min: number;
      max: number;
    };
    topEmployers?: string[];
    topStates?: string[];
    growthRate?: number;
  };
  relatedOccupations?: string[];
  industry?: string;
}

/**
 * Generates comprehensive Occupation schema for H1B job titles
 */
export const generateOccupationSchema = (config: OccupationSchemaConfig) => {
  const baseUrl = 'https://www.usimmigrantcentral.com';
  const jobSlug = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: config.name,
    description: config.description || `H1B salary and visa sponsorship information for ${config.name} positions`,
    
    // Basic occupation details
    occupationalCategory: config.occupationalCategory,
    industry: config.industry,
    
    // Location context
    occupationLocation: [
      {
        '@type': 'Country',
        name: 'United States',
      },
      ...(config.h1bStats?.topStates?.map(state => ({
        '@type': 'State',
        name: state,
        containedInPlace: {
          '@type': 'Country',
          name: 'United States',
        },
      })) || []),
    ],
    
    // Skills and requirements
    skills: config.skills?.join(', '),
    qualifications: [
      ...(config.educationRequirements || ['Bachelor degree or equivalent']),
      'H1B visa eligible',
      'Work authorization in United States',
    ].join(', '),
    
    experienceRequirements: config.experienceRequirements || 'Entry level to senior level positions available',
    
    responsibilities: config.responsibilities?.join(', '),
    
    // Salary and compensation
    ...(config.h1bStats && {
      estimatedSalary: [
        {
          '@type': 'MonetaryAmountDistribution',
          name: 'Average H1B Salary',
          currency: 'USD',
          duration: 'P1Y',
          ...(config.h1bStats.salaryRange && {
            minValue: config.h1bStats.salaryRange.min,
            maxValue: config.h1bStats.salaryRange.max,
          }),
          median: config.h1bStats.medianSalary || config.h1bStats.avgSalary,
        },
      ],
    }),
    
    // H1B-specific properties
    additionalType: 'H1BEligibleOccupation',
    
    // Employment outlook
    ...(config.h1bStats?.growthRate && {
      occupationOutlook: {
        '@type': 'OccupationAggregation',
        name: `${config.name} Market Outlook`,
        description: `H1B market trends for ${config.name} positions`,
        mainEntity: {
          '@type': 'Occupation',
          name: config.name,
        },
        additionalProperty: {
          '@type': 'PropertyValue',
          name: 'h1bGrowthRate',
          value: `${(config.h1bStats.growthRate * 100).toFixed(1)}%`,
          description: 'Year-over-year growth in H1B applications',
        },
      },
    }),
    
    // Related information
    ...(config.relatedOccupations && {
      occupationRelated: config.relatedOccupations.map(occupation => ({
        '@type': 'Occupation',
        name: occupation,
        sameAs: `${baseUrl}/h1b-dashboard/job/${occupation.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      })),
    }),
    
    // Hiring organizations
    ...(config.h1bStats?.topEmployers && {
      hiringOrganization: config.h1bStats.topEmployers.slice(0, 5).map(employer => ({
        '@type': 'Organization',
        name: employer,
        description: `${employer} hires ${config.name} professionals on H1B visas`,
        sameAs: `${baseUrl}/h1b-dashboard/company/${employer.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      })),
    }),
    
    // Statistical data
    additionalProperty: [
      ...(config.h1bStats ? [
        {
          '@type': 'PropertyValue',
          name: 'totalH1BApplications',
          value: config.h1bStats.totalApplications,
          description: `Total H1B applications for ${config.name} positions`,
        },
        {
          '@type': 'PropertyValue',
          name: 'averageH1BSalary',
          value: config.h1bStats.avgSalary,
          unitCode: 'USD',
          description: `Average H1B salary for ${config.name}`,
        },
      ] : []),
      {
        '@type': 'PropertyValue',
        name: 'visaEligibility',
        value: 'H1B',
        description: 'Eligible for H1B specialty occupation visa',
      },
    ],
    
    // Education and certification
    credentialCategory: 'degree',
    educationRequirements: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      recognizedBy: {
        '@type': 'Organization',
        name: 'U.S. Citizenship and Immigration Services',
      },
    },
    
    // Work environment
    workHours: 'Full-time',
    employmentType: 'FULL_TIME',
    
    // Reference to data page
    subjectOf: {
      '@type': 'WebPage',
      name: `${config.name} H1B Data`,
      url: `${baseUrl}/h1b-dashboard/job/${jobSlug}`,
      description: `Comprehensive H1B salary and market data for ${config.name} positions`,
    },
    
    // Monetization potential (for job seekers)
    monetaryValue: config.h1bStats ? {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: config.h1bStats.avgSalary,
      description: 'Average annual compensation for H1B positions',
    } : undefined,
  };
};

/**
 * Generates occupation schema for tech/engineering roles
 */
export const generateTechOccupationSchema = (config: OccupationSchemaConfig) => {
  return generateOccupationSchema({
    ...config,
    occupationalCategory: 'Technology',
    skills: [
      ...(config.skills || []),
      'Technical skills',
      'Problem solving',
      'Software development',
      'STEM expertise',
    ],
    educationRequirements: [
      'Bachelor\'s degree in Computer Science, Engineering, or related technical field',
      'Equivalent professional experience',
    ],
  });
};

/**
 * Generates occupation schema for business/finance roles
 */
export const generateBusinessOccupationSchema = (config: OccupationSchemaConfig) => {
  return generateOccupationSchema({
    ...config,
    occupationalCategory: 'Business and Finance',
    skills: [
      ...(config.skills || []),
      'Business analysis',
      'Financial modeling',
      'Strategic planning',
      'Project management',
    ],
    educationRequirements: [
      'Bachelor\'s degree in Business, Finance, Economics, or related field',
      'MBA preferred for senior positions',
    ],
  });
};