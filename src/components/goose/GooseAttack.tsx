'use client';

import { useState, useEffect } from 'react';
import type { PlayerId } from './game/types';

interface GooseAttackProps {
  targetId: PlayerId;
  onComplete: () => void;
}

const PLAYER_NAMES: Record<PlayerId, string> = {
  mafiosoA: 'MAFIOSO_A',
  mafiosoB: 'MAFIOSO_B',
  mafiosoC: 'MAFIOSO_C',
  player: 'PLAYER',
};

type Beat = 'red' | 'black' | 'return' | 'done';

export default function GooseAttack({ targetId, onComplete }: GooseAttackProps) {
  const [beat, setBeat] = useState<Beat>('red');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Beat 1: Red flash (500ms)
    timers.push(setTimeout(() => setBeat('black'), 500));

    // Beat 2: Black screen with redacted text (2000ms)
    timers.push(setTimeout(() => setBeat('return'), 2500));

    // Beat 3: Return to scene (1000ms)
    timers.push(setTimeout(() => {
      setBeat('done');
      onComplete();
    }, 3500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="goose-attack-overlay">
      {beat === 'red' && (
        <div className="attack-red-flash">
          <div className="attack-lunge-text">!</div>
        </div>
      )}
      {beat === 'black' && (
        <div className="attack-blackout">
          <div className="attack-redacted">
            // [{PLAYER_NAMES[targetId]}]_HAS_BEEN_REMOVED
          </div>
        </div>
      )}
      {beat === 'return' && (
        <div className="attack-return">
          <div className="attack-quack">*quack*</div>
        </div>
      )}
    </div>
  );
}
