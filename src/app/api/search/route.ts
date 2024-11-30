import { searchSimilarChunks, type SearchOptions } from '@/lib/actions/search';
import { NextResponse } from 'next/server';

export interface SearchRequest {
  query: string;
  options?: SearchOptions;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, options } = body as SearchRequest;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query is required and cannot be empty' },
        { status: 400 }
      );
    }

    const results = await searchSimilarChunks(query, options);

    return NextResponse.json({
      results,
      metadata: {
        query,
        options,
        count: results.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    const message = error instanceof Error ? error.message : 'Failed to search';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Optionally add a GET endpoint for simple searches
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '15');
    const method = searchParams.get('method') as SearchOptions['method'];

    const results = await searchSimilarChunks(query, { limit, method });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
