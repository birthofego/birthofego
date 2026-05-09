# GOOSE — Build Brief

> **Audience:** A coding agent, working inside the existing `birthofego` Next.js portfolio repo.
> **Author of intent:** Ego (`@birthofego`).
> **Mode:** Build a small browser game that lives at `/goose` and slots into the portfolio's projects grid as `PROJECT_06`.

---

## 1 · TL;DR

A short, fast-paced, **silly-horror text + card game** inspired by *Regular Show*. The player owes the mafia a debt inherited from their dead father. The mafia force them to play "Duck Duck Goose" with a possessed, talking goose at a round table in a dingy abandoned apartment. Last one alive at the table sets the terms of the contract. Pull cards. Survive. Win freedom — or get dragged off-screen by a hungry goose.

The whole thing should feel like a PS1-era cursed cartoon: heavy film grain, low-poly primitives, CRT-green text crawling across the screen, blocky red blood, deep distorted goose voice.

---

## 2 · Stack (mirror what's already in this repo)

- **Next.js 16.2.4** (App Router) — already installed
- **React 19.2.4** — already installed
- **TypeScript 5** strict — already configured
- **Tailwind 4** — already installed (use sparingly; this game is heavier on custom CSS)
- **Three.js** — `npm install three @types/three` (use the npm package, not a CDN, to match the rest of the project)
- **Web Audio API** for SFX/voice playback (no library)
- **No external 3D models.** All geometry is built from `BoxGeometry`, `CylinderGeometry`, `SphereGeometry`, `ConeGeometry`, `PlaneGeometry`. That low-poly constraint *is* the aesthetic.

Match the existing `/adventurer` route's structural pattern exactly: a dedicated route, a single top-level component, its own CSS file, fonts pulled via `next/font/google` in `page.tsx`.

---

## 3 · File Structure

```
src/
  app/
    goose/
      page.tsx          ← route entry; loads fonts + GooseApp
      goose.css         ← grain shader fallback, CRT scanlines, layout
  components/
    goose/
      GooseApp.tsx      ← top-level 'use client' component, game state machine
      Prologue.tsx      ← text-quest intro with word-by-word reveals
      Scene.tsx         ← Three.js mount: table, NPCs, goose, lighting, grain
      Hand.tsx          ← player's hand UI (cards across the bottom)
      CardView.tsx      ← single card rendering (face + back)
      HUD.tsx           ← duck counter, turn indicator, mute toggle
      GooseAttack.tsx   ← cutscene overlay (red flash → black → return)
      EndScreen.tsx     ← win/lose state with restart
      audio/
        AudioController.ts  ← singleton: load, play, fade, mute
        sfx.ts              ← named exports for every sound key
      game/
        types.ts        ← Card, Player, GameState, Phase
        deck.ts         ← buildDeck(), shuffle(), draw()
        rules.ts        ← pure resolver: applyCard(state, card, actor)
        ai.ts           ← mafia decision logic
  data/
    content.ts          ← ADD a PROJECT_06 entry pointing to /goose
public/
  goose/
    sfx/                ← .mp3 / .ogg files (sourced CC0 from Freesound)
```

`GooseApp.tsx` is a `'use client'` component. State lives in React (useReducer for game state, useRef for Three.js scene refs). No server actions, no DB, no localStorage requirement (a save slot is a stretch goal).

---

## 4 · Visual Aesthetic

### Palette

Inherit the site's CSS variables from `globals.css` and add a **goose-specific override** scoped to `.goose-app` so the game can go dark without touching the rest of the portfolio.

```css
.goose-app {
  --bg:        #0c0c0e;   /* near-black */
  --bg-alt:    #15131a;   /* deep purple-black for cards */
  --ink:       #e8e2d0;   /* dirty cream — old paper, old tooth */
  --ink-soft:  #b8af9a;
  --muted:     #6a6357;
  --red:       #b91c2c;   /* darker red than the portfolio's #e63946 — bloodier */
  --red-glow:  #e63946;
  --green-crt: #7fff8a;   /* phosphor green for terminal text */
  --shadow:    rgba(0,0,0,0.85);
}
```

