import { prisma } from '@/lib/db/client';
import { items } from '@prisma/client';
import { sql } from '@vercel/postgres';
// import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  // const data = await prisma.items.findMany({});

  const { rows } =
    await sql`SELECT embedding, embedding <-> '[3,1,2]' AS distance FROM items`;

  return NextResponse.json(
    // data.map((item) => ({
    //   ...item,
    //   id: item.id.toString(),
    // }))
    rows
  );
}
