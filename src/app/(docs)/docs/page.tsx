"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/ui/code-block";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
	return (
		<div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
			<div className="space-y-4">
				<h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
				<p className="text-muted-foreground text-lg">
					Learn how to integrate vector search and RAG capabilities into your
					Next.js application.
				</p>
			</div>

			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Quick Start</AlertTitle>
				<AlertDescription>
					Follow the setup instructions below to get started with vector search
					in minutes. Make sure you have PostgreSQL with pgvector extension
					enabled.
				</AlertDescription>
			</Alert>

			<Card className="p-1">
				<Tabs defaultValue="setup" className="space-y-6">
					<TabsList className="w-full grid grid-cols-4 p-1">
						<TabsTrigger value="setup" className="font-medium">
							Setup
						</TabsTrigger>
						<TabsTrigger value="pgvector" className="font-medium">
							PGVector
						</TabsTrigger>
						<TabsTrigger value="vectordb" className="font-medium">
							VectorDB
						</TabsTrigger>
						<TabsTrigger value="examples" className="font-medium">
							Examples
						</TabsTrigger>
					</TabsList>

					<div className="p-6">
						<TabsContent value="setup" className="m-0 space-y-8">
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">
									Getting Started
								</h2>
								<p className="text-muted-foreground">
									Complete these steps to set up vector search in your
									application.
								</p>
							</div>

							<div className="space-y-6">
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Badge variant="outline">Step 1</Badge>
										<h3 className="text-lg font-semibold">Database Setup</h3>
									</div>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<p>Create a Postgres database with either:</p>
										<ul className="list-disc list-inside space-y-2 text-muted-foreground">
											<li>Vercel Postgres (recommended for quick start)</li>
											<li>NeonDB (recommended for production)</li>
										</ul>
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Badge variant="outline">Step 2</Badge>
										<h3 className="text-lg font-semibold">
											Environment Variables
										</h3>
									</div>
									<div className="pl-6 border-l-2 border-muted">
										<CodeBlock language="bash">{`
# Database
POSTGRES_URL="postgres://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Inngest (optional, for background jobs)
INNGEST_EVENT_KEY="..."
INNGEST_SIGNING_KEY="..."
                    `}</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Badge variant="outline">Step 3</Badge>
										<h3 className="text-lg font-semibold">Enable pgvector</h3>
									</div>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<p>Connect to your database and run:</p>
										<CodeBlock language="sql">{`CREATE EXTENSION vector;`}</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Badge variant="outline">Step 4</Badge>
										<h3 className="text-lg font-semibold">Create Tables</h3>
									</div>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<p>Using Prisma schema:</p>
										<CodeBlock language="prisma">{`
model items {
  id        BigInt                 @id @default(autoincrement())
  embedding Unsupported("vector")?
  metadata  Json?                  @default("{}")
  createdAt DateTime              @default(now())
  updatedAt DateTime              @updatedAt
}
                    `}</CodeBlock>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="pgvector" className="m-0 space-y-8">
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">
									PGVector Setup
								</h2>
								<p className="text-muted-foreground">
									Configure and optimize your vector database for similarity
									search.
								</p>
							</div>

							<div className="space-y-6">
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Indexing</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<p>Create an index for faster similarity search:</p>
										<CodeBlock language="sql">{`
-- For cosine similarity (recommended for OpenAI embeddings)
CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops);

-- For L2 distance
CREATE INDEX ON items USING hnsw (embedding vector_l2_ops);

-- For inner product
CREATE INDEX ON items USING hnsw (embedding vector_ip_ops);
                    `}</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Index Options</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<p>Customize HNSW parameters:</p>
										<CodeBlock language="sql">{`
CREATE INDEX ON items 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);
                    `}</CodeBlock>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="vectordb" className="m-0 space-y-8">
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">
									VectorDB Usage
								</h2>
								<p className="text-muted-foreground">
									Configure and use the VectorDB library for efficient vector
									storage and retrieval.
								</p>
							</div>

							<div className="space-y-6">
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Configuration</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<CodeBlock language="typescript">{`
const vectorDB = new VectorDB({
  tableName: 'items',
  columns: {
    id: 'id',
    vector: 'embedding',
    content: 'text',
    metadata: 'metadata',
    createdAt: 'createdAt',
  }
}, {
  embedding: {
    model: 'text-embedding-3-small',
    dimensions: 1536,
    distance: 'cosine',
  },
  chunking: {
    method: 'paragraph',
    fixedSize: 500,
  },
  search: {
    defaultLimit: 5,
    reranking: false,
    method: 'hybrid',  // 'vector', 'bm25', or 'hybrid'
    weights: {
      vector: 0.6,     // Weight for vector similarity
      bm25: 0.4,       // Weight for BM25 text relevance
    }
  }
});
                    `}</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Basic Operations</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<CodeBlock language="typescript">{`
// Add text with automatic chunking
await vectorDB.addText(text, {
  chunkingMethod: 'paragraph',
  metadata: { source: 'docs' }
});

// Search similar chunks
const results = await vectorDB.searchSimilar(query, {
  limit: 5,
  distance: 'cosine',
  filter: { source: 'docs' }
});
                    `}</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Search Methods</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<CodeBlock language="typescript">{`
// Vector similarity search
const vectorResults = await vectorDB.search(query, {
  method: 'vector',
  limit: 5
});

// BM25 text relevance search
const bm25Results = await vectorDB.search(query, {
  method: 'bm25',
  limit: 5
});

// Hybrid search (combining vector and BM25)
const hybridResults = await vectorDB.search(query, {
  method: 'hybrid',
  weights: {
    vector: 0.6,  // Adjust weights based on your needs
    bm25: 0.4
  },
  limit: 5
});
                    `}</CodeBlock>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="examples" className="m-0 space-y-8">
							<div className="space-y-4">
								<h2 className="text-2xl font-bold tracking-tight">
									Example Usage
								</h2>
								<p className="text-muted-foreground">
									Explore examples of integrating vector search and RAG
									capabilities into your Next.js application.
								</p>
							</div>

							<div className="space-y-6">
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Chat with Documents</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<p>
											See the chat implementation in <code>src/app/(chat)</code>{" "}
											for a complete example of:
										</p>
										<ul className="list-disc list-inside space-y-2 text-muted-foreground">
											<li>Document ingestion with chunking</li>
											<li>Semantic search with metadata filtering</li>
											<li>Streaming chat responses with context</li>
										</ul>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Chunking Methods</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<CodeBlock language="typescript">{`
// Sentence-based chunking
const chunks = vectorDB.chunkText(text, 'sentence');

// Paragraph-based chunking
const chunks = vectorDB.chunkText(text, 'paragraph');

// Fixed-size chunking
const chunks = vectorDB.chunkText(text, 'fixed');
                    `}</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Similarity Metrics</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<CodeBlock language="typescript">
											{`
// Cosine similarity (normalized vectors)
const results = await vectorDB.searchSimilar(query, {
  distance: 'cosine'
});

// Euclidean distance
const results = await vectorDB.searchSimilar(query, {
  distance: 'euclidean'
});

// Inner product
const results = await vectorDB.searchSimilar(query, {
  distance: 'inner_product'
});
                    `}
										</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">
										Search Implementation
									</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<CodeBlock language="typescript">
											{`
// Server Action
export async function searchDocuments(query: string) {
  return vectorDB.search(query, {
    method: 'hybrid',
    weights: {
      vector: 0.6,
      bm25: 0.4,
    },
    limit: 5,
    filter: { source: 'docs' }
  });
}

// API Route
export async function POST(req: Request) {
  const { query, options } = await req.json();
  
  const results = await vectorDB.search(query, {
    method: options?.method || 'hybrid',
    weights: options?.weights,
    limit: options?.limit || 5
  });

  return NextResponse.json({
    results,
    metadata: {
      query,
      count: results.length,
      method: options?.method || 'hybrid'
    }
  });
}

// React Component
function SearchResults({ results }) {
  return results.map(result => (
    <div key={result.id}>
      <div className="text-sm">
        {result.similarity !== undefined && 
          \`Similarity: \${result.similarity.toFixed(3)}\`}
        {result.vectorScore !== undefined && 
          \` (Vector: \${result.vectorScore.toFixed(3)})\`}
        {result.bm25Score !== undefined && 
          \` (BM25: \${result.bm25Score.toFixed(3)})\`}
      </div>
      <div>{result.content}</div>
    </div>
  ));
}`}
										</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">
										Search Methods Comparison
									</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<CodeBlock language="typescript">{`
// Vector search - best for semantic similarity
const semanticResults = await vectorDB.search(
  "What is the meaning of life?",
  { method: 'vector' }
);

// BM25 search - best for keyword matching
const keywordResults = await vectorDB.search(
  "installation requirements postgres",
  { method: 'bm25' }
);

// Hybrid search - balanced approach
const hybridResults = await vectorDB.search(
  "how to implement authentication",
  {
    method: 'hybrid',
    weights: {
      vector: 0.7,  // Emphasize semantic understanding
      bm25: 0.3     // Consider keyword matches
    }
  }
);

// With metadata filtering
const filteredResults = await vectorDB.search(
  "deployment instructions",
  {
    method: 'hybrid',
    weights: { vector: 0.6, bm25: 0.4 },
    filter: {
      category: 'deployment',
      version: 'v2'
    }
  }
);
                    `}</CodeBlock>
									</div>
								</div>

								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Use Case Examples</h3>
									<div className="pl-6 border-l-2 border-muted space-y-3">
										<p>
											Choose the appropriate search method based on the use
											case:
										</p>
										<ul className="list-disc list-inside space-y-2 text-muted-foreground">
											<li>
												Documentation search: Hybrid search for both accuracy
												and relevance
											</li>
											<li>
												Semantic Q&A: Vector search for understanding context
											</li>
											<li>
												Technical search: BM25 for precise terminology matching
											</li>
											<li>
												Chat context: Hybrid search with higher vector weight
											</li>
										</ul>
									</div>
								</div>
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</Card>

			<div className="text-sm text-muted-foreground">
				<p>
					Need help? Check out our{" "}
					<a
						href="https://github.com/hamedmp/nextjs-rag-postgres"
						className="underline"
					>
						GitHub repository
					</a>{" "}
					or join our community.
				</p>
			</div>
		</div>
	);
}