### Fonts

Already loaded by the root layout — reuse:

- `var(--font-pixel)` (Press Start 2P) — chunky headlines, the goose's dialogue, "GAME OVER"
- `var(--font-terminal)` (VT323) — body narration, card labels, prologue text crawl

### Grain & CRT

Three layered effects, all stackable, all pure CSS/SVG:

1. **Static grain.** Inline SVG `<feTurbulence>` noise filter, animated on a slow loop, set as `background-image` on a fixed full-screen overlay at `mix-blend-mode: overlay; opacity: 0.35;`. No PNG needed.
2. **Scanlines.** Repeating linear-gradient at 2px stripes, 8% opacity, fixed overlay, `pointer-events: none`.
3. **Vignette.** Radial-gradient from transparent center to `#000` corners, 60% opacity, fixed overlay.

Inside Three.js itself, render to a low-resolution `WebGLRenderTarget` (e.g. `width / 3`, `height / 3`) then upscale with `texture.minFilter = NEAREST` and `magFilter = NEAREST`. That gives PS1 chunky-pixel rasterization for free, no shaders needed.

Optional polish (stretch): a tiny custom `ShaderMaterial` post-pass that adds chromatic aberration on the red channel during the goose attack sequence.

### Camera

Static or near-static. Player is in first-person seated at the round table — slight head-bob idle (sin-wave Y offset, ±0.03 units, 4s period). Camera does **not** rotate during normal play. It only animates during cutscenes (goose attacks, end screens).

### NPCs (low-poly humans)

Each mafioso = stack of primitives:

- Body: tall `BoxGeometry` (1 × 1.6 × 0.6) in dark suit color
- Head: `BoxGeometry` (0.5 × 0.5 × 0.5) in skin tone
- Hat: `CylinderGeometry` (fedora — short cylinder + flat disc brim)
- Tie: thin red `BoxGeometry`
- No arms or hands. They're seated. The table hides the lower half.

Three of them, identical proportions, slightly different head tilts and tie reds so they read as distinct. Slight idle animation: each one breathes (Y-scale 1.0 → 1.02, asynchronously phased).

### The Goose

This is the only "character" that needs personality, so spend the polygon budget here:

- Body: elongated `SphereGeometry` (scale x 1.2, y 0.7, z 0.9) in dirty white (`#e8e2d0`)
- Neck: stretched `CylinderGeometry`, curved by stacking 3 segments at slight angles
- Head: smaller sphere, same color
- Beak: orange `ConeGeometry` (`#d97706`), pointing forward, **gets a red tint when bloodied** (`MeshBasicMaterial` color swap)
- Eyes: two tiny black spheres. **During "SIT DOWN" line, eyes briefly turn red** (texture or material swap, 200ms).

Animations needed:
- Idle: head-bob + slow neck sway
- Speak: head tilt back, beak opens (rotate beak cone -15° on X)
- Lunge (off-screen attack): scale up briefly, then disappear behind table edge
- Return: rises back up, beak material is the bloodied variant

### Table

Low-poly round wooden table — `CylinderGeometry` with low radial segments (8 sides, octagonal feel). Top in `#3a2a1a`, single dim lamp above casting a yellow `PointLight`. The lamp is a `BoxGeometry` shade hanging from the ceiling.

### Lighting

- One warm `PointLight` over the table (intensity 1.5, color `#ffb060`, distance 8)
- One dim cool `AmbientLight` (color `#202030`, intensity 0.15)
- A flickering `PointLight` somewhere off to the side (random intensity jitter every 100–400ms) — this is the room's failing bulb

### Cards

2D, not 3D. Render as plain HTML/CSS overlays at the bottom of the screen, **not** in the Three.js scene. Easier to read, easier to animate, and contrasts nicely with the 3D backdrop.

Each card is ~120×170px, beveled border, dirty cream face, art = single big SVG icon, name in pixel font, count number for `+2`/`+4`. Slight rotation on hover, lift + cast shadow on hover, fly-up + fade animation on play.

