import { inngest } from '../client';
import { oaiVectorDB as vectorDB } from '@/lib/db/vector';
import { ChunkMetadata, DB_CONFIG } from '@/lib/db/config';

export const embedText = inngest.createFunction(
  { name: 'Embed Text', id: 'embed/text' },
  { event: 'embed/text' },
  async ({ event, step }) => {
    const { text, chunkingMethod } = event.data;

    const result = await step.run('Add Text', () =>
      vectorDB.addText(text, { chunkingMethod })
    );

    return {
      numChunks: result.count,
      success: true,
    };
  }
);

export const embedTextWithMetadata = inngest.createFunction(
  { name: 'Embed Text with Metadata', id: 'embed/text-with-metadata' },
  { event: 'embed/text-with-metadata' },
  async ({ event, step }) => {
    const {
      text,
      chunkingMethod = DB_CONFIG.chunking.defaultMethod,
      metadata = {},
    } = event.data;

    const customMetadata: Partial<ChunkMetadata> = {
      ...metadata,
      chunkingMethod,
    };

    const result = await step.run('Add Text with Metadata', () =>
      vectorDB.addText(text, {
        chunkingMethod,
        metadata: customMetadata,
      })
    );

    return {
      numChunks: result.count,
      metadata: customMetadata,
      success: true,
    };
  }
);

export const embedBatchTexts = inngest.createFunction(
  { name: 'Embed Batch Texts', id: 'embed/batch-texts' },
  { event: 'embed/batch-texts' },
  async ({ event, step }) => {
    const { texts, chunkingMethod, metadata = {} } = event.data;

    const results = await step.run('Process Batch', async () => {
      const promises = texts.map((text) =>
        vectorDB.addText(text, {
          chunkingMethod,
          metadata: {
            ...metadata,
            batchId: event.id, // Add batch tracking
            processedAt: new Date().toISOString(),
          },
        })
      );

      return Promise.all(promises);
    });

    return {
      totalProcessed: results.reduce((acc, r) => acc + r.count, 0),
      batchId: event.id,
      success: true,
    };
  }
);
