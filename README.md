# Vector Search + RAG Engineering Demo

A production-ready implementation of Retrieval Augmented Generation (RAG) with vector search capabilities using Next.js and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **React**: React 19
- **Vercel AI SDK**: for RAG
- **Database**: PostgreSQL with pgvector extension
- **Pipeline Management**: Inngest
- **Vector Search**: pgvector for efficient similarity search
- **ORM**: Prisma (coming soon)
- **Styling**: Tailwind CSS + shadcn/ui

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/your-repo
cd your-repo
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the PostgreSQL database with pgvector:

```bash
docker-compose up -d
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- 🔍 Vector similarity search using pgvector
- 🌙 Dark/Light mode with system preference detection
- 🚀 Server-side rendering with Next.js App Router
- 🎨 Modern UI with shadcn components
- 🔄 Real-time updates and streaming responses
- 🛠️ Type-safe database operations (coming soon)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/             # Utility functions and shared logic
└── types/           # TypeScript type definitions
```

## Development

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+

### Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

### Database Setup

The project uses PostgreSQL with the pgvector extension for vector similarity search. The Docker setup handles this automatically.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
