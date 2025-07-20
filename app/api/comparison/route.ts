import { NextRequest, NextResponse } from 'next/server';
import { createComparisonService } from '@/lib/comparisonService';
import { 
  ComparisonConfig, 
  ComparisonEntity, 
  ComparisonFilters,
  ComparisonRequest
} from '@/lib/types/comparison';
import path from 'path';

// Initialize comparison service
const comparisonService = createComparisonService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), 'serviceAccountKey.json')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'compare':
        return await handleComparison(body);
      case 'entitySuggestions':
        return await handleEntitySuggestions(body);
      case 'quickCompare':
        return await handleQuickCompare(body);
      case 'exportComparison':
        return await handleExportComparison(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: compare, entitySuggestions, quickCompare, or exportComparison' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Comparison API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process comparison request', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'templates':
        return await handleComparisonTemplates();
      case 'metrics':
        return await handleAvailableMetrics();
      case 'entityTypes':
        return await handleEntityTypes();
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: templates, metrics, or entityTypes' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Comparison GET API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process comparison request', details: errorMessage },
      { status: 500 }
    );
  }
}

// Handle full comparison analysis
async function handleComparison(body: any) {
  const { entities, config } = body;
  
  if (!entities || !Array.isArray(entities) || entities.length === 0) {
    return NextResponse.json(
      { error: 'Entities array is required and must not be empty' },
      { status: 400 }
    );
  }
  
  if (entities.length > 10) {
    return NextResponse.json(
      { error: 'Maximum 10 entities can be compared at once' },
      { status: 400 }
    );
  }
  
  // Validate and set default config
  const comparisonRequest: ComparisonRequest = {
    entities: entities.map(validateEntity),
    metrics: config?.metrics || getDefaultMetrics(),
    timeframe: config?.timeframe || 'all',
    includeCorrelations: config?.includeCorrelations ?? true,
    includeTrends: config?.includeTrends ?? true,
    includeMarketAnalysis: config?.includeMarketAnalysis ?? true
  };
  
  const result = await comparisonService.performComparison(comparisonRequest);
  
  return NextResponse.json({
    success: true,
    result,
    config: comparisonRequest,
    generatedAt: new Date().toISOString()
  });
}

// Handle entity suggestions for comparison
async function handleEntitySuggestions(body: any) {
  const { type, query, limit = 10 } = body;
  
  if (!type || !['company', 'job_title', 'location', 'industry'].includes(type)) {
    return NextResponse.json(
      { error: 'Valid entity type is required (company, job_title, location, industry)' },
      { status: 400 }
    );
  }
  
  // Generate suggestions based on type
  const suggestions = await generateEntitySuggestions(type, query, limit);
  
  return NextResponse.json({
    type,
    query: query || '',
    suggestions,
    count: suggestions.length
  });
}

// Handle quick comparison (simplified version)
async function handleQuickCompare(body: any) {
  const { entity1, entity2, metric = 'avgSalary' } = body;
  
  if (!entity1 || !entity2) {
    return NextResponse.json(
      { error: 'Two entities are required for quick comparison' },
      { status: 400 }
    );
  }
  
  const quickRequest: ComparisonRequest = {
    entities: [validateEntity(entity1), validateEntity(entity2)],
    metrics: [metric],
    timeframe: 'last_2_years',
    includeCorrelations: false,
    includeTrends: false,
    includeMarketAnalysis: false
  };
  
  const result = await comparisonService.performComparison(quickRequest);
  
  // Simplify result for quick comparison
  const quickResult = {
    entity1: {
      name: result.entities[0].name,
      value: getMetricValue(result.entities[0].metrics, metric),
      rank: result.entities[0].rank || 1
    },
    entity2: {
      name: result.entities[1].name,
      value: getMetricValue(result.entities[1].metrics, metric),
      rank: result.entities[1].rank || 2
    },
    winner: (result.entities[0].rank || 1) < (result.entities[1].rank || 2) ? 'entity1' : 'entity2',
    difference: Math.abs(
      getMetricValue(result.entities[0].metrics, metric) - 
      getMetricValue(result.entities[1].metrics, metric)
    ),
    percentageDifference: calculatePercentageDifference(
      getMetricValue(result.entities[0].metrics, metric),
      getMetricValue(result.entities[1].metrics, metric)
    )
  };
  
  return NextResponse.json({
    success: true,
    metric,
    result: quickResult,
    generatedAt: new Date().toISOString()
  });
}

