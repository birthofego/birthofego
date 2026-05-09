export interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export interface Workout {
  id: number;
  miles: number;
  caloriesBurned: number;
  date: string;
}

export interface WaterEntry {
  id: number;
  oz: number;
  date: string;
}

export interface WeightEntry {
  id: number;
  weight: number;
  date: string;
}

export interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  caloriesBurned: number;
  miles: number;
  netCalories: number;
  waterOz: number;
  waterGoal: number;
}

export interface Targets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DaySummary {
  date: string;
  currentWeight: number;
  meals: Meal[];
  workouts: Workout[];
  water: WaterEntry[];
  totals: DayTotals;
  targets: Targets;
}
