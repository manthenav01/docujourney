import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import path from 'path';

// Initialize BigQuery service
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), '../../serviceAccountKey.json'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const attorneyName = searchParams.get('name');
    const lawFirm = searchParams.get('firm');
    
    if (!attorneyName) {
      return NextResponse.json(
        { error: 'Attorney name is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching attorney data for:', { attorneyName, lawFirm });
    
    const data = await bigQueryService.getAttorneyAnalysis(attorneyName, lawFirm);
    
    console.log('Attorney data fetched successfully:', {
      totalApplications: data.totalApplications,
      certificationRate: data.certificationRate,
      topEmployersCount: data.topEmployers.length,
      topStatesCount: data.topStates.length,
    });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching attorney data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch attorney data', details: errorMessage },
      { status: 500 }
    );
  }
}