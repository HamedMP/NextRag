export const DB_CONFIG = {
  embedding: {
    model: 'text-embedding-3-small',
    dimensions: 1536,
    distance: 'cosine' as 'cosine' | 'euclidean' | 'inner_product',
  },
  chunking: {
    defaultMethod: 'sentence' as 'sentence' | 'paragraph' | 'fixed',
    fixedSize: 500,
  },
  search: {
    defaultLimit: 5,
    reranking: false,
  },
} as const;

export type VectorTableConfig = {
  tableName: string;
  columns: {
    id: string;
    vector: string;
    content?: string;
    metadata?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

export type VectorDBConfig = {
  embedding?: {
    model?: string;
    dimensions?: number;
    distance?: typeof DB_CONFIG.embedding.distance;
  };
  chunking?: {
    method?: typeof DB_CONFIG.chunking.defaultMethod;
    fixedSize?: number;
  };
  search?: {
    defaultLimit?: number;
    reranking?: boolean;
  };
};

export type ChunkMetadata = {
  date: string;
  embeddingModel: string;
  chunkingMethod: typeof DB_CONFIG.chunking.defaultMethod;
  sourceText?: string;
  chunkIndex: number;
  totalChunks: number;
  [key: string]: unknown;
};