// Handle export comparison
async function handleExportComparison(body: any) {
  const { comparisonId, format = 'json', options = {} } = body;
  
  if (!comparisonId) {
    return NextResponse.json(
      { error: 'Comparison ID is required' },
      { status: 400 }
    );
  }
  
  // For now, return a mock export URL
  // In a real implementation, this would generate the actual export file
  const exportUrl = `/api/comparison/export/${comparisonId}.${format}`;
  
  return NextResponse.json({
    success: true,
    exportUrl,
    format,
    estimatedSize: '2.5MB',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  });
}

// Handle comparison templates
async function handleComparisonTemplates() {
  const templates = [
    {
      id: 'big-tech-comparison',
      name: 'Big Tech Companies',
      description: 'Compare major technology companies',
      entities: [
        { type: 'company', name: 'Google', displayName: 'Google LLC' },
        { type: 'company', name: 'Microsoft', displayName: 'Microsoft Corporation' },
        { type: 'company', name: 'Amazon', displayName: 'Amazon.com Inc' },
        { type: 'company', name: 'Meta', displayName: 'Meta Platforms Inc' }
      ],
      metrics: ['totalApplications', 'avgSalary', 'approvalRate'],
      popular: true
    },
    {
      id: 'software-roles-comparison',
      name: 'Software Engineering Roles',
      description: 'Compare different software engineering positions',
      entities: [
        { type: 'job_title', name: 'Software Engineer', displayName: 'Software Engineer' },
        { type: 'job_title', name: 'Senior Software Engineer', displayName: 'Senior Software Engineer' },
        { type: 'job_title', name: 'Staff Software Engineer', displayName: 'Staff Software Engineer' },
        { type: 'job_title', name: 'Principal Software Engineer', displayName: 'Principal Software Engineer' }
      ],
      metrics: ['avgSalary', 'totalApplications', 'approvalRate'],
      popular: true
    },
    {
      id: 'tech-hubs-comparison',
      name: 'Major Tech Hubs',
      description: 'Compare H1B activity in major technology centers',
      entities: [
        { type: 'location', name: 'CA', displayName: 'California' },
        { type: 'location', name: 'WA', displayName: 'Washington' },
        { type: 'location', name: 'NY', displayName: 'New York' },
        { type: 'location', name: 'TX', displayName: 'Texas' }
      ],
      metrics: ['totalApplications', 'avgSalary', 'uniqueEmployers'],
      popular: true
    }
  ];
  
  return NextResponse.json({
    templates,
    count: templates.length
  });
}

// Handle available metrics
async function handleAvailableMetrics() {
  const metrics = [
    {
      id: 'totalApplications',
      name: 'Total Applications',
      description: 'Total number of H1B applications',
      type: 'count',
      format: 'number',
      higherIsBetter: true,
      category: 'volume'
    },
    {
      id: 'approvalRate',
      name: 'Approval Rate',
      description: 'Percentage of applications that were certified',
      type: 'percentage',
      format: 'percentage',
      higherIsBetter: true,
      category: 'success'
    },
    {
      id: 'avgSalary',
      name: 'Average Salary',
      description: 'Mean salary for certified applications',
      type: 'currency',
      format: 'currency',
      higherIsBetter: true,
      category: 'compensation'
    },
    {
      id: 'medianSalary',
      name: 'Median Salary',
      description: 'Median salary for certified applications',
      type: 'currency',
      format: 'currency',
      higherIsBetter: true,
      category: 'compensation'
    }
  ];
  
  return NextResponse.json({
    metrics,
    categories: ['volume', 'success', 'compensation', 'diversity'],
    count: metrics.length
  });
}

