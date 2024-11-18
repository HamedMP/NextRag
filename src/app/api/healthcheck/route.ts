import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db/pg';

export async function GET() {
  console.log('in pg route');
  try {
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Database is not healthy' },
        { status: 500 }
      );
    } else {
      console.log('Database is healthy');
      return NextResponse.json({ message: 'Database is healthy' });
    }
  } catch (error: any) {
    console.error('Database error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    const errorMessage =
      error.code === 'ECONNREFUSED'
        ? 'Unable to connect to database - please check if PostgreSQL is running'
        : 'Failed to fetch data';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
