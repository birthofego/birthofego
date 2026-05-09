import type { SfxKey } from './sfx';

/**
 * Procedural audio controller. All sounds are synthesized with Web Audio API —
 * no external files needed. PS1-horror aesthetic: lo-fi, gritty, unsettling.
 */
class AudioControllerClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private activeLoops = new Map<string, { stop: () => void; gainNode: GainNode }>();
  private muted = false;
  private initialized = false;

  /** Call once after user interaction to unlock audio. */
  async init(): Promise<void> {
    if (this.ctx) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.3;
    this.musicGain.connect(this.masterGain);

    this.initialized = true;
  }

  // ── Helpers ──

  private noise(duration: number, gain: number, dest: AudioNode): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const len = this.ctx.sampleRate * duration;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * gain;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(dest);
    return src;
  }

  private osc(type: OscillatorType, freq: number, duration: number, gain: number, dest: AudioNode): void {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    o.connect(g);
    g.connect(dest);
    o.start();
    o.stop(this.ctx.currentTime + duration);
  }

  // ── Sound generators ──

  private synth: Record<string, () => void> = {
    room_tone: () => {
      // Low rumble drone — starts looped separately
    },
    bulb_buzz: () => {
      if (!this.ctx || !this.sfxGain) return;
      // 60Hz hum with harmonics
      this.osc('sawtooth', 60, 0.3, 0.08, this.sfxGain);
      this.osc('sine', 120, 0.2, 0.04, this.sfxGain);
    },
    card_flip: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Short snap
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.3, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      g.connect(this.sfxGain);
      const n = this.noise(0.08, 1, g);
      if (n) n.start();
      // Subtle click tone
      this.osc('square', 800, 0.04, 0.15, this.sfxGain);
    },
    card_draw: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Slide-scrape sound
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.2, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      g.connect(this.sfxGain);
      const n = this.noise(0.15, 0.6, g);
      if (n) n.start();
      // Rising pitch
      const o = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(200, this.ctx.currentTime);
      o.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.12);
      og.gain.setValueAtTime(0.1, this.ctx.currentTime);
      og.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      o.connect(og);
      og.connect(this.sfxGain);
      o.start();
      o.stop(this.ctx.currentTime + 0.15);
    },
    goose_quack_calm: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Nasal quack — short pitch bend
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(350, this.ctx.currentTime);
      o.frequency.linearRampToValueAtTime(280, this.ctx.currentTime + 0.1);
      o.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.2, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start();
      o.stop(this.ctx.currentTime + 0.25);
    },
    goose_lunge: () => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      // Aggressive honk — descending saw, loud
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(600, now);
      o.frequency.exponentialRampToValueAtTime(120, now + 0.5);
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(now);
      o.stop(now + 0.6);
      // Heavy noise impact
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.45, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      ng.connect(this.sfxGain);
      const n = this.noise(0.4, 1, ng);
      if (n) n.start(now);
      // Sub thud
      this.osc('sine', 40, 0.3, 0.3, this.sfxGain);
    },
    goose_voice_sit_down: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Deep, wrong voice — low square wave with vibrato
      const o = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const g = this.ctx.createGain();
      o.type = 'square';
      o.frequency.value = 85;
      lfo.frequency.value = 6;
      lfoGain.gain.value = 15;
      lfo.connect(lfoGain);
      lfoGain.connect(o.frequency);
      g.gain.setValueAtTime(0.25, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start();
      lfo.start();
      o.stop(this.ctx.currentTime + 0.8);
      lfo.stop(this.ctx.currentTime + 0.8);
    },
    light_flicker: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Eerie light flicker — rapid crackling buzz that stutters
      const now = this.ctx.currentTime;
      const flickers = [0, 0.08, 0.15, 0.35, 0.42, 0.6, 0.65];
      for (const t of flickers) {
        const dur = 0.03 + Math.random() * 0.04;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.value = 60 + Math.random() * 30;
        g.gain.setValueAtTime(0.15 + Math.random() * 0.1, now + t);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(now + t);
        o.stop(now + t + dur + 0.01);
      }
      // Subtle high whine underneath
      const w = this.ctx.createOscillator();
      const wg = this.ctx.createGain();
      w.type = 'sine';
      w.frequency.value = 4200;
      wg.gain.setValueAtTime(0.04, now);
      wg.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      w.connect(wg);
      wg.connect(this.sfxGain);
      w.start(now);
      w.stop(now + 0.8);
    },
    scream_offscreen: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Gruesome descending shriek — layered for horror
      const now = this.ctx.currentTime;
      // Main scream — high sine falling
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(2200, now);
      o.frequency.exponentialRampToValueAtTime(200, now + 0.9);
      g.gain.setValueAtTime(0.25, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(now);
      o.stop(now + 1.0);
      // Gritty distortion layer
      const o2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      o2.type = 'sawtooth';
      o2.frequency.setValueAtTime(1800, now);
      o2.frequency.exponentialRampToValueAtTime(100, now + 0.7);
      g2.gain.setValueAtTime(0.12, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      o2.connect(g2);
      g2.connect(this.sfxGain);
      o2.start(now);
      o2.stop(now + 0.8);
      // Noise impact
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.2, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      ng.connect(this.sfxGain);
      const n = this.noise(0.5, 1, ng);
      if (n) n.start(now);
    },
    death_quack: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Sinister slow quack after a kill — lower, drawn out
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(280, now);
      o.frequency.linearRampToValueAtTime(200, now + 0.2);
      o.frequency.linearRampToValueAtTime(240, now + 0.35);
      o.frequency.exponentialRampToValueAtTime(160, now + 0.5);
      g.gain.setValueAtTime(0.3, now);
      g.gain.linearRampToValueAtTime(0.25, now + 0.2);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(now);
      o.stop(now + 0.65);
    },
    wet_crunch: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Wet crunch — low filtered noise burst + thud
      const now = this.ctx.currentTime;
      // Thud
      this.osc('sine', 55, 0.15, 0.3, this.sfxGain);
      // Crunch noise
      const bpf = this.ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(1200, now);
      bpf.frequency.exponentialRampToValueAtTime(400, now + 0.2);
      bpf.Q.value = 3;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      const n = this.noise(0.25, 1, bpf);
      bpf.connect(g);
      g.connect(this.sfxGain);
      if (n) n.start(now);
    },
    bread_save: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Warm chime — relief
      this.osc('sine', 523, 0.3, 0.2, this.sfxGain);
      setTimeout(() => this.osc('sine', 659, 0.3, 0.18, this.sfxGain!), 100);
      setTimeout(() => this.osc('sine', 784, 0.4, 0.15, this.sfxGain!), 200);
    },
    mafia_laugh: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Staccato low chuckle
      for (let i = 0; i < 4; i++) {
        const t = this.ctx.currentTime + i * 0.12;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.value = 110 + Math.random() * 20;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.connect(g);
        g.connect(this.sfxGain!);
        o.start(t);
        o.stop(t + 0.1);
      }
    },
    chair_scrape: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Filtered noise sweep
      const g = this.ctx.createGain();
      const bpf = this.ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(800, this.ctx.currentTime);
      bpf.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 0.25);
      bpf.Q.value = 2;
      g.gain.setValueAtTime(0.25, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      const n = this.noise(0.3, 1, bpf);
      bpf.connect(g);
      g.connect(this.sfxGain);
      if (n) n.start();
    },
    piano_sting: () => {
      if (!this.ctx || !this.sfxGain) return;
      // Dissonant low piano hit — two detuned tones
      this.osc('triangle', 130, 0.8, 0.25, this.sfxGain);
      this.osc('triangle', 138, 0.8, 0.2, this.sfxGain);
      this.osc('sine', 65, 1.0, 0.15, this.sfxGain);
    },
  };

  /** Play a one-shot SFX. */
  play(key: SfxKey): void {
    if (!this.ctx || this.muted || !this.sfxGain) return;
    const fn = this.synth[key];
    if (fn) fn();
  }

  /** Start a looping sound (e.g. room_tone). */
  startLoop(key: SfxKey, volume: number = 0.3): void {
    if (!this.ctx || !this.musicGain) return;
    if (this.activeLoops.has(key)) return;

    // Procedural room tone: filtered brown noise
    if (key === 'room_tone') {
      const bufLen = this.ctx.sampleRate * 4;
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufLen; i++) {
        last += (Math.random() * 2 - 1) * 0.05;
        last = Math.max(-1, Math.min(1, last));
        data[i] = last;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const lpf = this.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 200;

      const g = this.ctx.createGain();
      g.gain.value = this.muted ? 0 : volume;

      src.connect(lpf);
      lpf.connect(g);
      g.connect(this.musicGain);
      src.start();

      this.activeLoops.set(key, {
        stop: () => src.stop(),
        gainNode: g,
      });
      return;
    }

    // Bulb buzz loop
    if (key === 'bulb_buzz') {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 60;
      g.gain.value = this.muted ? 0 : volume * 0.15;
      o.connect(g);
      g.connect(this.musicGain);
      o.start();

      this.activeLoops.set(key, {
        stop: () => o.stop(),
        gainNode: g,
      });
    }
  }

  /** Stop a loop. */
  stopLoop(key: SfxKey): void {
    const loop = this.activeLoops.get(key);
    if (!loop) return;
    try { loop.stop(); } catch { /* already stopped */ }
    this.activeLoops.delete(key);
  }

  /** Fade a loop's gain. */
  fade(key: SfxKey, to: number, durationSec: number): void {
    const loop = this.activeLoops.get(key);
    if (!loop || !this.ctx) return;
    loop.gainNode.gain.linearRampToValueAtTime(to, this.ctx.currentTime + durationSec);
  }

  /** Toggle mute. */
  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  get isLoaded(): boolean {
    return this.initialized;
  }
}

/** Singleton instance */
export const audio = new AudioControllerClass();
