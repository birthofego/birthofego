'use client';

import { useState } from 'react';
import type { WaterEntry } from './types';

interface WaterTrackerProps {
  entries: WaterEntry[];
  totalOz: number;
  goalOz: number;
  date: string;
  onAdd: () => void;
}

export default function WaterTracker({ entries, totalOz, goalOz, date, onAdd }: WaterTrackerProps) {
  const [oz, setOz] = useState('');
  const [loading, setLoading] = useState(false);
  const pct = Math.min((totalOz / goalOz) * 100, 100);

  const quickAdd = async (amount: number) => {
    setLoading(true);
    await fetch('/api/burn/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oz: amount, date }),
    });
    setLoading(false);
    onAdd();
  };

  const handleCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oz) return;
    await quickAdd(parseFloat(oz));
    setOz('');
  };

  return (
    <div className="burn-log-section">
      <div className="burn-log-header">
        <span className="burn-log-title">WATER</span>
        <span className="burn-water-total">
          {Math.round(totalOz)} / {goalOz} oz
        </span>
      </div>

      <div className="burn-bar-track burn-water-bar">
        <div
          className="burn-bar-fill"
          style={{ width: `${pct}%`, background: '#3b82f6' }}
        />
      </div>

      <div className="burn-water-quick">
        {[8, 12, 16, 24, 32].map(amt => (
          <button
            key={amt}
            className="burn-water-btn"
            onClick={() => quickAdd(amt)}
            disabled={loading}
          >
            +{amt}oz
          </button>
        ))}
      </div>

      <form className="burn-water-custom" onSubmit={handleCustom}>
        <input
          className="burn-input"
          placeholder="custom oz"
          type="number"
          step="0.1"
          value={oz}
          onChange={e => setOz(e.target.value)}
        />
        <button className="burn-submit-btn" type="submit" disabled={loading}>ADD</button>
      </form>
    </div>
  );
}
