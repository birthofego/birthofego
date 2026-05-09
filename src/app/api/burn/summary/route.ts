import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meals, workouts, water, weightLog } from '@/db/schema';
import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { TARGETS } from '@/db/targets';

// GET: full daily summary for dashboard
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const range = searchParams.get('range'); // '7' or '30' for multi-day

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  // Single day summary
  if (!range) {
    const dayMeals = await db.select().from(meals).where(eq(meals.date, date));
    const dayWorkouts = await db.select().from(workouts).where(eq(workouts.date, date));
    const dayWater = await db.select().from(water).where(eq(water.date, date));

    const [latestWeight] = await db.select()
      .from(weightLog)
      .orderBy(desc(weightLog.date))
      .limit(1);

    const currentWeight = latestWeight?.weight ?? TARGETS.defaultWeight;

    const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);
    const totalBurned = dayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const totalMiles = dayWorkouts.reduce((sum, w) => sum + w.miles, 0);
    const totalWaterOz = dayWater.reduce((sum, w) => sum + w.oz, 0);
    const netCalories = totalCalories - totalBurned;
    const waterGoal = Math.round(currentWeight * TARGETS.waterOzPerLb + totalMiles * TARGETS.waterOzPerMile);

    return NextResponse.json({
      date,
      currentWeight,
      meals: dayMeals,
      workouts: dayWorkouts,
      water: dayWater,
      totals: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        caloriesBurned: totalBurned,
        miles: totalMiles,
        netCalories,
        waterOz: totalWaterOz,
        waterGoal,
      },
      targets: TARGETS,
    });
  }

  // Multi-day range (for charts)
  const days = parseInt(range);
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - days + 1);
  const startStr = startDate.toISOString().split('T')[0];

  const rangeMeals = await db.select().from(meals)
    .where(and(gte(meals.date, startStr), lte(meals.date, date)));
  const rangeWorkouts = await db.select().from(workouts)
    .where(and(gte(workouts.date, startStr), lte(workouts.date, date)));
  const rangeWeights = await db.select().from(weightLog)
    .where(and(gte(weightLog.date, startStr), lte(weightLog.date, date)));
  const rangeWater = await db.select().from(water)
    .where(and(gte(water.date, startStr), lte(water.date, date)));

  // Group by date
  const dailyMap: Record<string, {
    calories: number; protein: number; carbs: number; fat: number;
    burned: number; miles: number; waterOz: number; weight?: number;
  }> = {};

  for (let d = 0; d < days; d++) {
    const dt = new Date(startDate);
    dt.setDate(dt.getDate() + d);
    const key = dt.toISOString().split('T')[0];
    dailyMap[key] = { calories: 0, protein: 0, carbs: 0, fat: 0, burned: 0, miles: 0, waterOz: 0 };
  }

  for (const m of rangeMeals) {
    if (dailyMap[m.date]) {
      dailyMap[m.date].calories += m.calories;
      dailyMap[m.date].protein += m.protein;
      dailyMap[m.date].carbs += m.carbs;
      dailyMap[m.date].fat += m.fat;
    }
  }

  for (const w of rangeWorkouts) {
    if (dailyMap[w.date]) {
      dailyMap[w.date].burned += w.caloriesBurned;
      dailyMap[w.date].miles += w.miles;
    }
  }

  for (const w of rangeWater) {
    if (dailyMap[w.date]) {
      dailyMap[w.date].waterOz += w.oz;
    }
  }

  for (const w of rangeWeights) {
    if (dailyMap[w.date]) {
      dailyMap[w.date].weight = w.weight;
    }
  }

  const dailySummaries = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, data]) => ({ date: d, ...data, netCalories: data.calories - data.burned }));

  return NextResponse.json({
    range: days,
    startDate: startStr,
    endDate: date,
    days: dailySummaries,
    targets: TARGETS,
  });
}
