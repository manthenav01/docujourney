import { NextRequest, NextResponse } from 'next/server';
import { H1BBigQueryService } from '@/lib/h1bBigQueryService';
import path from 'path';

// Initialize services
const bigQueryService = new H1BBigQueryService({
  projectId: 'doctracker-b4528',
  keyFilename: path.join(process.cwd(), 'serviceAccountKey.json')
});


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'autocomplete':
        return await handleAutocomplete(searchParams);
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: autocomplete' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Semantic search API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process semantic search request', details: errorMessage },
      { status: 500 }
    );
  }
}



// Handle autocomplete suggestions
async function handleAutocomplete(searchParams: URLSearchParams) {
  const partialQuery = searchParams.get('query');
  const limit = parseInt(searchParams.get('limit') || '8');
  
  if (!partialQuery) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  try {
    const suggestions = await bigQueryService.getSearchSuggestions(partialQuery, limit);
    
    return NextResponse.json({
      query: partialQuery,
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({
      query: partialQuery,
      suggestions: [],
      count: 0,
      error: 'Failed to fetch suggestions'
    });
  }
}

