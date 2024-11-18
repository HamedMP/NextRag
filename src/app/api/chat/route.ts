import { openai } from '@ai-sdk/openai';
import { streamText, StreamData } from 'ai';
import { searchSimilarChunks } from '@/lib/actions/search';
import { QueryResultRow } from '@vercel/postgres';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // Create StreamData instance
  const data = new StreamData();

  // Get search results
  const searchResults = await searchSimilarChunks(lastMessage.content);

  // Format context with metadata
  const contextDetails = searchResults?.length
    ? searchResults.map((r: QueryResultRow) => ({
        chunk: r.chunk,
        metadata: {
          distance: r.distance.toFixed(3),
          createdAt: new Date(r.createdAt).toLocaleDateString(),
          ...r.metadata,
        },
      }))
    : [];

  // Append context to stream data
  data.append({ contextDetails });

  const context = contextDetails.length
    ? `Relevant context:\n${contextDetails
        .map(
          (r) =>
            `${r.chunk}\n(Distance: ${r.metadata.distance}, Created: ${r.metadata.createdAt}, Method: ${r.metadata.chunkingMethod}, Index: ${r.metadata.chunkIndex}/${r.metadata.totalChunks})`
        )
        .join('\n\n')}\n\n`
    : '';

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant. Use the provided context to answer questions when available. Always start your response with a brief mention of which context you used, if any.',
      },
      ...(context
        ? [
            {
              role: 'system',
              content: context,
            },
          ]
        : []),
      ...messages,
    ],
    onFinish: () => {
      // Close the stream when done
      data.close();
    },
  });

  // Return the response with the additional stream data
  return result.toDataStreamResponse({ data });
}
