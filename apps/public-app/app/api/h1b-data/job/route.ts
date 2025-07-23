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
    const jobTitle = searchParams.get('title');
    
    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title parameter is required' },
        { status: 400 },
      );
    }
    
    const jobData = await bigQueryService.getJobAnalysis(jobTitle);
    
    return NextResponse.json(jobData);
  } catch (error) {
    console.error('Job API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch job data', details: errorMessage },
      { status: 500 },
    );
  }
}