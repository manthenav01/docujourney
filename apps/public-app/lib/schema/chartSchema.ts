/**
 * Chart Schema Markup Generators
 * Creates structured data for data visualizations to enhance SEO understanding
 */

export interface ChartSchemaConfig {
  title: string;
  description: string;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap';
  dataSource: string;
  dataPoints?: number;
  dateCreated?: string;
  categories?: string[];
  metrics?: string[];
}

/**
 * Generates VisualArtwork schema for chart components
 */
export const generateChartSchema = (config: ChartSchemaConfig) => {
  const baseUrl = 'https://www.usimmigrantcentral.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: config.title,
    description: config.description,
    artform: 'Data Visualization',
    artMedium: 'Digital Chart',
    artworkSurface: 'Web Canvas',
    creator: {
      '@type': 'Organization',
      name: 'Immigrant Central',
      url: baseUrl,
    },
    dateCreated: config.dateCreated || new Date().toISOString(),
    genre: `${config.chartType} chart`,
    about: {
      '@type': 'Dataset',
      name: 'H1B LCA Database',
      description: config.dataSource,
      keywords: [
        'H1B visa data',
        'immigration statistics',
        'salary analytics',
        'visa sponsorship',
        ...(config.categories || []),
      ],
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${baseUrl}/api/h1b-data`,
      },
      variableMeasured: config.metrics || ['salary', 'applications', 'approval_rate'],
    },
    mainEntity: {
      '@type': 'StatisticalPopulation',
      populationType: 'H1B Visa Applications',
      numConstraints: config.dataPoints,
    },
    additionalType: 'InteractiveChart',
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: 0,
    },
  };
};

/**
 * Generates schema specific to salary charts
 */
export const generateSalaryChartSchema = (config: Omit<ChartSchemaConfig, 'chartType'>) => {
  return generateChartSchema({
    ...config,
    chartType: 'bar',
    metrics: ['averageSalary', 'medianSalary', 'salaryRange'],
    categories: ['salary_analysis', 'wage_data', 'compensation'],
  });
};

/**
 * Generates schema specific to trend charts
 */
export const generateTrendChartSchema = (config: Omit<ChartSchemaConfig, 'chartType'>) => {
  return generateChartSchema({
    ...config,
    chartType: 'line',
    metrics: ['applications_over_time', 'salary_trends', 'approval_rates'],
    categories: ['trend_analysis', 'temporal_data', 'historical_patterns'],
  });
};

/**
 * Generates schema specific to distribution charts (pie/donut)
 */
export const generateDistributionChartSchema = (config: Omit<ChartSchemaConfig, 'chartType'>) => {
  return generateChartSchema({
    ...config,
    chartType: 'pie',
    metrics: ['percentage_distribution', 'category_breakdown'],
    categories: ['distribution_analysis', 'categorical_data'],
  });
};