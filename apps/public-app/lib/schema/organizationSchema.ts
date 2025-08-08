/**
 * Organization Schema for H1B Employers
 * Enhanced structured data for companies and organizations
 */

export interface OrganizationSchemaConfig {
  name: string;
  description?: string;
  industry?: string;
  foundingDate?: string;
  numberOfEmployees?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  h1bStats?: {
    totalApplications: number;
    avgSalary: number;
    approvalRate?: number;
    topJobCategories?: string[];
    fiscalYears?: string[];
  };
  website?: string;
  sameAs?: string[];
}

/**
 * Generates comprehensive Organization schema for H1B employers
 */
export const generateOrganizationSchema = (config: OrganizationSchemaConfig) => {
  const baseUrl = 'https://usimmigrantcentral.com';
  const companySlug = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Corporation'],
    name: config.name,
    description: config.description || `H1B visa sponsorship information and employment data for ${config.name}`,
    
    // Basic organization details
    foundingDate: config.foundingDate,
    numberOfEmployees: config.numberOfEmployees,
    industry: config.industry,
    url: config.website,
    sameAs: config.sameAs || [],
    
    // Location information
    ...(config.location && {
      location: {
        '@type': 'Place',
        addressLocality: config.location.city,
        addressRegion: config.location.state,
        addressCountry: config.location.country || 'US',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: config.location.city,
        addressRegion: config.location.state,
        addressCountry: config.location.country || 'US',
      },
    }),
    
    // H1B-specific properties
    additionalType: 'H1BVisaSponsor',
    knowsAbout: [
      'H1B visa sponsorship',
      'Immigration compliance',
      'Labor condition applications',
      'Visa approval processes',
      ...(config.h1bStats?.topJobCategories || []),
    ],
    
    // Employment and hiring information
    ...(config.h1bStats && {
      hiringOrganization: {
        '@type': 'Organization',
        name: config.name,
        description: `${config.name} sponsors H1B visas for international talent`,
      },
      
      // Custom properties for H1B data
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'h1bApplications',
          value: config.h1bStats.totalApplications,
          description: 'Total H1B applications sponsored',
        },
        {
          '@type': 'PropertyValue',
          name: 'averageH1BSalary',
          value: config.h1bStats.avgSalary,
          unitCode: 'USD',
          description: 'Average salary offered to H1B employees',
        },
        ...(config.h1bStats.approvalRate ? [{
          '@type': 'PropertyValue',
          name: 'h1bApprovalRate',
          value: `${(config.h1bStats.approvalRate * 100).toFixed(1)}%`,
          description: 'H1B application approval rate',
        }] : []),
        ...(config.h1bStats.fiscalYears ? [{
          '@type': 'PropertyValue',
          name: 'h1bDataCoverage',
          value: config.h1bStats.fiscalYears.join(', '),
          description: 'Fiscal years with available H1B data',
        }] : []),
      ],
    }),
    
    // Offers and job postings relationship
    makesOffer: {
      '@type': 'Offer',
      category: 'Employment',
      description: 'H1B visa sponsored employment opportunities',
      eligibleRegion: {
        '@type': 'Country',
        name: 'United States',
      },
      priceSpecification: config.h1bStats ? {
        '@type': 'PriceSpecification',
        minPrice: Math.round(config.h1bStats.avgSalary * 0.7),
        maxPrice: Math.round(config.h1bStats.avgSalary * 1.5),
        priceCurrency: 'USD',
        unitText: 'per year',
      } : undefined,
    },
    
    // Brand and recognition
    brand: {
      '@type': 'Brand',
      name: config.name,
      description: `${config.name} as an H1B visa sponsor`,
    },
    
    // Member of organization types
    memberOf: [
      {
        '@type': 'Organization',
        name: 'H1B Visa Sponsors',
        description: 'Community of organizations that sponsor H1B visas',
      },
    ],
    
    // Awards or recognition (if applicable)
    ...(config.h1bStats && config.h1bStats.totalApplications > 1000 && {
      award: 'Major H1B Sponsor',
      description: `${config.name} is recognized as a major H1B visa sponsor with significant hiring of international talent`,
    }),
    
    // Related pages
    subjectOf: [
      {
        '@type': 'WebPage',
        name: `${config.name} H1B Data`,
        url: `${baseUrl}/h1b-dashboard/company/${companySlug}`,
        description: `Detailed H1B sponsorship data and analytics for ${config.name}`,
      },
    ],
    
    // Department or subsidiary information (for large corporations)
    department: config.h1bStats?.topJobCategories?.map(category => ({
      '@type': 'Organization',
      name: `${config.name} ${category} Department`,
      description: `${category} division with H1B hiring activity`,
      parentOrganization: {
        '@type': 'Organization',
        name: config.name,
      },
    })),
  };
};

/**
 * Generates simplified organization schema for smaller employers
 */
export const generateSimpleOrganizationSchema = (name: string, totalApplications: number, avgSalary: number) => {
  return generateOrganizationSchema({
    name,
    h1bStats: {
      totalApplications,
      avgSalary,
    },
  });
};

/**
 * Generates organization schema for tech companies with enhanced properties
 */
export const generateTechOrganizationSchema = (config: OrganizationSchemaConfig) => {
  return {
    ...generateOrganizationSchema(config),
    industry: 'Technology',
    knowsAbout: [
      ...((generateOrganizationSchema(config).knowsAbout as string[]) || []),
      'Software development',
      'Technology innovation',
      'STEM employment',
      'Technical talent acquisition',
    ],
    additionalType: ['Organization', 'TechCompany', 'H1BVisaSponsor'],
    seeks: {
      '@type': 'Demand',
      name: 'Technical talent',
      description: 'International professionals in technology and engineering fields',
    },
  };
};