// Handle entity types
async function handleEntityTypes() {
  const entityTypes = [
    {
      type: 'company',
      name: 'Companies',
      description: 'Compare different employers',
      examples: ['Google', 'Microsoft', 'Amazon', 'Meta'],
      searchPlaceholder: 'Search companies...'
    },
    {
      type: 'job_title',
      name: 'Job Titles',
      description: 'Compare different job positions',
      examples: ['Software Engineer', 'Data Scientist', 'Product Manager'],
      searchPlaceholder: 'Search job titles...'
    },
    {
      type: 'location',
      name: 'Locations',
      description: 'Compare different states or regions',
      examples: ['California', 'Washington', 'New York', 'Texas'],
      searchPlaceholder: 'Search locations...'
    },
    {
      type: 'industry',
      name: 'Industries',
      description: 'Compare different industry sectors',
      examples: ['Technology', 'Finance', 'Healthcare', 'Consulting'],
      searchPlaceholder: 'Search industries...'
    }
  ];
  
  return NextResponse.json({
    entityTypes,
    count: entityTypes.length
  });
}

// Helper functions

function validateEntity(entity: any): ComparisonEntity {
  if (!entity.type || !entity.name) {
    throw new Error('Entity must have type and name');
  }
  
  return {
    id: `${entity.type}_${entity.name.toLowerCase().replace(/\s+/g, '_')}`,
    type: entity.type,
    name: entity.name,
    displayName: entity.displayName || entity.name,
    metadata: entity.metadata || {}
  };
}

function getDefaultMetrics() {
  return [
    { id: 'totalApplications', name: 'Total Applications', description: '', type: 'count', format: 'number', higherIsBetter: true, category: 'volume' },
    { id: 'approvalRate', name: 'Approval Rate', description: '', type: 'percentage', format: 'percentage', higherIsBetter: true, category: 'success' },
    { id: 'avgSalary', name: 'Average Salary', description: '', type: 'currency', format: 'currency', higherIsBetter: true, category: 'compensation' }
  ];
}

function getMetricValue(metrics: any, metricName: string): number {
  switch (metricName) {
    case 'totalApplications': return metrics.totalApplications || 0;
    case 'approvalRate': return metrics.approvalRate || 0;
    case 'avgSalary': return metrics.avgSalary || 0;
    case 'medianSalary': return metrics.medianSalary || 0;
    default: return 0;
  }
}

function calculatePercentageDifference(value1: number, value2: number): number {
  if (value1 === 0 && value2 === 0) return 0;
  const average = (value1 + value2) / 2;
  return Math.abs(value1 - value2) / average * 100;
}

async function generateEntitySuggestions(type: string, query: string, limit: number) {
  // Mock suggestions - in real implementation, this would query BigQuery
  const suggestions = {
    company: [
      'Google LLC', 'Microsoft Corporation', 'Amazon.com Inc', 'Meta Platforms Inc',
      'Apple Inc', 'Netflix Inc', 'Tesla Inc', 'Uber Technologies Inc'
    ],
    job_title: [
      'Software Engineer', 'Senior Software Engineer', 'Data Scientist', 'Product Manager',
      'Machine Learning Engineer', 'DevOps Engineer', 'Frontend Engineer', 'Backend Engineer'
    ],
    location: [
      'California', 'Washington', 'New York', 'Texas', 'Massachusetts',
      'Illinois', 'Florida', 'Virginia'
    ],
    industry: [
      'Technology', 'Financial Services', 'Healthcare', 'Consulting',
      'Manufacturing', 'Retail', 'Education', 'Government'
    ]
  };
  
  const typeOptions = suggestions[type as keyof typeof suggestions] || [];
  const filtered = query 
    ? typeOptions.filter(option => 
        option.toLowerCase().includes(query.toLowerCase())
      )
    : typeOptions;
  
  return filtered.slice(0, limit).map(name => ({
    type,
    name,
    displayName: name,
    count: Math.floor(Math.random() * 10000) + 1000 // Mock count
  }));
}