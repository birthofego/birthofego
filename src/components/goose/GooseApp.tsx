'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Phase, PlayerId, Card } from './game/types';
import { MAX_HAND_SIZE } from './game/types';
import { buildDeck, draw } from './game/deck';
import { nextAlivePlayer, aliveMafiaCount, applyCard, handleDraw, checkGooseDraw, hasBread, hasDeflect, consumeBread, addLog } from './game/rules';
import { aiChooseCard, aiDeflect, aiDelay } from './game/ai';
import { audio } from './audio/AudioController';
import Scene from './Scene';
import Tutorial from './Tutorial';
import Prologue from './Prologue';
import Hand from './Hand';
import HUD from './HUD';
import DrawAnimation from './DrawAnimation';
import DiscardExplode from './DiscardExplode';
import GooseAttack from './GooseAttack';
import EndScreen from './EndScreen';

function createInitialState(): GameState {
  const deck = buildDeck();
  return {
    phase: 'pressToBegin',
    deck,
    discard: [],
    players: [
      { id: 'mafiosoA', name: 'Mafioso A', hand: [], alive: true, seatIndex: 0 },
      { id: 'mafiosoB', name: 'Mafioso B', hand: [], alive: true, seatIndex: 1 },
      { id: 'mafiosoC', name: 'Mafioso C', hand: [], alive: true, seatIndex: 2 },
      { id: 'player', name: 'You', hand: [], alive: true, seatIndex: 3 },
    ],
    currentPlayerIndex: 0,
    duckCounter: 0,
    turnNumber: 0,
    attackTarget: null,
    lastPlayedCard: null,
    lastDrawnCards: [],
    message: null,
    gooseForced: false,
    discardingCard: null,
    log: [],
  };
}

function dealInitialHands(state: GameState): GameState {
  let s = { ...state };
  for (let p = 0; p < s.players.length; p++) {
    // Deal safe cards only — no goose in starting hands
    const hand: Card[] = [];
    let deck = [...s.deck];
    let discard = [...s.discard];
    while (hand.length < MAX_HAND_SIZE && deck.length > 0) {
      const card = deck.shift()!;
      if (card.type === 'goose' || card.type === 'bread' || card.type === 'plus4') {
        // Shuffle back into deck — not allowed in starting hand
        const insertAt = Math.floor(Math.random() * deck.length);
        deck.splice(insertAt, 0, card);
      } else {
        hand.push(card);
      }
    }
    s.deck = deck;
    s.discard = discard;
    s.players = [...s.players];
    s.players[p] = { ...s.players[p], hand };
  }
  return s;
}

/** Check if hand is over max, return the state with discardPick phase if needed */
function checkHandLimit(s: GameState, playerId: PlayerId): GameState {
  const pIdx = s.players.findIndex(p => p.id === playerId);
  const player = s.players[pIdx];
  if (player.hand.length > MAX_HAND_SIZE) {
    return {
      ...s,
      phase: playerId === 'player' ? 'discardPick' : 'turnAction',
      message: playerId === 'player'
        ? 'The goose notices you have too many cards... Pick one to discard.'
        : null,
    };
  }
  return s;
}

/** AI auto-discards worst card when over limit */
function aiAutoDiscard(s: GameState, playerId: PlayerId): GameState {
  const pIdx = s.players.findIndex(p => p.id === playerId);
  const player = { ...s.players[pIdx] };
  if (player.hand.length <= MAX_HAND_SIZE) return s;

  // Discard the least valuable: duck > plus2 > plus4 > bread > goose
  const priority: Record<string, number> = { duck: 0, plus2: 1, plus4: 2, bread: 3, goose: 4 };
  const sorted = [...player.hand].sort((a, b) => (priority[a.type] ?? 99) - (priority[b.type] ?? 99));
  const discard = sorted[0];
  player.hand = player.hand.filter(c => c.id !== discard.id);
  s.players = [...s.players];
  s.players[pIdx] = player;
  s.discard = [...s.discard, discard];
  return s;
}