---

## 5 · Game Mechanics

### Players

- **Player** (you) — human, controls hand via clicks
- **Mafioso A, B, C** — three AI opponents, seated around the round table
- **The Goose** — dealer / executioner, not a player. Doesn't draw. Resolves goose-card kills. Speaks during cutscenes.

Turn order: clockwise from Mafioso A → B → C → Player → repeat. Player always sits "south" (bottom of camera).

### Card Types (5 total)

| Card | Count in deck | Effect |
|---|---|---|
| **Duck** | 30 | Pure filler. You play it, your turn ends, +1 to global Duck Counter. |
| **+2 Duck** | 12 | Next player must draw 2 cards from the deck immediately. They may bounce by playing their own `+2` or `+4` (chain forward). +2 to Duck Counter when finally absorbed. |
| **+4 Duck** | 4 | Next player must draw 4. Same bouncing rule (chain only with another `+4`). +4 to Duck Counter. |
| **Bread** | 6 | Saves you from one Goose attack. Hold it in hand; auto-consumes when you draw a Goose. Discard after use. |
| **Goose** | 8 | You die. Goose drags the drawer off-screen. Unless you have Bread, then Bread is consumed and Goose card is discarded — you live, your turn ends. |

**Total deck: 60 cards. Reshuffles discard pile when deck empties.**

### Duck Counter (the escalation mechanic)

A single global counter, visible in the HUD, ticks up by the number of duck pips played (Duck = +1, +2 = +2, +4 = +4). **When the counter crosses 10**, the *very next card drawn — by anyone — is forced to be a Goose card** regardless of what the deck would have given them. Then the counter resets to 0 and the cycle restarts.

This is the ticking-clock tension: the more ducks fly, the closer the goose gets.

### Hand Size

Each player starts with 5 cards. Draw 1 at the start of your turn. No upper limit on hand size.

### Win / Lose

- **Win:** all 3 mafia have been killed by the goose. The goose recites the contract resolution ("The boy walks free."), credits roll.
- **Lose:** the player is killed by the goose. Cut to black, screen reads `// CONTRACT_DEFAULTED`, restart button.

### Mafia AI (`game/ai.ts`)

Keep it simple but not stupid:

1. If holding a Bread, **never** play it preemptively. Keep it.
2. If forced to draw (chain landed on them) and they have a `+2` or `+4` to bounce, bounce it — preferring `+2` over `+4` (save the big one).
3. Otherwise, prefer playing a `+2` or `+4` aimed at the player when the Duck Counter is ≥ 7 (force the player to take the Goose).
4. Otherwise play a plain Duck.
5. If only Goose / Bread in hand, draw a card.

This makes the mafia mostly play around you, occasionally screw you, and provides comic timing where they accidentally goose each other.

---

## 6 · Prologue (Text-Quest Intro)

Words appear across the screen one phrase at a time. Each click advances. Use the typing reveal pattern from `src/hooks/use-typing-effect.ts` as the base — but with these tweaks:

- Phrases **slide in horizontally** from the right, then settle.
- After the player clicks, the previous phrase fades out as the new one slides in.
- Background during prologue: just the dim 3D scene of the empty apartment / round table being approached (camera does a slow dolly forward across the prologue beats).
- Music: low room-tone hum + distant city traffic. Add a single piano note every 4 beats (very sparse).

### Script

(Each `||` is a click-advance break. Italicized lines = narration. Quoted lines = dialogue with attribution.)

