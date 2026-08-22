/**
 * Visual Artwork Schema for Data Visualizations
 * Enhanced schema markup for charts and interactive visualizations
 */

export interface VisualArtworkConfig {
  name: string;
  description: string;
  visualType: 'chart' | 'dashboard' | 'infographic' | 'map' | 'timeline';
  dataSubject: string;
  interactivity: 'static' | 'interactive' | 'real-time';
  dimensions?: {
    width?: number;
    height?: number;
  };
  colorScheme?: string[];
  accessibility?: {
    altText: string;
    screenReaderCompatible: boolean;
  };
}

/**
 * Creates comprehensive VisualArtwork schema for data visualizations
 */
export const generateVisualArtworkSchema = (config: VisualArtworkConfig) => {
  const baseUrl = 'https://www.usimmigrantcentral.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': ['VisualArtwork', 'CreativeWork'],
    name: config.name,
    description: config.description,
    creator: {
      '@type': 'Organization',
      name: 'Immigrant Central',
      url: baseUrl,
      sameAs: [
        `${baseUrl}/about`,
        'https://github.com/docujourney',
      ],
    },
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    inLanguage: 'en-US',
    
    // Visual properties
    artform: 'Data Visualization',
    artMedium: 'Digital Interactive Media',
    artworkSurface: 'Web Interface',
    genre: `${config.visualType} visualization`,
    
    // Technical properties
    encodingFormat: 'text/html',
    contentSize: config.dimensions ? `${config.dimensions.width}x${config.dimensions.height}` : undefined,
    
    // Subject matter
    about: {
      '@type': 'Dataset',
      name: `H1B ${config.dataSubject} Data`,
      description: `Comprehensive analysis of H1B visa ${config.dataSubject.toLowerCase()} patterns and trends`,
      keywords: [
        'H1B visa',
        'immigration data',
        config.dataSubject.toLowerCase(),
        'data visualization',
        'analytics dashboard',
      ],
    },
    
    // Accessibility
    accessibilityFeature: config.accessibility ? [
      'alternativeText',
      'structuralNavigation',
      ...(config.accessibility.screenReaderCompatible ? ['screenReaderAccessible'] : []),
    ] : undefined,
    
    alternativeHeadline: config.accessibility?.altText,
    
    // Interaction capabilities
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: {
        '@type': 'Action',
        name: config.interactivity === 'interactive' ? 'InteractAction' : 'ViewAction',
      },
    },
    
    // Educational value
    educationalUse: [
      'immigration research',
      'salary analysis',
      'market trends',
      'policy analysis',
    ],
    
    // License and usage
    license: `${baseUrl}/terms-of-service`,
    usageInfo: `${baseUrl}/terms-of-service`,
    
    // Additional properties for data visualizations
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'visualizationType',
        value: config.visualType,
      },
      {
        '@type': 'PropertyValue',
        name: 'interactivityLevel',
        value: config.interactivity,
      },
      ...(config.colorScheme ? [{
        '@type': 'PropertyValue',
        name: 'colorScheme',
        value: config.colorScheme.join(', '),
      }] : []),
    ],
    
    // Mainentity for the specific data focus
    mainEntity: {
      '@type': 'Thing',
      name: `H1B ${config.dataSubject}`,
      description: `Analysis and insights into H1B visa ${config.dataSubject.toLowerCase()}`,
    },
  };
};

/**
 * Specialized schema for interactive dashboards
 */
export const generateDashboardSchema = (config: Omit<VisualArtworkConfig, 'visualType'>) => {
  return generateVisualArtworkSchema({
    ...config,
    visualType: 'dashboard',
    interactivity: 'interactive',
  });
};

/**
 * Specialized schema for static infographics
 */
export const generateInfographicSchema = (config: Omit<VisualArtworkConfig, 'visualType' | 'interactivity'>) => {
  return generateVisualArtworkSchema({
    ...config,
    visualType: 'infographic',
    interactivity: 'static',
  });
};