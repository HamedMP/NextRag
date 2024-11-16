import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className='min-h-screen p-8 flex flex-col justify-between'>
      <main className='flex-1 flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold tracking-tight'>
          RAG with Next.js + Postgres
        </h1>

        <Card className='p-6 w-full'>
          <div className='flex flex-col gap-4'>
            <p className='text-muted-foreground'>
              A minimal implementation of Retrieval Augmented Generation using:
            </p>
            <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
              <li>Next.js</li>
              <li>PostgreSQL (with pgvector)</li>
              <li>Prisma (coming soon)</li>
              <li>ZenStack (coming soon)</li>
            </ul>
          </div>
        </Card>

        <div className='flex gap-4 mt-6'>
          <Button variant='default' asChild>
            <a href='/chat'>Try Demo →</a>
          </Button>
          <Button variant='outline' asChild>
            <a
              href='https://github.com/yourusername/your-repo'
              target='_blank'
              rel='noopener noreferrer'
            >
              View on GitHub
            </a>
          </Button>
        </div>
      </main>

      <footer className='flex justify-center gap-6 py-6 border-t'>
        <Button variant='ghost' size='sm' asChild>
          <a href='/docs'>Docs</a>
        </Button>
        <Button variant='ghost' size='sm' asChild>
          <a href='/about'>About</a>
        </Button>
      </footer>
    </div>
  );
}
