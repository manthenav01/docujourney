import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BQueryFilters, H1BApiResponse, H1BAggregatedData, H1BFilterOptions } from '@/lib/types';
import { ValidationError, createServiceError } from '@/lib/validation';
import { cacheService } from '@/lib/cacheService';
import { environment } from '@/lib/config';

// Initialize BigQuery service with environment-aware configuration
const bigQueryService = createH1BBigQueryService();

export async function GET(
  request: NextRequest,
): Promise<NextResponse<H1BApiResponse<H1BAggregatedData | H1BFilterOptions>>> {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is a filter options request
    if (searchParams.get('type') === 'filterOptions') {
      console.log('Fetching H1B filter options');
      const filterOptions = await bigQueryService.getFilterOptions();
      
      const queryTime = Date.now() - startTime;
      const response: H1BApiResponse<H1BFilterOptions> = {
        data: filterOptions,
        metadata: {
          queryTime,
          source: 'BigQuery',
        },
      };
      return NextResponse.json(response);
    }
    
    // Parse filters from query parameters
    const filters: H1BQueryFilters = {};
    
    if (searchParams.has('fiscalYears')) {
      filters.fiscalYears = searchParams.get('fiscalYears')?.split(',') || [];
    }
    
    if (searchParams.has('states')) {
      filters.states = searchParams.get('states')?.split(',') || [];
    }
    
    if (searchParams.has('searchQuery')) {
      filters.searchQuery = searchParams.get('searchQuery') || '';
    }
    
    if (searchParams.has('salaryRange')) {
      const salaryRange = searchParams.get('salaryRange')?.split(',');
      if (salaryRange && salaryRange.length === 2) {
        filters.salaryRange = [Number(salaryRange[0]), Number(salaryRange[1])];
      }
    }

    console.log('Fetching H1B dashboard data with filters:', filters);
    
    // Get real data from BigQuery
    const dashboardData = await bigQueryService.getH1BDashboardData(filters);
    
    const queryTime = Date.now() - startTime;
    console.log('H1B dashboard data fetched successfully:', {
      totalApplications: dashboardData.totalApplications,
      certificationRate: dashboardData.certificationRate,
      queryTime,
    });
    
    const response: H1BApiResponse<H1BAggregatedData> = {
      data: dashboardData,
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('H1B data API error:', {
      error: error instanceof Error ? error.message : error,
      requestType: new URL(request.url).searchParams.get('type') || 'dashboard',
      queryTime,
    });
    
    // Handle validation errors with specific status codes
    if (error instanceof ValidationError) {
      const errorResponse: H1BApiResponse<H1BAggregatedData | H1BFilterOptions> = {
        error: createServiceError(error),
        metadata: {
          queryTime,
          source: 'validation',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Handle other errors as internal server errors
    const errorResponse: H1BApiResponse<H1BAggregatedData | H1BFilterOptions> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch H1B data. Please try again later.',
        timestamp: new Date().toISOString(),
      },
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

