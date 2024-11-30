import { VectorDB } from './vector';
import { expect, describe, it, beforeAll } from 'vitest';

describe('VectorDB', () => {
  const testDB = new VectorDB({
    tableName: 'test_vectors',
    columns: {
      id: 'id',
      vector: 'embedding',
      content: 'content',
      metadata: 'metadata',
      createdAt: 'created_at',
    },
  });

  const testData = [
    'The quick brown fox jumps over the lazy dog',
    'Pack my box with five dozen liquor jugs',
    'How vexingly quick daft zebras jump',
    'The five boxing wizards jump quickly',
    'Sphinx of black quartz, judge my vow',
  ];

  beforeAll(async () => {
    // Initialize BM25 functions and indices
    await testDB.initialize();

    // Add test data
    await testDB.addText(testData.join('\n\n'), {
      metadata: { source: 'test' },
    });
  });

  it('should perform BM25 search correctly', async () => {
    const results = await testDB.search('quick jump', {
      method: 'bm25',
      limit: 3,
    });

    // Should return sentences containing 'quick' or 'jump'
    expect(results.length).toBe(3);
    expect(results.some((r) => r.content.includes('quick'))).toBe(true);
    expect(results.some((r) => r.content.includes('jump'))).toBe(true);
  });

  it('should perform vector search correctly', async () => {
    const results = await testDB.search('animal jumping', {
      method: 'vector',
      limit: 2,
    });

    // Should return semantically similar sentences (about animals/jumping)
    expect(results.length).toBe(2);
    // The fox sentence should be among top results
    expect(results.some((r) => r.content.includes('fox'))).toBe(true);
  });

  it('should perform hybrid search correctly', async () => {
    const results = await testDB.search('quick animal jumps', {
      method: 'hybrid',
      weights: {
        vector: 0.7,
        bm25: 0.3,
      },
      limit: 3,
    });

    expect(results.length).toBe(3);
    expect(results[0].vectorScore).toBeDefined();
    expect(results[0].bm25Score).toBeDefined();
    expect(results[0].combinedScore).toBeDefined();
  });
});
