import { inngest } from '@/inngest/client';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env.mjs';

export async function GET() {
  // Return 404 in production and preview
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'preview') {
    return new NextResponse(null, { status: 404 });
  }

  try {
    // Fetch recent events from Inngest
    const events = await inngest.listEvents({
      limit: 20,
      orderBy: 'desc',
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch Inngest events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