export default function GooseApp() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [muted, setMuted] = useState(false);
  const [dollyProgress, setDollyProgress] = useState(0);
  const [gooseLunge, setGooseLunge] = useState(false);
  const [gooseBloodied, setGooseBloodied] = useState(false);
  const [breadSaveAnim, setBreadSaveAnim] = useState(false);
  const [showDrawAnim, setShowDrawAnim] = useState(false);
  const [drawAnimCards, setDrawAnimCards] = useState<Card[]>([]);
  const [drawAnimName, setDrawAnimName] = useState('');
  const [prologuePaused, setProloguePaused] = useState(false);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);
  const [gooseVisible, setGooseVisible] = useState(false);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drawCallbackRef = useRef<(() => void) | null>(null);

  // ── Phase transitions ──

  const startPrologue = useCallback(async () => {
    await audio.init();
    audio.startLoop('room_tone', 0.25);
    audio.startLoop('bulb_buzz', 0.15);
    setState(prev => ({ ...prev, phase: 'prologue' }));
  }, []);

  const onGoosePlaced = useCallback(() => {
    setGooseVisible(true);
    audio.play('goose_quack_calm');
  }, []);

  const onPrologueFirstDeath = useCallback(() => {
    audio.play('light_flicker');
    setTimeout(() => audio.play('goose_lunge'), 200);
    setTimeout(() => audio.play('wet_crunch'), 400);
    setTimeout(() => audio.play('scream_offscreen'), 500);
    setTimeout(() => audio.play('death_quack'), 1000);
    setProloguePaused(true);
    setShowTutorialOverlay(true);
    setGooseBloodied(true);
  }, []);

  const onTutorialDismiss = useCallback(() => {
    setShowTutorialOverlay(false);
    setProloguePaused(false);
  }, []);

  const onPrologueComplete = useCallback(() => {
    setState(prev => {
      let s = { ...prev, phase: 'dealing' as Phase };
      s = dealInitialHands(s);
      // Mafioso B killed in prologue
      s.players = [...s.players];
      s.players[1] = { ...s.players[1], alive: false };
      s.phase = 'turnStart';
      s.currentPlayerIndex = 0;
      if (!s.players[0].alive) {
        s.currentPlayerIndex = nextAlivePlayer(s, -1);
      }
      return s;
    });
  }, []);

  const onPrologueProgress = useCallback((p: number) => {
    setDollyProgress(p);
  }, []);

  // ── Show draw animation, then continue ──
  const showDraw = useCallback((cards: Card[], name: string, then: () => void) => {
    audio.play('card_draw');
    setDrawAnimCards(cards);
    setDrawAnimName(name);
    setShowDrawAnim(true);
    drawCallbackRef.current = then;
  }, []);

  const onDrawAnimComplete = useCallback(() => {
    setShowDrawAnim(false);
    const fn = drawCallbackRef.current;
    drawCallbackRef.current = null;
    if (fn) fn();
  }, []);

  // ── Turn Logic ──
  // Each turn: check gooseForced → draw 1 card → check goose in draw → check hand limit → play a card

  const processTurnStart = useCallback((s: GameState) => {
    const player = s.players[s.currentPlayerIndex];
    if (!player.alive) {
      const nextIdx = nextAlivePlayer(s);
      processTurnStart({ ...s, currentPlayerIndex: nextIdx });
      return;
    }

    // ── GOOSE FORCED: counter hit 10 on previous turn ──
    if (s.gooseForced) {
      // Can they deflect with +2, +4, or bread?
      const canDeflect = hasDeflect(player);
      const canBread = hasBread(player);

      if ((canDeflect || canBread) && player.id === 'player') {
        // Player gets to pick a deflect card
        setState({
          ...s,
          phase: 'gooseForced',
          message: 'DUCK COUNTER HIT 10! Play a +2, +4, or Bread to survive!',
        });
        return;
      } else if (canDeflect && player.id !== 'player') {
        // AI auto-deflects with +2/+4
        const deflectCard = aiDeflect(player);
        if (deflectCard) {
          const actorIdx = s.players.findIndex(p => p.id === player.id);
          const actor = { ...s.players[actorIdx] };
          actor.hand = actor.hand.filter(c => c.id !== deflectCard.id);
          s.players = [...s.players];
          s.players[actorIdx] = actor;
          s.discard = [...s.discard, deflectCard];
          s.gooseForced = false;
          s.message = `${player.name} deflected with ${deflectCard.label}!`;
          s = addLog(s, player.id, `deflected with ${deflectCard.label}`);
          setState({ ...s, phase: 'turnEnd' });
          return;
        }
      } else if (canBread && player.id !== 'player') {
        // AI uses bread
        const [, newHand] = consumeBread(player.hand);
        const pIdx = s.players.findIndex(p => p.id === player.id);
        s.players = [...s.players];
        s.players[pIdx] = { ...s.players[pIdx], hand: newHand };
        s.gooseForced = false;
        s.message = `${player.name} was saved by BREAD!`;
        s = addLog(s, player.id, 'saved by BREAD');
        setState({ ...s, phase: 'breadSave' });
        return;
      }

      // No deflect, no bread — die
      const pIdx = s.players.findIndex(p => p.id === player.id);
      s.players = [...s.players];
      s.players[pIdx] = { ...s.players[pIdx], alive: false };
      s.attackTarget = player.id;
      s.gooseForced = false;
      s = addLog(s, player.id, 'was killed by the goose');
      setState({ ...s, phase: 'gooseAttack' });
      return;
    }

    // ── Normal turn: draw 1 card ──
    const [newState, drawnCards] = handleDraw(s, player.id);
    const result = checkGooseDraw(newState, player.id, drawnCards);

    if (result.gooseDrawn && !result.breadSaved) {
      showDraw(drawnCards, player.name, () => {
        setState({ ...result.state, phase: 'gooseAttack' });
      });
      return;
    }
    if (result.gooseDrawn && result.breadSaved) {
      showDraw(drawnCards, player.name, () => {
        setState({ ...result.state, phase: 'breadSave' });
      });
      return;
    }

    // Check hand limit after draw
    let finalState = checkHandLimit(result.state, player.id);
    if (finalState.phase === 'discardPick') {
      showDraw(drawnCards, player.name, () => {
        setState(finalState);
      });
      return;
    }

    // AI auto-discard if over limit
    if (player.id !== 'player') {
      finalState = aiAutoDiscard(finalState, player.id);
    }

    showDraw(drawnCards, player.name, () => {
      setState({
        ...finalState,
        phase: 'turnAction',
        message: `${player.name}'s turn.`,
      });
    });
  }, [showDraw]);

  // Process turn start
  useEffect(() => {
    if (state.phase !== 'turnStart') return;
    processTurnStart(state);
  }, [state.phase, state.turnNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // AI plays a card
  useEffect(() => {
    if (state.phase !== 'turnAction') return;
    const current = state.players[state.currentPlayerIndex];
    if (current.id === 'player') return;

    aiTimeoutRef.current = setTimeout(() => {
      const card = aiChooseCard(current, state);

      if (card) {
        let s = applyCard(state, card, current.id);
        audio.play('card_flip');
        s.phase = 'turnEnd';
        setState(s);
      } else {
        // Nothing playable — just end turn
        let s = addLog(state, current.id, 'had nothing to play');
        s.phase = 'turnEnd';
        s.message = `${current.name} had nothing to play.`;
        setState(s);
      }
    }, aiDelay());

    return () => clearTimeout(aiTimeoutRef.current);
  }, [state.phase, state.currentPlayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Turn end → advance
  useEffect(() => {
    if (state.phase !== 'turnEnd') return;

    const timer = setTimeout(() => {
      let s = { ...state };

      if (!s.players.find(p => p.id === 'player')?.alive) {
        audio.play('piano_sting');
        audio.stopLoop('room_tone');
        audio.stopLoop('bulb_buzz');
        setState({ ...s, phase: 'lose' });
        return;
      }
      if (aliveMafiaCount(s) === 0) {
        audio.play('piano_sting');
        audio.stopLoop('room_tone');
        audio.stopLoop('bulb_buzz');
        setState({ ...s, phase: 'win' });
        return;
      }

      const nextIdx = nextAlivePlayer(s);
      s.currentPlayerIndex = nextIdx;
      s.turnNumber += 1;
      s.phase = 'turnStart';
      s.lastPlayedCard = null;
      s.lastDrawnCards = [];
      setState(s);
    }, 600);

    return () => clearTimeout(timer);
  }, [state.phase, state.turnNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Player Actions ──

  const handlePlayCard = useCallback((cardId: string) => {
    if (state.phase !== 'turnAction' && state.phase !== 'gooseForced') return;
    const current = state.players[state.currentPlayerIndex];
    if (current.id !== 'player') return;

    const card = current.hand.find(c => c.id === cardId);
    if (!card) return;

    audio.play('card_flip');

    // If gooseForced, only allow +2, +4, or bread
    if (state.phase === 'gooseForced') {
      if (card.type !== 'plus2' && card.type !== 'plus4' && card.type !== 'bread') return;

      if (card.type === 'bread') {
        // Bread saves
        const playerIdx = state.players.findIndex(p => p.id === 'player');
        const player = { ...state.players[playerIdx] };
        player.hand = player.hand.filter(c => c.id !== cardId);
        const newPlayers = [...state.players];
        newPlayers[playerIdx] = player;
        let s: GameState = {
          ...state,
          players: newPlayers,
          discard: [...state.discard, card],
          gooseForced: false,
          message: 'BREAD saves you!',
        };
        s = addLog(s, 'player', 'saved by BREAD');
        setState({ ...s, phase: 'breadSave' });
        return;
      }

      // +2 or +4 deflects
      const playerIdx = state.players.findIndex(p => p.id === 'player');
      const player = { ...state.players[playerIdx] };
      player.hand = player.hand.filter(c => c.id !== cardId);
      const newPlayers = [...state.players];
      newPlayers[playerIdx] = player;
      let s: GameState = {
        ...state,
        players: newPlayers,
        discard: [...state.discard, card],
        gooseForced: false,
        message: `You deflected with ${card.label}!`,
      };
      s = addLog(s, 'player', `deflected with ${card.label}`);
      setState({ ...s, phase: 'turnEnd' });
      return;
    }

    // Normal play — card just adds to counter
    if (card.type === 'bread' || card.type === 'goose') return; // can't play these
    let s = applyCard(state, card, 'player');
    s.phase = 'turnEnd';
    setState(s);
  }, [state]);

  // ── Discard pick (hand over max) ──
  const handleDiscardPick = useCallback((cardId: string) => {
    if (state.phase !== 'discardPick') return;
    const playerIdx = state.players.findIndex(p => p.id === 'player');
    const player = state.players[playerIdx];
    const card = player.hand.find(c => c.id === cardId);
    if (!card) return;

    const newHand = player.hand.filter(c => c.id !== cardId);
    const newPlayers = [...state.players];
    newPlayers[playerIdx] = { ...player, hand: newHand };

    setState({
      ...state,
      players: newPlayers,
      discard: [...state.discard, card],
      discardingCard: card,
      phase: 'discardExplode',
    });
  }, [state]);

  // Discard explosion done
  const onDiscardExplodeDone = useCallback(() => {
    setState(prev => ({
      ...prev,
      discardingCard: null,
      phase: 'turnAction',
      message: 'Your turn.',
    }));
  }, []);

  // ── Attack / Save handlers ──

  const onGooseAttackDone = useCallback(() => {
    setGooseLunge(false);
    setGooseBloodied(true);

    setState(prev => {
      let s = { ...prev, attackTarget: null };

      if (!s.players.find(p => p.id === 'player')?.alive) {
        return { ...s, phase: 'lose' as Phase };
      }
      if (aliveMafiaCount(s) === 0) {
        return { ...s, phase: 'win' as Phase };
      }

      return { ...s, phase: 'turnEnd' as Phase };
    });
  }, []);

  useEffect(() => {
    if (state.phase === 'gooseAttack') {
      setGooseLunge(true);
      audio.play('light_flicker');
      setTimeout(() => audio.play('goose_lunge'), 150);
      setTimeout(() => audio.play('wet_crunch'), 350);
      setTimeout(() => audio.play('scream_offscreen'), 500);
      setTimeout(() => audio.play('death_quack'), 900);
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'breadSave') return;
    audio.play('bread_save');
    setBreadSaveAnim(true);
    const timer = setTimeout(() => {
      setBreadSaveAnim(false);
      setState(prev => ({ ...prev, phase: 'turnEnd' }));
    }, 1200);
    return () => clearTimeout(timer);
  }, [state.phase]);

  // ── Restart ──
  const handleRestart = useCallback(() => {
    setGooseBloodied(false);
    setGooseVisible(false);
    setGooseLunge(false);
    setBreadSaveAnim(false);
    setShowDrawAnim(false);
    setDollyProgress(0);
    setState(createInitialState());
  }, []);

  const toggleMute = useCallback(() => {
    const nowMuted = audio.toggleMute();
    setMuted(nowMuted);
  }, []);

  // ── Derived state ──
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isPlayerTurn = currentPlayer?.id === 'player';
  const playerData = state.players.find(p => p.id === 'player')!;
  const seatsOccupied: [boolean, boolean, boolean] = [
    state.players[0].alive,
    state.players[1].alive,
    state.players[2].alive,
  ];

  const showHand = ['turnAction', 'turnEnd', 'turnStart', 'gooseForced', 'discardPick'].includes(state.phase);
  const isPrologue = state.phase === 'prologue';

  return (
    <div className="goose-app">
      <div className="grain-overlay" />
      <div className="scanline-overlay" />
      <div className="vignette-overlay" />

      <Scene
        gooseBloodied={gooseBloodied}
        gooseVisible={gooseVisible}
        seatsOccupied={seatsOccupied}
        cameraTarget={isPrologue ? 'dolly' : 'table'}
        dollyProgress={dollyProgress}
        gooseLunge={gooseLunge}
        redFlash={state.phase === 'gooseAttack'}
      />

      {/* Press to Begin */}
      {state.phase === 'pressToBegin' && (
        <div className="goose-gate" onClick={startPrologue}>
          <div className="gate-title">GOOSE.</div>
          <div className="gate-sub">PRESS TO BEGIN</div>
          <div className="gate-cursor" />
        </div>
      )}

      {/* Prologue */}
      {isPrologue && (
        <Prologue
          onComplete={onPrologueComplete}
          onProgress={onPrologueProgress}
          onFirstDeath={onPrologueFirstDeath}
          onGoosePlaced={onGoosePlaced}
          paused={prologuePaused}
        />
      )}

      {/* Tutorial (overlay during prologue, after first death) */}
      {showTutorialOverlay && (
        <Tutorial onContinue={onTutorialDismiss} />
      )}

      {/* HUD */}
      {showHand && (
        <HUD state={state} muted={muted} onToggleMute={toggleMute} />
      )}

      {/* Turn Order Panel (left) */}
      {showHand && (
        <div className="turn-order-panel">
          <div className="panel-title">TURN ORDER</div>
          {state.players.map((p, i) => (
            <div
              key={p.id}
              className={`turn-order-entry ${!p.alive ? 'dead' : ''} ${i === state.currentPlayerIndex ? 'active' : ''}`}
            >
              <span className="turn-order-marker">{i === state.currentPlayerIndex ? '▶' : ' '}</span>
              <span className="turn-order-name">{p.name}</span>
              {!p.alive && <span className="turn-order-dead">DEAD</span>}
            </div>
          ))}
        </div>
      )}

      {/* History Log (right) */}
      {showHand && state.log.length > 0 && (
        <div className="history-panel">
          <div className="panel-title">HISTORY</div>
          <div className="history-entries">
            {state.log.slice(-12).map((entry, i) => (
              <div key={i} className={`history-entry ${entry.playerId === 'player' ? 'history-you' : ''}`}>
                <span className="history-name">{entry.playerName}</span>{' '}
                <span className="history-action">{entry.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draw Animation */}
      {showDrawAnim && (
        <DrawAnimation
          cards={drawAnimCards}
          playerName={drawAnimName}
          onComplete={onDrawAnimComplete}
        />
      )}

      {/* Player's Hand */}
      {showHand && playerData.alive && (
        <>
          {state.phase === 'discardPick' ? (
            <div className="goose-hand">
              <div className="hand-label discard-warning">PICK A CARD TO DISCARD</div>
              <div className="hand-cards">
                {playerData.hand.map(card => (
                  <div key={card.id} className="discard-pick-card" onClick={() => handleDiscardPick(card.id)}>
                    <div className="CardView-wrapper">
                      <button className="goose-card" style={{
                        '--card-bg': card.type === 'goose' ? '#b91c2c' : card.type === 'bread' ? '#a8d4a0' : '#e8e2d0',
                        '--card-border': card.type === 'goose' ? '#b91c2c' : '#3a3530',
                      } as React.CSSProperties}>
                        <span className="card-icon">
                          {card.type === 'duck' ? '🦆' : card.type === 'plus2' ? '🦆🦆' : card.type === 'plus4' ? '🦆🦆🦆🦆' : card.type === 'bread' ? '🍞' : '🪿'}
                        </span>
                        <span className="card-label">{card.label}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Hand
              cards={playerData.hand}
              onPlayCard={handlePlayCard}
              disabled={
                (!isPlayerTurn || state.phase !== 'turnAction')
                && state.phase !== 'gooseForced'
              }
              pendingChain={false}
              chainType={null}
              gooseForced={state.phase === 'gooseForced'}
            />
          )}
        </>
      )}

      {/* Discard Explosion */}
      {state.phase === 'discardExplode' && state.discardingCard && (
        <DiscardExplode card={state.discardingCard} onComplete={onDiscardExplodeDone} />
      )}

      {/* Goose Attack */}
      {state.phase === 'gooseAttack' && state.attackTarget && (
        <GooseAttack targetId={state.attackTarget} onComplete={onGooseAttackDone} />
      )}

      {/* Bread Save */}
      {breadSaveAnim && (
        <div className="bread-save-overlay">
          <div className="bread-save-text">🍞 BREAD SAVES YOU! 🍞</div>
        </div>
      )}

      {/* End Screens */}
      {state.phase === 'win' && <EndScreen won onRestart={handleRestart} />}
      {state.phase === 'lose' && <EndScreen won={false} onRestart={handleRestart} />}

      {/* Restart button — always visible during gameplay */}
      {showHand && (
        <button className="restart-btn" onClick={handleRestart}>RESTART</button>
      )}
    </div>
  );
}