> *The debt was inherited from your father. He passed mysteriously, and the debt fell into your hands.*  ||
> *The only thing the police found in his apartment was a game called* **"Duck Duck Goose."** ||
> *A children's game? No way this is all I get.* ||
> *A board game and a debt I'll never pay off…* ||
> *Curiosity gets the better of you. You pop open the lid and read the instructions.* ||
> *Apparently you actually need a goose to play the game…?* ||
> **"Dude. What the heck."** ||
> *Two hours later, you come back to the abandoned apartment.* ||
> *You set the goose on the round table and take a seat.* ||
> *The mafia men approach from the shadows. Each takes a seat.* ||
> **"Don't run. There's men outside."** — Mafioso A ||
> **"You owe us. You better have a piggy bank stacked with cash, kiddo…"** — Mafioso B ||
> **"…or a part-time job."** — Mafioso C *(they all laugh)* ||
> **"Wait — let's talk this out. Can't we decide the outcome some other way?"** — You ||
> **"As if, kid."** ||
> **"Yeah, right."** ||
> **"You wanna play Duck Duck Goose for your freedom, kiddo?"** — Mafioso A ||
> **"No way, boss, c'mon —"** ||
> *They all laugh.* ||
> **"Fine. Let's entertain the brat."** ||
> *(The goose stares.)* ||
> *Mafioso B draws the first card. It's a Goose.* ||
> **\[CUTSCENE — first goose attack on Mafioso B]** ||
> *The goose returns to the table. Beak red. Calm. Quacks.* ||
> *Mafioso A and C try to bolt.* ||
> *The goose speaks. Its voice is deep and wrong.* ||
> **"SIT DOWN."** — The Goose *(screen shake, deep audio sting, lights flicker)* ||
> *Free will wasn't an option. Everyone sits.* ||
> **"The rules are simple. The last to survive determines the resolution of the contract."** — The Goose ||
> **"The contract you've chosen for this game… is the boys' freedom."** — The Goose ||
> **"Continue playing."** — The Goose ||
> ▶ **\[GAME BEGINS]**

The prologue auto-runs the first goose attack as a scripted moment so the player learns what death looks like before they're at risk.

---

## 7 · Goose Attack Sequence (the horror beat)

Triggered when any player draws a Goose **and has no Bread**. Implemented in `GooseAttack.tsx` as a full-screen overlay with these phases:

1. **Beat 1 (200 ms):** Hand freezes. Three.js scene tints red (overlay div, `mix-blend-mode: multiply`, opacity 0 → 0.6).
2. **Beat 2 (300 ms):** Goose 3D model lunges (scale 1.0 → 1.4 over 200ms, then disappears below table edge). Audio: violent flapping + quack distorted into a roar.
3. **Beat 3 (1.5 s):** Cut to pure black. Audio only: muffled wet flapping, a single offscreen scream, then a dull thud, then silence. Subtitle in CRT green at the bottom: `// [REDACTED]_HAS_BEEN_REMOVED`.
4. **Beat 4 (1.0 s):** Fade back to scene. The victim's chair is empty. The goose is back on the table, beak material swapped to the bloodied variant. Single calm `quack.mp3` plays.
5. **Beat 5:** Game resumes with next player's turn.

If the player has Bread when they draw a Goose, **skip beats 1–4 entirely.** Just play a quick `bread_save.mp3` (a cartoonish *honk* + crunch), animate the Bread card flying up and tearing in half, then continue. The relief is the comedy.

---

## 8 · Audio

All assets sourced CC0 from Freesound or generated. Files in `public/goose/sfx/`. Provide both `.mp3` and `.ogg` for browser compatibility.

### Required clips

| Key | Description |
|---|---|
| `room_tone.mp3` | Low quiet hum, looping, throughout the apartment scene |
| `bulb_buzz.mp3` | Failing fluorescent bulb, plays on flicker timer |
| `card_flip.mp3` | Crisp card-on-felt sound, plays per card play |
| `card_draw.mp3` | Slightly different from flip — pulling from the deck |
| `goose_quack_calm.mp3` | Normal goose quack (after a kill) |
| `goose_lunge.mp3` | Distorted, violent flapping + screech |
| `goose_voice_sit_down.mp3` | Deep, distorted "SIT DOWN" line — pre-recorded, **not** TTS at runtime |
| `scream_offscreen.mp3` | Muffled, brief, then cut off |
| `bread_save.mp3` | Comedic honk + crunch |
| `mafia_laugh.mp3` | Three voices laughing together — used in prologue and on player kill |
| `chair_scrape.mp3` | When mafia sit down |
| `piano_sting.mp3` | Single dissonant piano note, prologue beat |

