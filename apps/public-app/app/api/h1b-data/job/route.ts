import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { ValidationError, createServiceError } from '@/lib/validation';
import { H1BApiResponse, H1BJobAnalysis } from '@/lib/types';

// BigQuery service will be initialized lazily to avoid build-time errors

export async function GET(request: NextRequest): Promise<NextResponse<H1BApiResponse<H1BJobAnalysis>>> {
  const startTime = Date.now();
  
  try {
    // Initialize BigQuery service at runtime
    const bigQueryService = createH1BBigQueryService();
    
    const { searchParams } = new URL(request.url);
    const jobTitle = searchParams.get('title');
    
    if (!jobTitle) {
      const errorResponse: H1BApiResponse<H1BJobAnalysis> = {
        error: {
          code: 'JOB_TITLE_REQUIRED',
          message: 'Job title parameter is required',
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    console.log('Fetching job data for:', { jobTitle });
    const jobData = await bigQueryService.getJobAnalysis(jobTitle);
    
    const queryTime = Date.now() - startTime;
    console.log('Job data fetched successfully:', {
      jobTitle: jobData.title,
      totalApplications: jobData.totalApplications,
      queryTime,
    });
    
    const response: H1BApiResponse<H1BJobAnalysis> = {
      data: jobData,
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('Job API error:', {
      error: error instanceof Error ? error.message : error,
      jobTitle: new URL(request.url).searchParams.get('title'),
      queryTime,
    });
    
    // Handle validation errors with specific status codes
    if (error instanceof ValidationError) {
      const errorResponse: H1BApiResponse<H1BJobAnalysis> = {
        error: createServiceError(error),
        metadata: {
          queryTime,
          source: 'validation',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Handle other errors as internal server errors
    const errorResponse: H1BApiResponse<H1BJobAnalysis> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch job data. Please try again later.',
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