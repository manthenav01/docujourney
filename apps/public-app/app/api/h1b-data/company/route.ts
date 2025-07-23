import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import path from 'path';

// Initialize services
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), '../../serviceAccountKey.json'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('name');
    
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name parameter is required' },
        { status: 400 },
      );
    }
    
    const companyData = await bigQueryService.getCompanyAnalysis(companyName);
    
    return NextResponse.json(companyData);
  } catch (error) {
    console.error('Company API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch company data', details: errorMessage },
      { status: 500 },
    );
  }
}
