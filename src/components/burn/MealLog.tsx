'use client';

import { useState } from 'react';
import type { Meal } from './types';

interface MealLogProps {
  meals: Meal[];
  date: string;
  onAdd: () => void;
  onDelete: (id: number) => void;
}

export default function MealLog({ meals, date, onAdd, onDelete }: MealLogProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories || !protein) return;
    setLoading(true);

    await fetch('/api/burn/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs || '0'),
        fat: parseFloat(fat || '0'),
        date,
      }),
    });

    setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
    setAdding(false);
    setLoading(false);
    onAdd();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/burn/meals?id=${id}`, { method: 'DELETE' });
    onDelete(id);
  };

  return (
    <div className="burn-log-section">
      <div className="burn-log-header">
        <span className="burn-log-title">MEALS</span>
        <button className="burn-add-btn" onClick={() => setAdding(!adding)}>
          {adding ? 'CANCEL' : '+ ADD'}
        </button>
      </div>

      {adding && (
        <form className="burn-add-form" onSubmit={handleSubmit}>
          <input
            className="burn-input burn-input-wide"
            placeholder="food name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <div className="burn-input-row">
            <input className="burn-input" placeholder="cal" type="number" value={calories} onChange={e => setCalories(e.target.value)} />
            <input className="burn-input" placeholder="protein (g)" type="number" step="0.1" value={protein} onChange={e => setProtein(e.target.value)} />
            <input className="burn-input" placeholder="carbs (g)" type="number" step="0.1" value={carbs} onChange={e => setCarbs(e.target.value)} />
            <input className="burn-input" placeholder="fat (g)" type="number" step="0.1" value={fat} onChange={e => setFat(e.target.value)} />
          </div>
          <button className="burn-submit-btn" type="submit" disabled={loading}>
            {loading ? 'LOGGING...' : 'LOG MEAL'}
          </button>
        </form>
      )}

      <div className="burn-entries">
        {meals.length === 0 && !adding && (
          <div className="burn-empty">No meals logged today.</div>
        )}
        {meals.map(meal => (
          <div key={meal.id} className="burn-entry">
            <div className="burn-entry-main">
              <span className="burn-entry-name">{meal.name}</span>
              <span className="burn-entry-cal">{meal.calories} cal</span>
            </div>
            <div className="burn-entry-macros">
              <span>P: {meal.protein}g</span>
              <span>C: {meal.carbs}g</span>
              <span>F: {meal.fat}g</span>
              <button className="burn-delete-btn" onClick={() => handleDelete(meal.id)}>x</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
