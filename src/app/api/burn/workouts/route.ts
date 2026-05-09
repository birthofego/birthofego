import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts, weightLog } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { TARGETS } from '@/db/targets';

// GET: fetch workouts for a specific date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  const rows = await db.select().from(workouts).where(eq(workouts.date, date));
  return NextResponse.json({ workouts: rows });
}

// POST: log a workout
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { miles, date } = body;

  if (miles == null || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Get latest weight for calorie burn calculation
  const [latestWeight] = await db.select()
    .from(weightLog)
    .orderBy(desc(weightLog.date))
    .limit(1);

  const weight = latestWeight?.weight ?? TARGETS.defaultWeight;
  const caloriesBurned = Math.round(weight * TARGETS.calBurnPerLbPerMile * miles);

  const [row] = await db.insert(workouts).values({
    miles, caloriesBurned, date,
  }).returning();

  return NextResponse.json({ workout: row });
}

// DELETE: remove a workout by id
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.delete(workouts).where(eq(workouts.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
