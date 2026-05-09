'use client';

import { useState, useEffect } from 'react';
import type { Card } from './game/types';
import CardView from './CardView';

interface DrawAnimationProps {
  cards: Card[];
  playerName: string;
  onComplete: () => void;
}

export default function DrawAnimation({ cards, playerName, onComplete }: DrawAnimationProps) {
  const [phase, setPhase] = useState<'draw' | 'reveal' | 'done'>('draw');
  const [revealIdx, setRevealIdx] = useState(-1);

  useEffect(() => {
    // Phase 1: card backs sliding in
    const t1 = setTimeout(() => setPhase('reveal'), 400);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== 'reveal') return;
    // Reveal each card one at a time
    let idx = 0;
    const iv = setInterval(() => {
      setRevealIdx(idx);
      idx++;
      if (idx >= cards.length) {
        clearInterval(iv);
        setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 600);
      }
    }, 350);
    return () => clearInterval(iv);
  }, [phase, cards.length, onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="draw-anim-overlay">
      <div className="draw-anim-label">{playerName} draw{playerName === 'You' ? '' : 's'} {cards.length > 1 ? `${cards.length} cards` : 'a card'}</div>
      <div className="draw-anim-cards">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`draw-anim-card ${i <= revealIdx ? 'revealed' : 'face-down'}`}
          >
            {i <= revealIdx ? (
              <CardView card={card} disabled small />
            ) : (
              <div className="card-back">
                <span className="card-back-icon">?</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
