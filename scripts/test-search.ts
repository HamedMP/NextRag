import { VectorDB } from '../src/lib/db/vector';

async function testSearch() {
  const db = new VectorDB({
    tableName: 'test_vectors',
    columns: {
      id: 'id',
      vector: 'embedding',
      content: 'content',
      metadata: 'metadata',
      createdAt: 'created_at',
    },
  });

  await db.initialize();

  // Add test data
  const testData = [
    'The quick brown fox jumps over the lazy dog',
    'Pack my box with five dozen liquor jugs',
    'How vexingly quick daft zebras jump',
    'The five boxing wizards jump quickly',
    'Sphinx of black quartz, judge my vow',
  ].join('\n\n');

  await db.addText(testData, { metadata: { source: 'test' } });

  // Test each search method
  console.log('\n=== BM25 Search ===');
  console.log(await db.search('quick jump', { method: 'bm25', limit: 3 }));

  console.log('\n=== Vector Search ===');
  console.log(
    await db.search('animal jumping', { method: 'vector', limit: 2 })
  );

  console.log('\n=== Hybrid Search ===');
  console.log(
    await db.search('quick animal jumps', {
      method: 'hybrid',
      weights: { vector: 0.7, bm25: 0.3 },
      limit: 3,
    })
  );
}

testSearch().catch(console.error);
