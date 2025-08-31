import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BQueryFilters, H1BApiResponse, H1BJobTitleDistribution } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('[DEBUG] Certified Jobs API Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT_SET',
      HAS_PRIVATE_KEY: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
      HAS_CLIENT_EMAIL: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    });
    
    // Initialize BigQuery service
    let bigQueryService;
    try {
      bigQueryService = createH1BBigQueryService();
      console.log('[DEBUG] BigQuery service created successfully');
    } catch (initError) {
      console.error('[DEBUG] Failed to initialize BigQuery service:', initError);
      throw initError;
    }
    
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: H1BQueryFilters = {};
    
    if (searchParams.has('fiscalYears')) {
      filters.fiscalYears = searchParams.get('fiscalYears')?.split(',') || [];
    }
    
    if (searchParams.has('states')) {
      filters.states = searchParams.get('states')?.split(',') || [];
    }
    
    if (searchParams.has('salaryRange')) {
      const salaryRange = searchParams.get('salaryRange')?.split(',');
      if (salaryRange && salaryRange.length === 2) {
        filters.salaryRange = [Number(salaryRange[0]), Number(salaryRange[1])];
      }
    }

    console.log('[DEBUG] Fetching top certified job titles with filters:', filters);
    
    // Get top certified job titles from BigQuery
    const certifiedJobs = await bigQueryService.getTopCertifiedJobTitles(filters, 10);
    
    const queryTime = Date.now() - startTime;
    console.log('[DEBUG] Certified jobs data fetched successfully:', {
      jobCount: certifiedJobs.length,
      queryTime,
    });
    
    const response: H1BApiResponse<H1BJobTitleDistribution[]> = {
      data: certifiedJobs,
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        // Dynamic cache based on environment
        'Cache-Control': process.env.NODE_ENV === 'production' 
          ? 'public, s-maxage=300, stale-while-revalidate=600' // 5 min cache in prod
          : 'no-store, no-cache, must-revalidate', // No cache in dev
      },
    });
  } catch (error) {
    console.error('[DEBUG] Error in certified jobs API:', error);
    
    const queryTime = Date.now() - startTime;
    const errorResponse: H1BApiResponse<H1BJobTitleDistribution[]> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.VERCEL_ENV === 'production' 
          ? 'Failed to fetch certified jobs data. Please try again later.'
          : `Failed to fetch certified jobs data: ${error instanceof Error ? error.message : 'Unknown error'}`,
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