import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { water } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: fetch water entries for a specific date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  const rows = await db.select().from(water).where(eq(water.date, date));
  return NextResponse.json({ water: rows });
}

// POST: log water intake
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { oz, date } = body;

  if (oz == null || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const [row] = await db.insert(water).values({ oz, date }).returning();
  return NextResponse.json({ water: row });
}
