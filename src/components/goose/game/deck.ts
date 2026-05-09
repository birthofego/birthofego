import type { Card, CardType } from './types';

let nextId = 0;
function makeCard(type: CardType, label: string, pips: number): Card {
  return { id: `card_${nextId++}`, type, label, pips };
}

/** Build a fresh 60-card deck per the brief. */
export function buildDeck(): Card[] {
  nextId = 0;
  const cards: Card[] = [];

  for (let i = 0; i < 30; i++) cards.push(makeCard('duck', 'DUCK', 1));
  for (let i = 0; i < 12; i++) cards.push(makeCard('plus2', '+2 DUCK', 2));
  for (let i = 0; i < 4; i++) cards.push(makeCard('plus4', '+4 DUCK', 4));
  for (let i = 0; i < 6; i++) cards.push(makeCard('bread', 'BREAD', 0));
  for (let i = 0; i < 8; i++) cards.push(makeCard('goose', 'GOOSE', 0));

  return shuffle(cards);
}

/** Fisher-Yates shuffle (in-place, returns same array). */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Draw n cards from the deck. If deck empties, reshuffle discard into deck.
 * Returns [drawnCards, updatedDeck, updatedDiscard].
 */
export function draw(
  deck: Card[],
  discard: Card[],
  n: number,
): [Card[], Card[], Card[]] {
  let d = [...deck];
  let disc = [...discard];
  const drawn: Card[] = [];

  for (let i = 0; i < n; i++) {
    // Reshuffle if empty
    if (d.length === 0) {
      d = shuffle([...disc]);
      disc = [];
    }
    if (d.length === 0) break; // truly empty, shouldn't happen
    drawn.push(d.shift()!);
  }

  return [drawn, d, disc];
}
