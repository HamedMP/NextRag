import { sql } from '@vercel/postgres';
import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import {
  DB_CONFIG,
  ChunkMetadata,
  VectorTableConfig,
  VectorDBConfig,
} from './config';

export class VectorDB {
  private embeddingModel;
  private tableConfig: VectorTableConfig;
  private config: typeof DB_CONFIG;

  constructor(tableConfig: VectorTableConfig, config?: VectorDBConfig) {
    this.tableConfig = tableConfig;

    // Merge provided config with defaults
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
   * Adds chunks to the database with their embeddings
   */
  async addChunks(chunks: string[], metadata?: Partial<ChunkMetadata>) {
    const { embeddings } = await embedMany({
      model: this.embeddingModel,
      values: chunks,
    });

    const baseMetadata: ChunkMetadata = {
      date: new Date().toISOString(),
      embeddingModel: this.config.embedding.model,
      chunkingMethod: this.config.chunking.method,
      chunkIndex: 0,
      totalChunks: chunks.length,
      ...metadata,
    };

    const columns = this.tableConfig.columns;
    const insertColumns = [
      columns.content,
      columns.vector,
      columns.metadata,
    ].filter(Boolean);

    await Promise.all(
      chunks.map(
        (chunk, i) =>
          sql`
          INSERT INTO ${sql(this.tableConfig.tableName)} (${sql(
            insertColumns.join(', ')
          )})
          VALUES (
            ${chunk}, 
            ${JSON.stringify(embeddings[i])}, 
            ${
              columns.metadata
                ? JSON.stringify({ ...baseMetadata, chunkIndex: i })
                : undefined
            }
          )
        `
      )
    );

    return { count: chunks.length };
  }

  /**
   * Searches for similar chunks using different distance metrics
   */
  async searchSimilar(
    query: string,
    options?: {
      limit?: number;
      distance?: typeof DB_CONFIG.embedding.distance;
      filter?: Record<string, unknown>;
      select?: string[];
    }
  ) {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: query,
    });

    const distanceOp = {
      cosine: '<=>',
      euclidean: '<->',
      inner_product: '<#>',
    }[options?.distance || this.config.embedding.distance];

    const columns = this.tableConfig.columns;
    const selectColumns =
      options?.select ||
      [columns.content, columns.metadata, columns.createdAt].filter(Boolean);

    let filterClause = '';
    if (options?.filter && columns.metadata) {
      filterClause =
        'WHERE ' +
        Object.entries(options.filter)
          .map(([key, value]) => `${columns.metadata}->>'${key}' = '${value}'`)
          .join(' AND ');
    }

    const { rows } = await sql.query(
      `
      SELECT 
        ${selectColumns.join(', ')},
        ${columns.vector} ${distanceOp} $1::vector AS distance
      FROM ${this.tableConfig.tableName}
      ${filterClause}
      ORDER BY distance ASC
      LIMIT $2
      `,
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
  chunkText(text: string, method = this.config.chunking.method): string[] {
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
  }

  /**
   * Adds text by first chunking it
   */
  async addText(
    text: string,
    options?: {
      chunkingMethod?: typeof DB_CONFIG.chunking.defaultMethod;
      metadata?: Partial<ChunkMetadata>;
    }
  ) {
    const chunks = this.chunkText(text, options?.chunkingMethod);
    return this.addChunks(chunks, {
      ...options?.metadata,
      sourceText: text.slice(0, 100) + '...',
      chunkingMethod: options?.chunkingMethod || this.config.chunking.method,
    });
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
  config: {
    embedding: {
      model: 'text-embedding-3-small',
      dimensions: 1536,
    },
    search: {
      defaultLimit: 10,
    },
  },
});
