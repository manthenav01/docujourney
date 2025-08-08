/**
 * Place Schema for H1B Geographic Data
 * Structured data for cities, states, and regions with H1B activity
 */

export interface PlaceSchemaConfig {
  name: string;
  type: 'city' | 'state' | 'region' | 'metropolitanArea';
  description?: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  population?: number;
  h1bStats?: {
    totalApplications: number;
    avgSalary: number;
    medianSalary?: number;
    topEmployers?: string[];
    topJobTitles?: string[];
    industryDistribution?: Array<{
      industry: string;
      percentage: number;
    }>;
    yearOverYearGrowth?: number;
  };
  economicIndicators?: {
    unemploymentRate?: number;
    costOfLiving?: number;
    medianHouseholdIncome?: number;
  };
  demographics?: {
    totalPopulation?: number;
    diversityIndex?: number;
    internationalPopulation?: number;
  };
}

/**
 * Generates comprehensive Place schema for H1B geographic data
 */
export const generatePlaceSchema = (config: PlaceSchemaConfig) => {
  const baseUrl = 'https://usimmigrantcentral.com';
  const placeSlug = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return {
    '@context': 'https://schema.org',
    '@type': getPlaceType(config.type),
    name: config.name,
    description: config.description || `H1B visa job opportunities and salary data in ${config.name}`,
    
    // Geographic properties
    ...(config.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: config.coordinates.latitude,
        longitude: config.coordinates.longitude,
      },
    }),
    
    // Administrative hierarchy
    ...(config.state && config.type === 'city' && {
      containedInPlace: {
        '@type': 'State',
        name: config.state,
        containedInPlace: {
          '@type': 'Country',
          name: config.country || 'United States',
          addressCountry: 'US',
        },
      },
    }),
    
    ...(config.type === 'state' && {
      containedInPlace: {
        '@type': 'Country',
        name: config.country || 'United States',
        addressCountry: 'US',
      },
    }),
    
    // Population and demographics
    ...(config.demographics?.totalPopulation && {
      population: {
        '@type': 'PopulationData',
        populationType: 'total',
        populationCount: config.demographics.totalPopulation,
      },
    }),
    
    // H1B-specific properties
    additionalType: 'H1BJobMarket',
    
    // Economic characteristics
    ...(config.h1bStats && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'h1bJobOpportunities',
          value: config.h1bStats.totalApplications,
          description: `H1B job applications in ${config.name}`,
        },
        {
          '@type': 'PropertyValue',
          name: 'averageH1BSalary',
          value: config.h1bStats.avgSalary,
          unitCode: 'USD',
          description: `Average H1B salary in ${config.name}`,
        },
        ...(config.h1bStats.medianSalary ? [{
          '@type': 'PropertyValue',
          name: 'medianH1BSalary',
          value: config.h1bStats.medianSalary,
          unitCode: 'USD',
          description: `Median H1B salary in ${config.name}`,
        }] : []),
        ...(config.h1bStats.yearOverYearGrowth ? [{
          '@type': 'PropertyValue',
          name: 'h1bGrowthRate',
          value: `${(config.h1bStats.yearOverYearGrowth * 100).toFixed(1)}%`,
          description: `Year-over-year growth in H1B applications in ${config.name}`,
        }] : []),
        ...(config.economicIndicators?.costOfLiving ? [{
          '@type': 'PropertyValue',
          name: 'costOfLivingIndex',
          value: config.economicIndicators.costOfLiving,
          description: `Cost of living index for ${config.name}`,
        }] : []),
      ],
    }),
    
    // Major employers in the area
    ...(config.h1bStats?.topEmployers && {
      containsPlace: config.h1bStats.topEmployers.slice(0, 10).map(employer => ({
        '@type': 'Organization',
        name: employer,
        location: {
          '@type': getPlaceType(config.type),
          name: config.name,
        },
        description: `${employer} with significant H1B hiring in ${config.name}`,
        additionalType: 'H1BEmployer',
      })),
    }),
    
    // Job market characteristics
    ...(config.h1bStats?.topJobTitles && {
      knowsAbout: [
        'H1B visa employment',
        'International talent recruitment',
        'STEM careers',
        ...config.h1bStats.topJobTitles.slice(0, 5),
      ],
    }),
    
    // Industry composition
    ...(config.h1bStats?.industryDistribution && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `${config.name} H1B Job Market`,
        description: `H1B employment opportunities across industries in ${config.name}`,
        itemListElement: config.h1bStats.industryDistribution.map((industry, index) => ({
          '@type': 'Offer',
          position: index + 1,
          name: `${industry.industry} Jobs`,
          category: industry.industry,
          description: `${industry.percentage.toFixed(1)}% of H1B jobs in ${config.name}`,
          areaServed: {
            '@type': getPlaceType(config.type),
            name: config.name,
          },
        })),
      },
    }),
    
    // Tourism and lifestyle (for candidate attraction)
    ...(config.type === 'city' && {
      touristType: 'International professionals',
      amenityFeature: [
        'Business districts',
        'Tech hubs',
        'International community',
        'Professional networking opportunities',
      ],
    }),
    
    // Reference to data page
    subjectOf: {
      '@type': 'WebPage',
      name: `${config.name} H1B Jobs and Salaries`,
      url: `${baseUrl}/h1b-dashboard/city/${placeSlug}`,
      description: `Comprehensive H1B employment data and salary information for ${config.name}`,
    },
    
    // Economic opportunity indicator
    economicActivity: {
      '@type': 'EconomicActivity',
      name: 'H1B Employment Market',
      description: `High-skilled international employment opportunities in ${config.name}`,
    },
    
    // Awards or recognition
    ...(config.h1bStats && config.h1bStats.totalApplications > 10000 && {
      award: 'Major H1B Employment Hub',
      description: `${config.name} is recognized as a major destination for H1B professionals`,
    }),
    
    // Statistical population for H1B workers
    populationType: {
      '@type': 'StatisticalPopulation',
      populationType: 'H1B visa holders',
      numConstraints: config.h1bStats?.totalApplications,
      location: {
        '@type': getPlaceType(config.type),
        name: config.name,
      },
    },
  };
};

/**
 * Maps place type to schema.org type
 */
function getPlaceType(type: PlaceSchemaConfig['type']): string {
  switch (type) {
    case 'city':
      return 'City';
    case 'state':
      return 'State';
    case 'region':
      return 'Region';
    case 'metropolitanArea':
      return 'City'; // Schema.org doesn't have MetropolitanArea
    default:
      return 'Place';
  }
}

/**
 * Generates place schema for tech hubs
 */
export const generateTechHubSchema = (config: PlaceSchemaConfig) => {
  const baseSchema = generatePlaceSchema({
    ...config,
    description: `${config.description || ''} Major technology hub with significant H1B employment opportunities in software, engineering, and innovation.`.trim(),
  });
  
  return {
    ...baseSchema,
    additionalType: ['Place', 'TechHub', 'H1BJobMarket'],
  };
};

/**
 * Generates place schema for major metropolitan areas
 */
export const generateMetroAreaSchema = (config: PlaceSchemaConfig) => {
  return generatePlaceSchema({
    ...config,
    type: 'metropolitanArea',
    description: `${config.description || ''} Major metropolitan area with diverse H1B employment across multiple industries.`.trim(),
  });
};