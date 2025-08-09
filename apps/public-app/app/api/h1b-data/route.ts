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
            certifiedApplications: 392400,
            deniedApplications: 22500,
            withdrawnApplications: 35100,
            certificationRate: 87.2,
            avgSalary: 105000,
            medianSalary: 95000,
            uniqueEmployers: 15000,
            uniqueJobTitles: 409045,
            uniqueStates: 50,
            uniqueAttorneys: 8500,
            uniqueLawFirms: 1200,
            topEmployers: [
              { employer: 'GOOGLE LLC', applications: 7932, avgSalary: 165000, minSalary: 120000, maxSalary: 250000, topState: 'CA', yoyGrowthRate: 5.2, approvalRate: 92.4 },
              { employer: 'MICROSOFT CORPORATION', applications: 7072, avgSalary: 158000, minSalary: 115000, maxSalary: 230000, topState: 'WA', yoyGrowthRate: 3.8, approvalRate: 94.1 },
              { employer: 'AMAZON.COM SERVICES LLC', applications: 6854, avgSalary: 152000, minSalary: 110000, maxSalary: 220000, topState: 'WA', yoyGrowthRate: 7.1, approvalRate: 89.7 },
              { employer: 'APPLE INC.', applications: 5912, avgSalary: 168000, minSalary: 125000, maxSalary: 245000, topState: 'CA', yoyGrowthRate: 4.5, approvalRate: 91.8 },
              { employer: 'META PLATFORMS, INC.', applications: 4789, avgSalary: 178000, minSalary: 135000, maxSalary: 260000, topState: 'CA', yoyGrowthRate: 2.3, approvalRate: 93.2 },
            ],
            jobTitleDistribution: [],
            stateDistribution: [],
            industryDistribution: [
              { industry: 'Technology & Software', applications: 241200, avgSalary: 145000, percentage: 53.6 },
              { industry: 'Other', applications: 169200, avgSalary: 95000, percentage: 37.6 },
              { industry: 'Healthcare & Pharmaceuticals', applications: 17100, avgSalary: 110000, percentage: 3.8 },
              { industry: 'Consulting Services', applications: 12150, avgSalary: 125000, percentage: 2.7 },
              { industry: 'Financial Services', applications: 9900, avgSalary: 135000, percentage: 2.2 },
              { industry: 'Manufacturing', applications: 450, avgSalary: 85000, percentage: 0.1 },
            ],
            yearlyTrends: [],
            topAttorneys: [],
            salaryDistribution: [],
            mostAppliedJob: {
              title: 'SOFTWARE ENGINEER',
              applications: 45000,
            },
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

