'use server';

import { oaiVectorDB } from '@/lib/db/vector';
import { DB_CONFIG } from '@/lib/db/config';

// Initialize once at module level
await oaiVectorDB.initialize();

export type SearchMethod = 'vector' | 'bm25' | 'hybrid';

export interface SearchOptions {
  method?: SearchMethod;
  limit?: number;
  weights?: {
    vector?: number;
    bm25?: number;
  };
  filter?: {
    chunkingMethod?: typeof DB_CONFIG.chunking.defaultMethod;
    date?: string;
    [key: string]: unknown;
  };
  distance?: typeof DB_CONFIG.embedding.distance;
}

export async function searchSimilarChunks(query: string, limit = 15) {
  return oaiVectorDB.search(query, {
    method: 'hybrid',
    limit,
    weights: {
      vector: 0.6,
      bm25: 0.4,
    },
  });
}

// You can keep these specialized search functions if needed
export async function searchWithOptions(
  query: string,
  options?: SearchOptions
) {
  return searchSimilarChunks(query, {
    ...options,
    method: 'vector',
  });
}

export async function searchByMetadata(
  query: string,
  metadata: {
    chunkingMethod?: typeof DB_CONFIG.chunking.defaultMethod;
    date?: string;
    [key: string]: unknown;
  },
  limit = 5
) {
  return searchSimilarChunks(query, {
    limit,
    filter: metadata,
    method: 'vector',
  });
}
