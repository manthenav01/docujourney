import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BQueryFilters, H1BWageLevelAnalysis } from '@/lib/types';

// Use static values for Next.js config
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

interface WageLevelApiResponse {
  data?: H1BWageLevelAnalysis;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
  metadata: {
    queryTime: number;
    source: string;
    lastUpdated: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<WageLevelApiResponse>> {
  const startTime = Date.now();
  
  try {
    console.log('📊 Fetching H1B wage level analysis');
    
    // Initialize BigQuery service
    let bigQueryService;
    try {
      bigQueryService = createH1BBigQueryService();
    } catch (initError) {
      console.error('Failed to initialize BigQuery service:', initError);
      throw new Error('Service initialization failed');
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
    
    if (searchParams.has('jobCategories')) {
      filters.jobCategories = searchParams.get('jobCategories')?.split(',') || [];
    }

    console.log('Wage level analysis filters:', filters);
    
    // Get wage level analysis from BigQuery
    const wageLevelData = await bigQueryService.getWageLevelAnalysis(filters);
    
    const queryTime = Date.now() - startTime;
    console.log('✅ Wage level analysis completed:', {
      levelsFound: wageLevelData.wageLevels.length,
      totalApplications: wageLevelData.totalApplications,
      queryTime,
    });
    
    const response: WageLevelApiResponse = {
      data: wageLevelData,
      metadata: {
        queryTime,
        source: 'BigQuery',
        lastUpdated: wageLevelData.lastUpdated,
      },
    };
    
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                          process.env.VERCEL_ENV === 'development' ||
                          (!process.env.VERCEL_ENV && process.env.NODE_ENV !== 'production');
    
    const cacheControl = isDevelopment
      ? 'no-store, no-cache, must-revalidate'
      : 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=3600';
    
    if (isDevelopment) {
      console.log('🔧 Development mode: Cache disabled for wage levels');
    }
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': cacheControl,
      },
    });
    
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('❌ Error fetching wage level analysis:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const errorResponse: WageLevelApiResponse = {
      error: {
        code: 'WAGE_LEVEL_ANALYSIS_ERROR',
        message: process.env.VERCEL_ENV === 'production' 
          ? 'Failed to fetch wage level analysis. Please try again later.'
          : `Failed to fetch wage level analysis: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      },
      metadata: {
        queryTime,
        source: 'BigQuery',
        lastUpdated: new Date().toISOString(),
      },
    };
    
    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}