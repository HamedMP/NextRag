import { inngest } from '../client';
import { searchSimilarChunks } from '@/lib/actions/search';

export const retrieveSimilar = inngest.createFunction(
  { name: 'Retrieve Similar', id: 'retrieve/similar' },
  { event: 'retrieve/similar' },
  async ({ event, step }) => {
    const { query, limit = 5 } = event.data;

    const results = await step.run('Search Similar', () =>
      searchSimilarChunks(query, limit)
    );

    return {
      results,
      success: true,
    };
  }
);
