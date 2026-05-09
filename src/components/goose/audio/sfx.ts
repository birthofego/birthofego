/** Sound effect keys — all procedurally synthesized */
export const SFX = {
  room_tone: 'room_tone',
  bulb_buzz: 'bulb_buzz',
  light_flicker: 'light_flicker',
  card_flip: 'card_flip',
  card_draw: 'card_draw',
  goose_quack_calm: 'goose_quack_calm',
  goose_lunge: 'goose_lunge',
  goose_voice_sit_down: 'goose_voice_sit_down',
  scream_offscreen: 'scream_offscreen',
  death_quack: 'death_quack',
  bread_save: 'bread_save',
  mafia_laugh: 'mafia_laugh',
  chair_scrape: 'chair_scrape',
  piano_sting: 'piano_sting',
  wet_crunch: 'wet_crunch',
} as const;

export type SfxKey = keyof typeof SFX;
