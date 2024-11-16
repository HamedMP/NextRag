import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Terminal, Database, Braces, GitBranch } from 'lucide-react';

export default function Home() {
  return (
    <div className='min-h-screen p-4 flex flex-col justify-between'>
      <header className='w-full flex justify-end p-4'>
        <ThemeToggle />
      </header>

      <main className='flex-1 flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto'>
        <div className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl font-mono'>
            Vector Search + RAG
          </h1>
          <p className='text-muted-foreground max-w-[600px] mx-auto'>
            Production-ready implementation of Retrieval Augmented Generation
            with vector search capabilities.
          </p>
        </div>

        <div className='grid sm:grid-cols-2 gap-4 w-full max-w-3xl'>
          <Card className='p-6 border-2 hover:border-primary/50 transition-colors'>
            <div className='flex flex-col gap-4'>
              <Terminal className='h-10 w-10 text-primary' />
              <h2 className='font-semibold text-xl'>Core Stack</h2>
              <ul className='space-y-2 text-muted-foreground'>
                <li className='flex items-center gap-2'>
                  <Database className='h-4 w-4' /> PostgreSQL + pgvector
                </li>
                <li className='flex items-center gap-2'>
                  <GitBranch className='h-4 w-4' /> Inngest pipelines
                </li>
                <li className='flex items-center gap-2'>
                  <Braces className='h-4 w-4' /> Next.js 15
                </li>
                <li className='flex items-center gap-2'>
                  <GitBranch className='h-4 w-4' /> Prisma (Coming Soon)
                </li>
              </ul>
            </div>
          </Card>

          <Card className='p-6 border-2 hover:border-primary/50 transition-colors'>
            <div className='flex flex-col gap-4'>
              <div className='font-mono text-sm'>
                <div className='text-muted-foreground'>// Quick start</div>
                <code className='text-primary'>npm run dev</code>
              </div>
              <div className='flex-1' />
              <div className='flex gap-4'>
                <Button variant='default' className='flex-1' asChild>
                  <a href='/chat'>Try Demo →</a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <footer className='flex justify-center gap-6 py-6 border-t mt-8'>
        <Button variant='ghost' size='sm' asChild>
          <a href='/docs'>Documentation</a>
        </Button>
        <Button variant='ghost' size='sm' asChild>
          <a
            href='https://github.com/yourusername/your-repo'
            target='_blank'
            rel='noopener noreferrer'
          >
            GitHub
          </a>
        </Button>
      </footer>
    </div>
  );
}
