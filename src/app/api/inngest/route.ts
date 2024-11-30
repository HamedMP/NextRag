import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { embedText } from '@/inngest/functions/embedding';
import { retrieveSimilar } from '@/inngest/functions/retrieval';
import { env } from '@/lib/env.mjs';
import { NextResponse } from 'next/server';

const handlers = serve({
  client: inngest,
  functions: [embedText, retrieveSimilar],
});

export const GET = async (req: Request, ctx: any) => {
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'preview') {
    return new NextResponse(null, { status: 404 });
  }
  return handlers.GET(req, ctx);
};

export const POST = async (req: Request, ctx: any) => {
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'preview') {
    return new NextResponse(null, { status: 404 });
  }
  return handlers.POST(req, ctx);
};

export const PUT = async (req: Request, ctx: any) => {
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'preview') {
    return new NextResponse(null, { status: 404 });
  }
  return handlers.PUT(req, ctx);
};
