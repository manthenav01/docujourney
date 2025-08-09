import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BQueryFilters, H1BApiResponse, H1BAggregatedData, H1BFilterOptions } from '@/lib/types';
import { ValidationError, createServiceError } from '@/lib/validation';
import { cacheService } from '@/lib/cacheService';
import { environment } from '@/lib/config';

// BigQuery service will be initialized lazily to avoid build-time errors

export async function GET(
  request: NextRequest,
): Promise<NextResponse<H1BApiResponse<H1BAggregatedData | H1BFilterOptions>>> {
  const startTime = Date.now();
  
  try {
    // Log environment info for debugging
    console.log('H1B API Environment:', {
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
      console.error('Failed to initialize BigQuery service:', initError);
      
      // Return fallback response for development
      if (process.env.NODE_ENV === 'development') {
        const fallbackResponse: H1BApiResponse<H1BAggregatedData> = {
          data: {
            totalApplications: 450000,
            certificationRate: 87.2,
            uniqueEmployers: 15000,
            uniqueJobTitles: 2500,
            uniqueStates: 50,
            uniqueAttorneys: 8500,
            uniqueLawFirms: 1200,
            medianSalary: 95000,
            topEmployers: [
              { employer: 'GOOGLE LLC', applications: 7932, avgSalary: 165000, approvalRate: 92.4 },
              { employer: 'MICROSOFT CORPORATION', applications: 7072, avgSalary: 158000, approvalRate: 94.1 },
              { employer: 'AMAZON.COM SERVICES LLC', applications: 6854, avgSalary: 152000, approvalRate: 89.7 },
              { employer: 'APPLE INC.', applications: 5912, avgSalary: 168000, approvalRate: 91.8 },
              { employer: 'META PLATFORMS, INC.', applications: 4789, avgSalary: 178000, approvalRate: 93.2 },
            ],
            jobTitleDistribution: [],
            stateDistribution: [],
            industryDistribution: [],
            yearlyTrends: [],
            salaryTrends: [],
            topAttorneys: [],
            topLawFirms: [],
          },
          metadata: {
            queryTime: 0,
            source: 'Fallback',
          },
        };
        
        return NextResponse.json(fallbackResponse);
      }
      
      throw initError;
    }
    
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
      stack: error instanceof Error ? error.stack : undefined,
      requestType: new URL(request.url).searchParams.get('type') || 'dashboard',
      queryTime,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT_SET',
        HAS_CREDENTIALS: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
      },
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
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

