import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService, H1BQueryFilters } from '@/lib/h1bBigQueryService';
import { cacheService } from '@/lib/cacheService';
import path from 'path';

// Initialize BigQuery service
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), 'serviceAccountKey.json'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is a filter options request
    if (searchParams.get('type') === 'filterOptions') {
      const options = await bigQueryService.getFilterOptions();
      return NextResponse.json(options);
    }
    
    // Parse filters from query parameters
    const filters: H1BQueryFilters = {};
    
    if (searchParams.get('fiscalYears')) {
      filters.fiscalYears = searchParams.get('fiscalYears')!.split(',');
    }
    
    if (searchParams.get('states')) {
      filters.states = searchParams.get('states')!.split(',');
    }
    
    if (searchParams.get('minSalary') || searchParams.get('maxSalary')) {
      const minSalary = parseInt(searchParams.get('minSalary') || '0');
      const maxSalary = parseInt(searchParams.get('maxSalary') || '500000');
      filters.salaryRange = [minSalary, maxSalary];
    }
    
    if (searchParams.get('searchQuery')) {
      filters.searchQuery = searchParams.get('searchQuery')!;
    }
    
    // Check if this is a request for default dashboard data (no filters)
    const isDefaultRequest = Object.keys(filters).length === 0 || 
      (Object.keys(filters).length === 1 && filters.salaryRange && 
       filters.salaryRange[0] === 0 && filters.salaryRange[1] === 500000);
    
    if (isDefaultRequest) {
      // Try to get data from cache first
      const cacheKey = 'dashboard_default';
      const cachedData = cacheService.get(cacheKey);
      
      if (cachedData) {
        console.log('Serving H1B data from cache (default dashboard)');
        return NextResponse.json(cachedData);
      }
      
      console.log('Cache miss - fetching default H1B data from BigQuery');
      
      // Fetch from BigQuery and cache the result
      const data = await bigQueryService.getH1BDashboardData({});
      
      // Cache for 6 hours (H1B data doesn't change frequently)
      cacheService.set(cacheKey, data, 6 * 60 * 60);
      
      console.log('Default H1B data cached successfully:', {
        totalApplications: data.totalApplications,
        avgSalary: data.avgSalary,
        topEmployersCount: data.topEmployers.length,
        statesCount: data.stateDistribution.length,
      });
      
      return NextResponse.json(data);
    }
    
    // For filtered requests, fetch directly from BigQuery (no caching)
    console.log('Fetching filtered H1B data from BigQuery:', filters);
    
    const data = await bigQueryService.getH1BDashboardData(filters);
    
    console.log('Filtered BigQuery data fetched successfully:', {
      totalApplications: data.totalApplications,
      avgSalary: data.avgSalary,
      topEmployersCount: data.topEmployers.length,
      statesCount: data.stateDistribution.length,
    });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching H1B data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch H1B data', details: errorMessage },
      { status: 500 },
    );
  }
}

// Get filter options endpoint
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'getFilterOptions') {
      const options = await bigQueryService.getFilterOptions();
      return NextResponse.json(options);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error fetching filter options:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch filter options', details: errorMessage },
      { status: 500 },
    );
  }
}
