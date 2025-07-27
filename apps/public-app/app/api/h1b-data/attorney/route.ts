import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import { ValidationError, createServiceError } from '@/lib/validation';
import { H1BApiResponse, H1BAttorneyAnalysis } from '@/lib/types';
import path from 'path';

// Initialize BigQuery service with secure configuration
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), '../../serviceAccountKey.json'),
  datasetId: 'h1b_data',
  tableId: 'lca_applications',
});

export async function GET(request: NextRequest): Promise<NextResponse<H1BApiResponse<H1BAttorneyAnalysis>>> {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  
  const attorneyName = searchParams.get('name');
  const lawFirm = searchParams.get('firm');
  
  try {
    
    if (!attorneyName) {
      const errorResponse: H1BApiResponse<H1BAttorneyAnalysis> = {
        error: {
          code: 'ATTORNEY_NAME_REQUIRED',
          message: 'Attorney name is required',
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    console.log('Fetching attorney data for:', { attorneyName, lawFirm });
    
    // Fetch real data from BigQuery
    const attorneyData = await bigQueryService.getAttorneyAnalysis(attorneyName, lawFirm || undefined);
    
    const queryTime = Date.now() - startTime;
    console.log('Attorney data fetched successfully:', {
      attorneyName: attorneyData.attorneyName,
      totalApplications: attorneyData.totalApplications,
      certificationRate: attorneyData.certificationRate,
      queryTime
    });
    
    const response: H1BApiResponse<H1BAttorneyAnalysis> = {
      data: attorneyData,
      metadata: {
        queryTime,
        source: 'BigQuery',
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('Error fetching attorney data:', {
      error: error instanceof Error ? error.message : error,
      attorneyName,
      lawFirm,
      queryTime
    });
    
    // Handle validation errors with specific status codes
    if (error instanceof ValidationError) {
      const errorResponse: H1BApiResponse<H1BAttorneyAnalysis> = {
        error: createServiceError(error),
        metadata: {
          queryTime,
          source: 'validation',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Handle other errors as internal server errors
    const errorResponse: H1BApiResponse<H1BAttorneyAnalysis> = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch attorney data. Please try again later.',
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