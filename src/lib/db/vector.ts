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
type SearchMethod = 'vector' | 'bm25' | 'hybrid';

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
    method: SearchMethod;
    weights: {
      vector: number;
      bm25: number;
    };
  };
}

interface SearchResult {
  [key: string]: any;
  distance?: number;
  bm25_score?: number;
}

export class VectorDB {
  private embeddingModel;
  private tableConfig: VectorTableConfig;
  private config: VectorDBConfigType;
  private initialized: boolean = false;

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
        method: 'hybrid',
        weights: {
          vector: 0.5,
          bm25: 0.5,
        },
        ...config?.search,
      },
    };

    this.embeddingModel = openai.embedding(this.config.embedding.model);
  }

  async initialize() {
    if (this.initialized) return;

    await query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    await query('CREATE EXTENSION IF NOT EXISTS btree_gin');

    await query(`
      CREATE OR REPLACE FUNCTION bm25_weight(
        tf double precision,
        df double precision,
        nr_docs double precision,
        dl double precision,
        avgdl double precision
      ) RETURNS double precision AS $$
      DECLARE
        k1 double precision := 1.2;
        b double precision := 0.75;
        K double precision;
        IDF double precision;
      BEGIN
        K := k1 * (1 - b + b * dl / avgdl);
        IDF := ln((nr_docs - df + 0.5) / (df + 0.5));
        RETURN IDF * (tf * (k1 + 1)) / (tf + K);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    if (this.tableConfig.columns.content) {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_${this.tableConfig.tableName}_content_gin 
        ON ${this.tableConfig.tableName} 
        USING gin(to_tsvector('english', "${this.tableConfig.columns.content}"));
      `);
    }

    this.initialized = true;
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

  private async searchBM25(searchQuery: string, limit: number) {
    if (!this.tableConfig.columns.content) {
      throw new Error('Content column required for BM25 search');
    }

    const { rows } = await query(
      `
      WITH 
      doc_stats AS (
        SELECT 
          AVG(length("${this.tableConfig.columns.content}")) as avgdl,
          COUNT(*) as nr_docs
        FROM "${this.tableConfig.tableName}"
      ),
      query_terms AS (
        SELECT word FROM ts_lexize('english_stem', $1) AS word
      ),
      term_stats AS (
        SELECT 
          d."${this.tableConfig.columns.id}",
          d."${this.tableConfig.columns.content}",
          ${
            this.tableConfig.columns.metadata
              ? `d."${this.tableConfig.columns.metadata}",`
              : ''
          }
          length(d."${this.tableConfig.columns.content}") as dl,
          qt.word,
          count(*) as tf,
          (
            SELECT count(*) 
            FROM "${this.tableConfig.tableName}" d2 
            WHERE to_tsvector('english', d2."${
              this.tableConfig.columns.content
            }") @@ to_tsquery(qt.word::text || ':*')
          ) as df
        FROM "${this.tableConfig.tableName}" d
        CROSS JOIN query_terms qt
        WHERE to_tsvector('english', d."${
          this.tableConfig.columns.content
        }") @@ to_tsquery(qt.word::text || ':*')
        GROUP BY d."${this.tableConfig.columns.id}", d."${
        this.tableConfig.columns.content
      }", qt.word
        ${
          this.tableConfig.columns.metadata
            ? `, d."${this.tableConfig.columns.metadata}"`
            : ''
        }
      )
      SELECT 
        ts."${this.tableConfig.columns.id}",
        ts."${this.tableConfig.columns.content}",
        ${
          this.tableConfig.columns.metadata
            ? `ts."${this.tableConfig.columns.metadata}",`
            : ''
        }
        SUM(
          bm25_weight(
            ts.tf::double precision,
            ts.df::double precision,
            ds.nr_docs::double precision,
            ts.dl::double precision,
            ds.avgdl::double precision
          )
        ) as bm25_score
      FROM term_stats ts
      CROSS JOIN doc_stats ds
      GROUP BY ts."${this.tableConfig.columns.id}", ts."${
        this.tableConfig.columns.content
      }"
      ${
        this.tableConfig.columns.metadata
          ? `, ts."${this.tableConfig.columns.metadata}"`
          : ''
      }
      ORDER BY bm25_score DESC
      LIMIT $2;
    `,
      [searchQuery, limit]
    );

    return rows;
  }

  async search(
    searchQuery: string,
    options?: {
      limit?: number;
      method?: SearchMethod;
      weights?: {
        vector?: number;
        bm25?: number;
      };
      filter?: Record<string, unknown>;
      select?: string[];
    }
  ) {
    const method = options?.method || this.config.search.method;
    const limit = options?.limit || this.config.search.defaultLimit;

    if (method === 'bm25') return this.searchBM25(searchQuery, limit);
    if (method === 'vector') return this.searchSimilar(searchQuery, options);

    // Hybrid search
    const [vectorResults, bm25Results] = await Promise.all([
      this.searchSimilar(searchQuery, { ...options, limit }),
      this.searchBM25(searchQuery, limit),
    ]);

    // If either search returns no results, return results from the other method
    if (!vectorResults.length) return bm25Results.slice(0, limit);
    if (!bm25Results.length) return vectorResults.slice(0, limit);

    const weights = {
      vector: options?.weights?.vector || this.config.search.weights.vector,
      bm25: options?.weights?.bm25 || this.config.search.weights.bm25,
    };

    // Normalize vector distances to similarity scores (0-1)
    const maxDistance = Math.max(...vectorResults.map((r) => r.distance || 0));
    const minDistance = Math.min(...vectorResults.map((r) => r.distance || 0));

    // Normalize BM25 scores (0-1)
    const maxBM25 = Math.max(...bm25Results.map((r) => r.bm25_score || 0));
    const minBM25 = Math.min(...bm25Results.map((r) => r.bm25_score || 0));

    // Combine all results
    const allResults = new Map();

    // Add vector results
    vectorResults.forEach((row) => {
      const distance = row.distance || 0;
      // Convert distance to similarity score (1 is most similar, 0 is least)
      const similarity =
        maxDistance === minDistance
          ? 1
          : 1 - (distance - minDistance) / (maxDistance - minDistance);

      allResults.set(row[this.tableConfig.columns.id], {
        ...row,
        vectorScore: similarity,
        bm25Score: 0,
      });
    });

    // Add or update with BM25 results
    bm25Results.forEach((row) => {
      const id = row[this.tableConfig.columns.id];
      const bm25_score = row.bm25_score || 0;
      // Normalize BM25 score
      const normalizedBM25 =
        maxBM25 === minBM25 ? 1 : (bm25_score - minBM25) / (maxBM25 - minBM25);

      const existing = allResults.get(id);
      if (existing) {
        existing.bm25Score = normalizedBM25;
      } else {
        allResults.set(id, {
          ...row,
          vectorScore: 0,
          bm25Score: normalizedBM25,
        });
      }
    });

    // Calculate combined scores
    const results = Array.from(allResults.values()).map((result) => ({
      ...result,
      similarity:
        result.vectorScore * weights.vector + result.bm25Score * weights.bm25,
    }));

    // Sort by combined similarity score and return top results
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
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
