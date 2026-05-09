'use client';

import type { GameState, PlayerId } from './game/types';

interface HUDProps {
  state: GameState;
  muted: boolean;
  onToggleMute: () => void;
}

const PLAYER_LABELS: Record<PlayerId, string> = {
  mafiosoA: 'MAFIOSO A',
  mafiosoB: 'MAFIOSO B',
  mafiosoC: 'MAFIOSO C',
  player: 'YOU',
};

export default function HUD({ state, muted, onToggleMute }: HUDProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const duckPct = Math.min(state.duckCounter / 10, 1);

  return (
    <div className="goose-hud">
      {/* Duck Counter */}
      <div className="hud-duck-counter">
        <div className="hud-label">DUCK COUNTER</div>
        <div className="hud-bar-track">
          <div
            className="hud-bar-fill"
            style={{
              width: `${duckPct * 100}%`,
              background: duckPct >= 0.7 ? 'var(--red)' : 'var(--green-crt)',
            }}
          />
        </div>
        <div className="hud-counter-val">
          {state.duckCounter} / 10
          {state.gooseForced && <span className="hud-goose-warn"> ⚠ GOOSE INCOMING</span>}
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="hud-turn">
        <div className="hud-label">TURN</div>
        <div className="hud-turn-name">
          {currentPlayer ? PLAYER_LABELS[currentPlayer.id] : '—'}
          {currentPlayer?.id === 'player' && <span className="hud-you-marker"> ◀</span>}
        </div>
      </div>

      {/* Alive Status */}
      <div className="hud-alive">
        {state.players.map(p => (
          <div key={p.id} className={`hud-seat ${p.alive ? '' : 'dead'}`}>
            <span className="hud-seat-dot" />{' '}
            {PLAYER_LABELS[p.id]}
          </div>
        ))}
      </div>

      {/* Message */}
      {state.message && (
        <div className="hud-message">{state.message}</div>
      )}

      {/* Deck count */}
      <div className="hud-deck">
        <div className="hud-label">DECK</div>
        <div>{state.deck.length} cards</div>
      </div>

      {/* Mute Toggle */}
      <button
        className="hud-mute"
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </div>
  );
}
