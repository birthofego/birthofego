import type { Card, Player, GameState } from './types';

/**
 * Mafia AI decision logic.
 * Simple: pick a card to play. Prefer ducks, save +2/+4 for when counter is high.
 * Never play bread (it auto-consumes on goose draw).
 */
export function aiChooseCard(player: Player, state: GameState): Card | null {
  const hand = player.hand;

  const ducks = hand.filter(c => c.type === 'duck');
  const plus2s = hand.filter(c => c.type === 'plus2');
  const plus4s = hand.filter(c => c.type === 'plus4');
  const playable = [...ducks, ...plus2s, ...plus4s];

  // If only goose/bread in hand, nothing to play
  if (playable.length === 0) return null;

  // If duck counter is high (≥7), play +2 or +4 to push counter toward 10
  if (state.duckCounter >= 7) {
    if (plus2s.length > 0) return plus2s[0];
    if (plus4s.length > 0) return plus4s[0];
  }

  // Otherwise prefer plain ducks — save +2/+4 for defense/strategy
  if (ducks.length > 0) return ducks[0];
  if (plus2s.length > 0) return plus2s[0];
  if (plus4s.length > 0) return plus4s[0];

  return null;
}

/**
 * AI deflects goose forced kill — plays +2 or +4 if available.
 */
export function aiDeflect(player: Player): Card | null {
  const plus2 = player.hand.find(c => c.type === 'plus2');
  if (plus2) return plus2;
  const plus4 = player.hand.find(c => c.type === 'plus4');
  return plus4 || null;
}

/**
 * Get a delay for AI actions (ms) to feel natural.
 */
export function aiDelay(): number {
  return 800 + Math.random() * 600;
}
