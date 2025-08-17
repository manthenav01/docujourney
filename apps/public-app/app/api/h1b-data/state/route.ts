import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';
import { H1BStateAnalysis, H1BApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const queryStartTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (!state) {
      const errorResponse: H1BApiResponse<H1BStateAnalysis> = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'State parameter is required',
          timestamp: new Date().toISOString(),
        },
        metadata: {
          queryTime: Date.now() - queryStartTime,
          source: 'validation',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const bigQueryService = createH1BBigQueryService();
    const stateAnalysis: H1BStateAnalysis = await bigQueryService.getStateAnalysis(state);

    const queryTime = Date.now() - queryStartTime;
    
    const response: H1BApiResponse<H1BStateAnalysis> = {
      data: stateAnalysis,
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };

    // Add cache control headers for production
    const nextResponse = NextResponse.json(response);
    
    // Cache for 24 hours in production, 5 minutes in development
    const cacheTime = process.env.NODE_ENV === 'production' ? 86400 : 300;
    nextResponse.headers.set('Cache-Control', `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`);
    
    return nextResponse;
  } catch (error) {
    console.error('Error in state API route:', error);
    const queryTime = Date.now() - queryStartTime;
    
    if (error instanceof Error && error.message.includes('No H1B data found')) {
      const errorResponse: H1BApiResponse<H1BStateAnalysis> = {
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        metadata: {
          queryTime,
          source: 'BigQuery',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    const errorResponse: H1BApiResponse<H1BStateAnalysis> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch state data. Please try again later.',
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