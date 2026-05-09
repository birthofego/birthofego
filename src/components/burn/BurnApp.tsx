'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DaySummary } from './types';
import MacroBar from './MacroBar';
import MealLog from './MealLog';
import WorkoutLog from './WorkoutLog';
import WaterTracker from './WaterTracker';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = todayStr();
  if (dateStr === today) return 'TODAY';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'YESTERDAY';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}

export default function BurnApp() {
  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightForm, setShowWeightForm] = useState(false);

  const fetchDay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/burn/summary?date=${date}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  const navigateDay = (offset: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split('T')[0];
    if (newDate <= todayStr()) setDate(newDate);
  };

  const logWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    await fetch('/api/burn/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: parseFloat(weightInput), date }),
    });
    setWeightInput('');
    setShowWeightForm(false);
    fetchDay();
  };

  if (loading && !data) {
    return (
      <div className="burn-app">
        <div className="burn-loading">Loading...</div>
      </div>
    );
  }

  const t = data?.totals;
  const targets = data?.targets;

  return (
    <div className="burn-app">
      {/* Header */}
      <header className="burn-header">
        <div className="burn-header-left">
          <h1 className="burn-title">BURN</h1>
          <span className="burn-subtitle">NUTRITION TRACKER</span>
        </div>
        <div className="burn-header-right">
          <div className="burn-weight-display" onClick={() => setShowWeightForm(!showWeightForm)}>
            <span className="burn-weight-label">WEIGHT</span>
            <span className="burn-weight-value">{data?.currentWeight ?? '—'} lbs</span>
          </div>
        </div>
      </header>

      {showWeightForm && (
        <form className="burn-weight-form" onSubmit={logWeight}>
          <input
            className="burn-input"
            placeholder="new weight (lbs)"
            type="number"
            step="0.1"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            autoFocus
          />
          <button className="burn-submit-btn" type="submit">LOG WEIGHT</button>
        </form>
      )}

      {/* Date Navigation */}
      <div className="burn-date-nav">
        <button className="burn-date-btn" onClick={() => navigateDay(-1)}>&larr;</button>
        <span className="burn-date-label">{formatDate(date)}</span>
        <button
          className="burn-date-btn"
          onClick={() => navigateDay(1)}
          disabled={date >= todayStr()}
        >
          &rarr;
        </button>
      </div>

      {/* Net Calories — The Big Number */}
      {t && (
        <div className="burn-net-section">
          <div className="burn-net-label">NET CALORIES</div>
          <div className={`burn-net-value ${t.netCalories > (targets?.calories ?? 1700) ? 'burn-over' : ''}`}>
            {t.netCalories}
          </div>
          <div className="burn-net-breakdown">
            {t.calories} eaten - {t.caloriesBurned} burned
          </div>
        </div>
      )}

      {/* Macro Progress Bars */}
      {t && targets && (
        <div className="burn-macros-grid">
          <MacroBar label="CALORIES" current={t.calories} target={targets.calories} unit=" cal" color="#f59e0b" isCeiling />
          <MacroBar label="PROTEIN" current={t.protein} target={targets.protein} unit="g" color="#00d68f" />
          <MacroBar label="CARBS" current={t.carbs} target={targets.carbs} unit="g" color="#3b82f6" isCeiling />
          <MacroBar label="FAT" current={t.fat} target={targets.fat} unit="g" color="#8b5cf6" isCeiling />
        </div>
      )}

      {/* Log Sections */}
      <div className="burn-logs">
        <MealLog
          meals={data?.meals ?? []}
          date={date}
          onAdd={fetchDay}
          onDelete={() => fetchDay()}
        />

        <WorkoutLog
          workouts={data?.workouts ?? []}
          date={date}
          onAdd={fetchDay}
          onDelete={() => fetchDay()}
        />

        {t && (
          <WaterTracker
            entries={data?.water ?? []}
            totalOz={t.waterOz}
            goalOz={t.waterGoal}
            date={date}
            onAdd={fetchDay}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="burn-footer">
        <span>BURN — a birthofego project</span>
      </footer>
    </div>
  );
}
