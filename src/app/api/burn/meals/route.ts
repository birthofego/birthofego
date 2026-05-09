import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meals } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: fetch meals for a specific date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  const rows = await db.select().from(meals).where(eq(meals.date, date));
  return NextResponse.json({ meals: rows });
}

// POST: add a meal
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, calories, protein, carbs, fat, date } = body;

  if (!name || calories == null || protein == null || carbs == null || fat == null || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const [row] = await db.insert(meals).values({
    name, calories, protein, carbs, fat, date,
  }).returning();

  return NextResponse.json({ meal: row });
}

// DELETE: remove a meal by id
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.delete(meals).where(eq(meals.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
