'use client';

import { useEffect } from 'react';
import type { Card } from './game/types';

interface DiscardExplodeProps {
  card: Card;
  onComplete: () => void;
}

export default function DiscardExplode({ card, onComplete }: DiscardExplodeProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="discard-overlay">
      <div className="discard-narration">
        <div className="discard-line">
          The goose blinked 3 times.
        </div>
        <div className="discard-line delay-1">
          Your <span className="discard-card-name">{card.label}</span> card
          exploded in a ridiculously cartoonish manner.
        </div>
        <div className="discard-line delay-2 italic">
          Nothing remains.
        </div>
        <div className="discard-line delay-3 italic">
          The game continues.
        </div>
      </div>
    </div>
  );
}
