import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import path from 'path';

// Initialize services
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), 'serviceAccountKey.json'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityName = searchParams.get('city');
    const stateName = searchParams.get('state');
    
    if (!cityName || !stateName) {
      return NextResponse.json(
        { error: 'City name and state name parameters are required' },
        { status: 400 },
      );
    }
    
    const cityData = await bigQueryService.getCityAnalysis(cityName, stateName);
    
    return NextResponse.json(cityData);
  } catch (error) {
    console.error('City API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch city data', details: errorMessage },
      { status: 500 },
    );
  }
}