import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import { ValidationError, createServiceError } from '@/lib/validation';
import { H1BApiResponse, H1BCityAnalysis } from '@/lib/types';
import path from 'path';

// Initialize BigQuery service with secure configuration
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), '../../serviceAccountKey.json'),
  datasetId: 'h1b_data',
  tableId: 'lca_applications',
});

export async function GET(request: NextRequest): Promise<NextResponse<H1BApiResponse<H1BCityAnalysis>>> {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const cityName = searchParams.get('city');
    const stateName = searchParams.get('state');
    
    if (!cityName || !stateName) {
      const errorResponse: H1BApiResponse<H1BCityAnalysis> = {
        error: {
          code: 'CITY_STATE_REQUIRED',
          message: 'City name and state name parameters are required',
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    console.log('Fetching city data for:', { cityName, stateName });
    const cityData = await bigQueryService.getCityAnalysis(cityName, stateName);
    
    const queryTime = Date.now() - startTime;
    console.log('City data fetched successfully:', {
      city: cityData.city,
      state: cityData.state,
      totalApplications: cityData.totalApplications,
      queryTime
    });
    
    const response: H1BApiResponse<H1BCityAnalysis> = {
      data: cityData,
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('City API error:', {
      error: error instanceof Error ? error.message : error,
      cityName: new URL(request.url).searchParams.get('city'),
      stateName: new URL(request.url).searchParams.get('state'),
      queryTime
    });
    
    // Handle validation errors with specific status codes
    if (error instanceof ValidationError) {
      const errorResponse: H1BApiResponse<H1BCityAnalysis> = {
        error: createServiceError(error),
        metadata: {
          queryTime,
          source: 'validation',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Handle other errors as internal server errors
    const errorResponse: H1BApiResponse<H1BCityAnalysis> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch city data. Please try again later.',
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