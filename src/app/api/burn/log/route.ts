import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meals, workouts, water, weightLog } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { TARGETS } from '@/db/targets';

// ── Universal Log Endpoint ──
// Any external client can POST here to log anything.
// Accepts: { type: 'meal' | 'workout' | 'water' | 'weight', ...data }
// Date defaults to today if not provided.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;
  const date = body.date || new Date().toISOString().split('T')[0]; // default today

  try {
    if (type === 'meal') {
      const { name, calories, protein, carbs, fat } = body;
      if (!name || calories == null || protein == null) {
        return NextResponse.json({ error: 'Meal needs: name, calories, protein (carbs/fat optional)' }, { status: 400 });
      }
      const [row] = await db.insert(meals).values({
        name,
        calories,
        protein,
        carbs: carbs ?? 0,
        fat: fat ?? 0,
        date,
      }).returning();
      return NextResponse.json({ ok: true, logged: 'meal', data: row });
    }

    if (type === 'workout') {
      const { miles } = body;
      if (miles == null) {
        return NextResponse.json({ error: 'Workout needs: miles' }, { status: 400 });
      }
      const [latestWeight] = await db.select()
        .from(weightLog)
        .orderBy(desc(weightLog.date))
        .limit(1);
      const weight = latestWeight?.weight ?? TARGETS.defaultWeight;
      const caloriesBurned = Math.round(weight * TARGETS.calBurnPerLbPerMile * miles);

      const [row] = await db.insert(workouts).values({
        miles, caloriesBurned, date,
      }).returning();
      return NextResponse.json({ ok: true, logged: 'workout', caloriesBurned, data: row });
    }

    if (type === 'water') {
      const { oz } = body;
      if (oz == null) {
        return NextResponse.json({ error: 'Water needs: oz' }, { status: 400 });
      }
      const [row] = await db.insert(water).values({ oz, date }).returning();
      return NextResponse.json({ ok: true, logged: 'water', data: row });
    }

    if (type === 'weight') {
      const { weight } = body;
      if (weight == null) {
        return NextResponse.json({ error: 'Weight needs: weight' }, { status: 400 });
      }
      const [row] = await db.insert(weightLog).values({ weight, date }).returning();
      return NextResponse.json({ ok: true, logged: 'weight', data: row });
    }

    return NextResponse.json({ error: 'Invalid type. Use: meal, workout, water, weight' }, { status: 400 });
  } catch (err) {
    console.error('BURN log error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
