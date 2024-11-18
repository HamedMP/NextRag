import { query } from './pg';
import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

import {
  DB_CONFIG,
  ChunkMetadata,
  VectorTableConfig,
  VectorDBConfig,
} from './config';

type ChunkingMethod = 'sentence' | 'paragraph' | 'fixed';

interface VectorDBConfigType {
  embedding: {
    model: string;
    dimensions: number;
    distance: 'cosine' | 'euclidean' | 'inner_product';
  };
  chunking: {
    defaultMethod: ChunkingMethod;
    fixedSize: number;
  };
  search: {
    defaultLimit: number;
    reranking: boolean;
  };
}

export class VectorDB {
  private embeddingModel;
  private tableConfig: VectorTableConfig;
  private config: VectorDBConfigType;

  constructor(tableConfig: VectorTableConfig, config?: VectorDBConfig) {
    this.tableConfig = tableConfig;
    this.config = {
      embedding: {
        ...DB_CONFIG.embedding,
        ...config?.embedding,
      },
      chunking: {
        ...DB_CONFIG.chunking,
        ...config?.chunking,
      },
      search: {
        ...DB_CONFIG.search,
        ...config?.search,
      },
    };

    this.embeddingModel = openai.embedding(this.config.embedding.model);
  }

  /**
   *
   * Adds chunks to the database with their embeddings
   */
  async addChunks(chunks: string[], metadata?: Partial<ChunkMetadata>) {
    try {
      const { embeddings } = await embedMany({
        model: this.embeddingModel,
        values: chunks,
      });

      const baseMetadata: ChunkMetadata = {
        date: new Date().toISOString(),
        embeddingModel: this.config.embedding.model,
        chunkingMethod: this.config.chunking.defaultMethod,
        chunkIndex: 0,
        totalChunks: chunks.length,
        ...metadata,
      };

      for (let i = 0; i < chunks.length; i++) {
        await query(
          `INSERT INTO ${this.tableConfig.tableName} (
            "${this.tableConfig.columns.content}", 
            "${this.tableConfig.columns.vector}", 
            "${this.tableConfig.columns.metadata}"
          )
          VALUES ($1, $2::vector, $3)`,
          [
            chunks[i],
            JSON.stringify(embeddings[i]),
            JSON.stringify({ ...baseMetadata, chunkIndex: i }),
          ]
        );
      }

      return { count: chunks.length };
    } catch (error) {
      console.error('Error in addChunks:', error);
      throw error;
    }
  }

  /**
   * Searches for similar chunks using different distance metrics
   */
  async searchSimilar(
    searchQuery: string,
    options?: {
      limit?: number;
      distance?: typeof DB_CONFIG.embedding.distance;
      filter?: Record<string, unknown>;
      select?: string[];
    }
  ) {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: searchQuery,
    });

    const distanceOp = {
      cosine: '<=>',
      euclidean: '<->',
      inner_product: '<#>',
    }[options?.distance || this.config.embedding.distance];

    const columns = this.tableConfig.columns;
    const selectColumns =
      options?.select?.map((col) => `"${col}"`) ||
      [columns.content, columns.metadata, columns.createdAt]
        .filter(Boolean)
        .map((col) => `"${col}"`);

    let filterClause = '';
    if (options?.filter && columns.metadata) {
      filterClause =
        'WHERE ' +
        Object.entries(options.filter)
          .map(
            ([key, value]) => `"${columns.metadata}"->>'${key}' = '${value}'`
          )
          .join(' AND ');
    }

    const { rows } = await query(
      `SELECT 
        ${selectColumns.join(', ')},
        "${columns.vector}" ${distanceOp} $1::vector AS distance
      FROM "${this.tableConfig.tableName}"
      ${filterClause}
      ORDER BY distance ASC
      LIMIT $2`,
      [
        JSON.stringify(embedding),
        options?.limit || this.config.search.defaultLimit,
      ]
    );

    return rows;
  }

  /**
   * Utility function to chunk text
   */
  chunkText(
    text: string,
    method = this.config.chunking.defaultMethod
  ): string[] {
    switch (method) {
      case 'sentence':
        return text
          .trim()
          .split('.')
          .filter(Boolean)
          .map((s) => s.trim());
      case 'paragraph':
        return text
          .trim()
          .split('\n\n')
          .filter(Boolean)
          .map((p) => p.trim());
      case 'fixed':
        const chunks: string[] = [];
        const words = text.split(' ');
        let currentChunk = '';

        for (const word of words) {
          if (
            currentChunk.length + word.length >
            this.config.chunking.fixedSize
          ) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk += ' ' + word;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }
    return [];
  }

  /**
   * Adds text by first chunking it
   */
  async addText(
    text: string,
    options?: {
      chunkingMethod?: ChunkingMethod;
      metadata?: Partial<ChunkMetadata>;
    }
  ) {
    const chunks = this.chunkText(text, options?.chunkingMethod);
    return this.addChunks(chunks, {
      ...options?.metadata,
      sourceText: text.slice(0, 100) + '...',
      chunkingMethod:
        options?.chunkingMethod || this.config.chunking.defaultMethod,
    });
  }

  async select(
    options: {
      limit?: number;
      filter?: Record<string, unknown>;
      orderBy?: string;
      order?: 'ASC' | 'DESC';
    } = {}
  ) {
    const limit = options.limit || 10;
    const orderBy = options.orderBy
      ? `ORDER BY ${options.orderBy} ${options.order || 'ASC'}`
      : '';

    const { rows } = await query(
      `SELECT ${Object.values(this.tableConfig.columns)
        .filter(Boolean)
        .map((col) => `"${col}"`)
        .join(', ')}
      FROM "${this.tableConfig.tableName}"
      ${orderBy}
      LIMIT $1`,
      [limit]
    );

    return rows;
  }
}

// Example instances for different tables
export const oaiVectorDB = new VectorDB({
  tableName: 'oai',
  columns: {
    id: 'id',
    vector: 'embedding',
    content: 'chunk',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
});

export const itemsVectorDB = new VectorDB({
  tableName: 'items',
  columns: {
    id: 'id',
    vector: 'embedding',
  },
});
