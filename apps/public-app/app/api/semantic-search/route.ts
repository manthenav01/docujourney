import { NextRequest, NextResponse } from 'next/server';
import { createH1BBigQueryService } from '@/lib/h1bBigQueryService';

// BigQuery service will be initialized lazily to avoid build-time errors


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
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Semantic search API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process semantic search request', details: errorMessage },
      { status: 500 },
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
    // Initialize BigQuery service at runtime
    const bigQueryService = createH1BBigQueryService();
    const suggestions = await bigQueryService.getSearchSuggestions(partialQuery, limit);
    
    return NextResponse.json({
      query: partialQuery,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({
      query: partialQuery,
      suggestions: [],
      count: 0,
      error: 'Failed to fetch suggestions',
    });
  }
}

