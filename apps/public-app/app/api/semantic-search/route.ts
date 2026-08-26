import { NextRequest, NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import { bigQueryConfig } from '@/lib/config';
import { bqCached, MAX_BYTES_AGG } from '@/lib/bqCache';

// Autocomplete backed by the pre-built agg_search_index table (~13MB) instead
// of four LIKE scans over the 3GB raw table per keystroke. Responses are
// CDN-cached for a week per query string — the index only changes when new
// quarterly DOL data is loaded.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'autocomplete') {
      return NextResponse.json(
        { error: 'Invalid action. Use: autocomplete' },
        { status: 400 },
      );
    }

    return await handleAutocomplete(searchParams);
  } catch (error) {
    console.error('Semantic search API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process semantic search request', details: errorMessage },
      { status: 500 },
    );
  }
}

async function handleAutocomplete(searchParams: URLSearchParams) {
  const partialQuery = searchParams.get('query');
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '8', 10));

  if (!partialQuery) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const q = partialQuery.toLowerCase().trim();

  try {
    // Suggestions for one query string are identical for every visitor, and
    // keystroke prefixes repeat massively across users — cache per string.
    const suggestions = await bqCached(['ac', q.slice(0, 40), String(limit)], async () => {
      const bigquery = new BigQuery({
        projectId: bigQueryConfig.projectId,
        credentials: bigQueryConfig.credentials,
      });

      // Prefix matches first (what autocomplete users expect), then substring
      // matches, each ranked by application volume.
      const [rows] = await bigquery.query({
        query: `
          SELECT text, type, score
          FROM \`${bigQueryConfig.projectId}.h1b_data.agg_search_index\`
          WHERE STARTS_WITH(text_lower, @q) OR CONTAINS_SUBSTR(text_lower, @q)
          ORDER BY STARTS_WITH(text_lower, @q) DESC, score DESC
          LIMIT @limit`,
        params: { q, limit },
        maximumBytesBilled: MAX_BYTES_AGG,
      });

      return rows.map((row: any) => ({
        text: row.text,
        type: row.type,
        count: Number(row.score) || 0,
      }));
    });

    return NextResponse.json(
      {
        query: partialQuery,
        suggestions,
        count: suggestions.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
        },
      },
    );
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