### Controller

`AudioController` is a singleton class:
- Lazy-loads files on first interaction (browsers block autoplay until then — use a "PRESS TO BEGIN" gate at the start of the prologue)
- Holds two persistent loops (`room_tone`, occasional `bulb_buzz`) on a music bus, and one-shot SFX on an effects bus
- Exposes `.play(key)`, `.fade(key, to, duration)`, `.muteAll()`, `.duck(amount, duration)` (lower music when SFX plays)

### Mute toggle

Top-right of the HUD, pixel-font icon, simple speaker / muted-speaker SVG.

---

## 9 · `content.ts` Update

Add a sixth project to `content.projects.items`:

```ts
{
  number: 'PROJECT_06',
  title: 'GOOSE',
  description: 'A grainy little browser horror game. Pull cards, dodge the goose, win your freedom from the mafia. Three.js + Web Audio. PS1-era cursed-cartoon aesthetic.',
  tags: ['NEXT.JS', 'TS', 'THREE.JS', 'WEB AUDIO'],
  status: 'live',
  links: [
    { label: '→ play', href: '/goose' },
    { label: '→ source', href: '#' },
  ],
},
```

If `THIS SITE` (PROJECT_05) needs to stay last, insert GOOSE before it as PROJECT_05 and renumber.

---

## 10 · Acceptance Criteria

The build is done when **all** of these are true:

- [ ] Visiting `/goose` from `/` (clicked from the projects grid) loads the game with no console errors.
- [ ] A "PRESS TO BEGIN" gate appears first; clicking it starts audio + the prologue.
- [ ] Prologue plays click-by-click through the full script in §6 with the camera dollying forward.
- [ ] After the prologue, the 3D table scene shows: 3 mafia + the goose + first-person POV, all in low-poly primitives, all animated (idle breathing, head bobs, light flicker).
- [ ] The grain + scanline + vignette overlays are visible and don't break layout.
- [ ] Player can see their hand of 5 cards and click any card to play it.
- [ ] Turn order rotates correctly. AI mafia play cards on their turns following the rules in §5.
- [ ] Duck counter visibly ticks up; at ≥10, the next drawn card is forced to a Goose.
- [ ] Drawing a Goose without Bread triggers the full attack sequence in §7 and removes that player.
- [ ] Drawing a Goose with Bread triggers the bread-save shortcut.
- [ ] When 3 mafia are dead, the win screen shows. When the player dies, the lose screen shows. Both have a Restart button that resets state.
- [ ] Mute toggle works. All SFX respect mute.
- [ ] Game runs at 60fps on a mid-tier laptop in Chrome and Safari.
- [ ] No `localStorage` usage required (it's session-only); no server calls; no env vars.
- [ ] Builds cleanly with `npm run build`. No TS errors. No ESLint errors.

---

## 11 · Stretch Goals (only after the core ships)

- Save slot: persist the win count in `localStorage` so the player can see how many times they've escaped.
- Multiple endings: the goose's closing line varies based on which mafioso dies last.
- Secret card: a 1-in-200 chance to draw a Joker that lets you choose any card to play.
- Hidden Regular Show easter eggs: a tiny "ooooooooh" sound clip that plays on rare events.
- Mobile touch controls.

---

## 12 · Tone Reminders

- **Funny first, scary second.** The horror only works because everything around it is dumb. Keep mafia dialogue cartoonish. The goose itself is the only genuinely menacing element.
- **Words on screen are the spectacle.** Don't underestimate the prologue — it's half the experience. Animate text generously.
- **Grain is non-negotiable.** If the screen ever looks clean, something is wrong. Always running.
- **Short.** A full run should be 5–8 minutes. Replayable. Not a 30-minute commitment.

---

*End of brief. Ego, if anything in here doesn't match what's in your head, override it before handing off — your taste is the canon.*
