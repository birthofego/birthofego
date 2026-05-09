/* ── Card & Game Types ────────────────────────────────────── */

export type CardType = 'duck' | 'plus2' | 'plus4' | 'bread' | 'goose';

export interface Card {
  id: string;
  type: CardType;
  label: string;
  pips: number; // duck counter contribution
}

export type PlayerId = 'mafiosoA' | 'mafiosoB' | 'mafiosoC' | 'player';

export interface Player {
  id: PlayerId;
  name: string;
  hand: Card[];
  alive: boolean;
  seatIndex: number; // 0-3 clockwise from top
}

export const MAX_HAND_SIZE = 4;

export type Phase =
  | 'idle'           // initial state
  | 'pressToBegin'   // waiting for user click to start audio
  | 'prologue'       // text-quest intro (tutorial overlays mid-prologue)
  | 'dealing'        // initial deal animation
  | 'drawing'        // card draw animation
  | 'turnStart'      // beginning of a turn — check goose forced, then draw
  | 'turnAction'     // player picks a card to play
  | 'gooseForced'    // duck counter hit 10 — play +2/+4/bread or die
  | 'discardPick'    // hand over max — player picks a card to discard
  | 'discardExplode' // narrated card explosion
  | 'gooseAttack'    // attack cutscene playing
  | 'breadSave'      // bread save animation
  | 'turnEnd'        // cleanup, advance turn
  | 'win'            // all mafia dead
  | 'lose';          // player dead

/** One entry in the gameplay history log */
export interface LogEntry {
  turn: number;
  playerName: string;
  playerId: PlayerId;
  action: string; // e.g. "played DUCK (+1)", "drew a GOOSE!", "was killed"
}

export interface GameState {
  phase: Phase;
  deck: Card[];
  discard: Card[];
  players: Player[];
  currentPlayerIndex: number;
  duckCounter: number;
  turnNumber: number;
  attackTarget: PlayerId | null;
  lastPlayedCard: Card | null;
  lastDrawnCards: Card[];  // cards just drawn (for animation)
  message: string | null;  // HUD status message
  gooseForced: boolean;    // counter hit 10 — next player must deflect
  discardingCard: Card | null; // card being narrated as exploded
  log: LogEntry[];         // gameplay history
}

/* ── Turn order ──────────────────────────────────────────── */
export const TURN_ORDER: PlayerId[] = ['mafiosoA', 'mafiosoB', 'mafiosoC', 'player'];
