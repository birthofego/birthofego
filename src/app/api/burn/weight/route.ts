import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weightLog } from '@/db/schema';
import { desc } from 'drizzle-orm';

// GET: fetch weight history (latest first)
export async function GET() {
  const rows = await db.select()
    .from(weightLog)
    .orderBy(desc(weightLog.date))
    .limit(30);
  return NextResponse.json({ weights: rows });
}

// POST: log a weight entry
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { weight, date } = body;

  if (weight == null || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const [row] = await db.insert(weightLog).values({ weight, date }).returning();
  return NextResponse.json({ weight: row });
}
