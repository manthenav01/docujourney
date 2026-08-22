import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BQueryFilters, H1BApiResponse, H1BAggregatedData, H1BFilterOptions } from '@/lib/types';
import { ValidationError, createServiceError } from '@/lib/validation';
import { cacheService } from '@/lib/cacheService';
import { environment } from '@/lib/config';
import { logger } from '@/lib/logger';

// BigQuery service will be initialized lazily to avoid build-time errors

export async function GET(
  request: NextRequest,
): Promise<NextResponse<H1BApiResponse<H1BAggregatedData | H1BFilterOptions>>> {
  const startTime = Date.now();
  const requestContext = logger.logRequest(request, {
    apiEndpoint: '/api/h1b-data',
  });
  
  try {
    // Log environment info for debugging
    logger.debug('H1B API Environment check', requestContext, {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT_SET',
      HAS_PRIVATE_KEY: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
      HAS_CLIENT_EMAIL: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    });
    
    // Initialize BigQuery service at runtime with error handling
    let bigQueryService;
    try {
      bigQueryService = createH1BBigQueryService();
    } catch (initError) {
      logger.error('Failed to initialize BigQuery service', initError as Error, requestContext);
      throw initError;
    }
    
    const { searchParams } = new URL(request.url);
    
    // Check if this is a filter options request
    if (searchParams.get('type') === 'filterOptions') {
      logger.info('Fetching H1B filter options', requestContext);
      const filterOptions = await bigQueryService.getFilterOptions();
      
      const queryTime = Date.now() - startTime;
      const response: H1BApiResponse<H1BFilterOptions> = {
        data: filterOptions,
        metadata: {
          queryTime,
          source: 'BigQuery',
        },
      };
      // Dynamic cache based on environment
    const cacheControl = process.env.NODE_ENV === 'production' 
      ? 'public, s-maxage=300, stale-while-revalidate=600' // 5 min cache in prod
      : 'no-store, no-cache, must-revalidate'; // No cache in dev
    
    logger.logResponse(requestContext, 200, queryTime, { type: 'filterOptions' });
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': cacheControl,
      },
    });
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

    logger.info('Fetching H1B dashboard data with filters', requestContext, { filters });
    
    // Get real data from BigQuery
    const dashboardData = await bigQueryService.getH1BDashboardData(filters);
    
    const queryTime = Date.now() - startTime;
    
    // Log slow queries
    logger.logSlowQuery('H1BDashboardData', queryTime, requestContext);
    
    logger.info('H1B dashboard data fetched successfully', requestContext, {
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
    
    // Dynamic cache based on environment
    const cacheControl = process.env.NODE_ENV === 'production' 
      ? 'public, s-maxage=300, stale-while-revalidate=600' // 5 min cache in prod
      : 'no-store, no-cache, must-revalidate'; // No cache in dev
    
    logger.logResponse(requestContext, 200, queryTime, { 
      type: 'dashboard', 
      totalApplications: dashboardData.totalApplications, 
    });
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': cacheControl,
      },
    });
    
  } catch (error) {
    const queryTime = Date.now() - startTime;
    const requestType = new URL(request.url).searchParams.get('type') || 'dashboard';
    
    logger.logApiError(
      `H1B data API error (${requestType})`,
      error as Error,
      requestContext,
      {
        requestType,
        queryTime,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
          PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT_SET',
          HAS_CREDENTIALS: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
        },
      },
    );
    
    // Handle validation errors with specific status codes
    if (error instanceof ValidationError) {
      const errorResponse: H1BApiResponse<H1BAggregatedData | H1BFilterOptions> = {
        error: createServiceError(error),
        metadata: {
          queryTime,
          source: 'validation',
        },
      };
      logger.logResponse(requestContext, 400, queryTime, { type: 'validation_error' });
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Handle other errors as internal server errors
    const errorMessage = process.env.VERCEL_ENV === 'production' 
      ? 'Failed to fetch H1B data. Please try again later.'
      : `Failed to fetch H1B data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
    const errorResponse: H1BApiResponse<H1BAggregatedData | H1BFilterOptions> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        details: process.env.VERCEL_ENV !== 'production' ? {
          environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
          hasCredentials: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT_SET',
        } : undefined,
      },
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    logger.logResponse(requestContext, 500, queryTime, { type: 'internal_error' });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

