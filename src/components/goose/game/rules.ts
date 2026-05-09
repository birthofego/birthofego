import type { GameState, Card, PlayerId, LogEntry } from './types';
import { draw } from './deck';

/**
 * Get the next alive player index after the given one.
 */
export function nextAlivePlayer(state: GameState, afterIndex?: number): number {
  const start = afterIndex ?? state.currentPlayerIndex;
  const total = state.players.length;
  let idx = (start + 1) % total;
  let safety = 0;
  while (!state.players[idx].alive && safety < total) {
    idx = (idx + 1) % total;
    safety++;
  }
  return idx;
}

/**
 * Count alive mafia specifically.
 */
export function aliveMafiaCount(state: GameState): number {
  return state.players.filter(p => p.alive && p.id !== 'player').length;
}

/**
 * Check if the player has bread in their hand.
 */
export function hasBread(player: { hand: Card[] }): boolean {
  return player.hand.some(c => c.type === 'bread');
}

/**
 * Check if the player has a deflect card (+2 or +4) in their hand.
 */
export function hasDeflect(player: { hand: Card[] }): boolean {
  return player.hand.some(c => c.type === 'plus2' || c.type === 'plus4');
}

/**
 * Consume bread from a player's hand. Returns the consumed bread card and new hand.
 */
export function consumeBread(hand: Card[]): [Card | null, Card[]] {
  const idx = hand.findIndex(c => c.type === 'bread');
  if (idx < 0) return [null, hand];
  const consumed = hand[idx];
  const newHand = [...hand.slice(0, idx), ...hand.slice(idx + 1)];
  return [consumed, newHand];
}

/**
 * Add a log entry to the game state.
 */
export function addLog(state: GameState, playerId: PlayerId, action: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  const entry: LogEntry = {
    turn: state.turnNumber,
    playerName: player?.name ?? playerId,
    playerId,
    action,
  };
  return { ...state, log: [...state.log, entry] };
}

/**
 * Apply a card play to the game state.
 * Cards just add to the duck counter. That's it.
 */
export function applyCard(state: GameState, card: Card, actorId: PlayerId): GameState {
  let s = { ...state };
  const actorIdx = s.players.findIndex(p => p.id === actorId);
  const actor = { ...s.players[actorIdx] };

  // Remove card from hand
  actor.hand = actor.hand.filter(c => c.id !== card.id);
  s.players = [...s.players];
  s.players[actorIdx] = actor;

  // Add to discard
  s.discard = [...s.discard, card];
  s.lastPlayedCard = card;

  // All playable cards just add pips to the duck counter
  s.duckCounter += card.pips;

  const pipLabel = card.pips > 1 ? `+${card.pips}` : '+1';
  s.message = `${actor.name} played ${card.label} (${pipLabel} to counter)`;

  // Log it
  s = addLog(s, actorId, `played ${card.label} (${pipLabel})`);

  // Check duck counter threshold
  if (s.duckCounter >= 10) {
    s.gooseForced = true;
    s.duckCounter = 0; // reset counter
    s = addLog(s, actorId, 'DUCK COUNTER HIT 10!');
  }

  return s;
}

/**
 * Handle drawing 1 card at start of turn.
 * Returns [newState, drawnCards].
 */
export function handleDraw(state: GameState, playerId: PlayerId): [GameState, Card[]] {
  const s = { ...state };
  const playerIdx = s.players.findIndex(p => p.id === playerId);
  const player = { ...s.players[playerIdx] };

  const [drawn, newDeck, newDiscard] = draw(s.deck, s.discard, 1);

  player.hand = [...player.hand, ...drawn];
  s.deck = newDeck;
  s.discard = newDiscard;
  s.players = [...s.players];
  s.players[playerIdx] = player;
  s.lastDrawnCards = drawn;

  return [s, drawn];
}

/**
 * Check if any drawn cards are goose cards and handle bread saves.
 */
export function checkGooseDraw(state: GameState, playerId: PlayerId, drawnCards: Card[]): {
  state: GameState;
  gooseDrawn: boolean;
  breadSaved: boolean;
} {
  const gooseCard = drawnCards.find(c => c.type === 'goose');
  if (!gooseCard) return { state, gooseDrawn: false, breadSaved: false };

  let s = { ...state };
  const playerIdx = s.players.findIndex(p => p.id === playerId);
  const player = { ...s.players[playerIdx] };

  // Check for bread
  const [bread, newHand] = consumeBread(player.hand);
  if (bread) {
    player.hand = newHand.filter(c => c.id !== gooseCard.id);
    s.discard = [...s.discard, bread, gooseCard];
    s.players = [...s.players];
    s.players[playerIdx] = player;
    s.message = `${player.name} was saved by BREAD!`;
    s = addLog(s, playerId, 'drew a GOOSE but BREAD saved them!');
    return { state: s, gooseDrawn: true, breadSaved: true };
  }

  // No bread — player dies
  player.hand = player.hand.filter(c => c.id !== gooseCard.id);
  player.alive = false;
  s.discard = [...s.discard, gooseCard];
  s.players = [...s.players];
  s.players[playerIdx] = player;
  s.attackTarget = playerId;
  s.message = `${player.name} drew a GOOSE!`;
  s = addLog(s, playerId, 'drew a GOOSE!');

  return { state: s, gooseDrawn: true, breadSaved: false };
}
