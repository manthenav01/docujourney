import { NextRequest, NextResponse } from 'next/server';
import { getCompanyAnalysisFromAgg } from '@/lib/aggEntities';
import { ValidationError, createServiceError } from '@/lib/validation';
import { H1BApiResponse, H1BCompanyAnalysis } from '@/lib/types';

// BigQuery service will be initialized lazily to avoid build-time errors

export async function GET(request: NextRequest): Promise<NextResponse<H1BApiResponse<H1BCompanyAnalysis>>> {
  const startTime = Date.now();
  
  try {
    
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('name');
    
    if (!companyName) {
      const errorResponse: H1BApiResponse<H1BCompanyAnalysis> = {
        error: {
          code: 'COMPANY_NAME_REQUIRED',
          message: 'Company name parameter is required',
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    console.log('Fetching company data for:', { companyName });
    const companyData = await getCompanyAnalysisFromAgg(companyName);
    
    const queryTime = Date.now() - startTime;
    console.log('Company data fetched successfully:', {
      companyName: companyData.name,
      totalApplications: companyData.totalApplications,
      queryTime,
    });
    
    const response: H1BApiResponse<H1BCompanyAnalysis> = {
      data: companyData,
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': process.env.NODE_ENV === 'production'
          ? 'public, s-maxage=86400, stale-while-revalidate=604800'
          : 'no-store',
      },
    });
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('Company API error:', {
      error: error instanceof Error ? error.message : error,
      companyName: new URL(request.url).searchParams.get('name'),
      queryTime,
    });
    
    // Handle validation errors with specific status codes
    if (error instanceof ValidationError) {
      const errorResponse: H1BApiResponse<H1BCompanyAnalysis> = {
        error: createServiceError(error),
        metadata: {
          queryTime,
          source: 'validation',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Handle other errors as internal server errors
    const errorResponse: H1BApiResponse<H1BCompanyAnalysis> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch company data. Please try again later.',
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
