import { pgTable, serial, text, integer, real, date, timestamp } from 'drizzle-orm/pg-core';

// ── Meals ──
// Each row is one food entry (e.g., "3 eggs" or "protein shake")
export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),                    // "grilled chicken breast"
  calories: integer('calories').notNull(),          // 280
  protein: real('protein').notNull(),               // 42.0g
  carbs: real('carbs').notNull(),                   // 0g
  fat: real('fat').notNull(),                       // 12.0g
  date: date('date').notNull(),                     // "2026-05-09"
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Workouts ──
// Each row is one walking session
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  miles: real('miles').notNull(),                   // 2.5
  caloriesBurned: integer('calories_burned').notNull(), // auto-calculated from weight × 0.47 × miles
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Water Intake ──
// Each row is one water entry (e.g., "drank 16oz")
export const water = pgTable('water', {
  id: serial('id').primaryKey(),
  oz: real('oz').notNull(),                         // 16
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Weight Log ──
// Track weight over time — affects calorie burn calc + water goal
export const weightLog = pgTable('weight_log', {
  id: serial('id').primaryKey(),
  weight: real('weight').notNull(),                 // 211.0 lbs
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
