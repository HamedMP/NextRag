import { inngest } from '@/inngest/client';
import { NextResponse } from 'next/server';

export async function GET() {
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
