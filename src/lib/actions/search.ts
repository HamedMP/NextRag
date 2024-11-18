import { oaiVectorDB } from '@/lib/db/vector';
import { DB_CONFIG } from '@/lib/db/config';

export async function searchSimilarChunks(query: string, limit = 5) {
  return oaiVectorDB.searchSimilar(query, { limit });
}

export async function searchWithOptions(
  query: string,
  options?: {
    limit?: number;
    distance?: typeof DB_CONFIG.embedding.distance;
    filter?: {
      chunkingMethod?: typeof DB_CONFIG.chunking.defaultMethod;
      date?: string;
      [key: string]: unknown;
    };
  }
) {
  return oaiVectorDB.searchSimilar(query, options);
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
  return oaiVectorDB.searchSimilar(query, {
    limit,
    filter: metadata,
  });
}
