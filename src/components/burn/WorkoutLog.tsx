'use client';

import { useState } from 'react';
import type { Workout } from './types';

interface WorkoutLogProps {
  workouts: Workout[];
  date: string;
  onAdd: () => void;
  onDelete: (id: number) => void;
}

export default function WorkoutLog({ workouts, date, onAdd, onDelete }: WorkoutLogProps) {
  const [adding, setAdding] = useState(false);
  const [miles, setMiles] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!miles) return;
    setLoading(true);

    await fetch('/api/burn/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ miles: parseFloat(miles), date }),
    });

    setMiles('');
    setAdding(false);
    setLoading(false);
    onAdd();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/burn/workouts?id=${id}`, { method: 'DELETE' });
    onDelete(id);
  };

  return (
    <div className="burn-log-section">
      <div className="burn-log-header">
        <span className="burn-log-title">WORKOUTS</span>
        <button className="burn-add-btn" onClick={() => setAdding(!adding)}>
          {adding ? 'CANCEL' : '+ ADD'}
        </button>
      </div>

      {adding && (
        <form className="burn-add-form" onSubmit={handleSubmit}>
          <input
            className="burn-input"
            placeholder="miles walked"
            type="number"
            step="0.1"
            value={miles}
            onChange={e => setMiles(e.target.value)}
            autoFocus
          />
          <button className="burn-submit-btn" type="submit" disabled={loading}>
            {loading ? 'LOGGING...' : 'LOG WORKOUT'}
          </button>
        </form>
      )}

      <div className="burn-entries">
        {workouts.length === 0 && !adding && (
          <div className="burn-empty">No workouts logged today.</div>
        )}
        {workouts.map(w => (
          <div key={w.id} className="burn-entry">
            <div className="burn-entry-main">
              <span className="burn-entry-name">{w.miles} mi walked</span>
              <span className="burn-entry-cal">-{w.caloriesBurned} cal</span>
            </div>
            <div className="burn-entry-macros">
              <button className="burn-delete-btn" onClick={() => handleDelete(w.id)}>x</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
