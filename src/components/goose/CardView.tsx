'use client';

import type { Card, CardType } from './game/types';

const CARD_ICONS: Record<CardType, string> = {
  duck: '🦆',
  plus2: '🦆🦆',
  plus4: '🦆🦆🦆🦆',
  bread: '🍞',
  goose: '🪿',
};

const CARD_COLORS: Record<CardType, string> = {
  duck: '#e8e2d0',
  plus2: '#d4c9a8',
  plus4: '#c4a060',
  bread: '#a8d4a0',
  goose: '#b91c2c',
};

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  animateOut?: boolean;
}

export default function CardView({ card, onClick, disabled, small, animateOut }: CardViewProps) {
  const isGoose = card.type === 'goose';

  return (
    <>
      <button
        className={`goose-card ${animateOut ? 'card-fly-out' : ''} ${disabled ? 'card-disabled' : ''} ${small ? 'card-small' : ''}`}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          '--card-bg': CARD_COLORS[card.type],
          '--card-border': isGoose ? '#b91c2c' : '#3a3530',
        } as React.CSSProperties}
        aria-label={`Play ${card.label}`}
      >
        <span className="card-icon">{CARD_ICONS[card.type]}</span>
        <span className="card-label">{card.label}</span>
        {card.pips > 0 && <span className="card-pips">+{card.pips}</span>}
      </button>
    </>
  );
}
