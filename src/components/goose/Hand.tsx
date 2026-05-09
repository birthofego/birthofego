'use client';

import type { Card } from './game/types';
import CardView from './CardView';

interface HandProps {
  cards: Card[];
  onPlayCard: (cardId: string) => void;
  disabled: boolean;
  pendingChain: boolean;
  chainType: '+2' | '+4' | null;
  gooseForced?: boolean;
}

export default function Hand({ cards, onPlayCard, disabled, gooseForced }: HandProps) {
  function canPlay(card: Card): boolean {
    if (disabled && !gooseForced) return false;

    if (gooseForced) {
      // Can play +2, +4, or bread to survive
      return card.type === 'plus2' || card.type === 'plus4' || card.type === 'bread';
    }

    // Normal play: duck, +2, +4 are playable. Bread and goose are not.
    return card.type === 'duck' || card.type === 'plus2' || card.type === 'plus4';
  }

  return (
    <div className="goose-hand">
      <div className={`hand-label ${gooseForced ? 'discard-warning' : ''}`}>
        {gooseForced ? 'PLAY +2, +4, OR BREAD TO SURVIVE!' : 'YOUR HAND'}
      </div>
      <div className="hand-cards">
        {cards.map((card) => (
          <CardView
            key={card.id}
            card={card}
            onClick={() => onPlayCard(card.id)}
            disabled={!canPlay(card)}
          />
        ))}
      </div>
    </div>
  );
}
