'use client';

import { useState, useCallback, useEffect } from 'react';

interface PrologueProps {
  onComplete: () => void;
  onProgress: (progress: number) => void; // 0-1 for camera dolly
  onFirstDeath: () => void;
  onGoosePlaced: () => void;
  paused: boolean;
}

type Line = {
  text: string;
  speaker?: string;
  style?: 'narration' | 'dialogue' | 'action' | 'goose';
  event?: 'firstDeath' | 'goosePlaced';
};

const SCRIPT: Line[] = [
  { text: 'The debt was inherited from your father. He passed mysteriously, and the debt fell into your hands.', style: 'narration' },
  { text: 'The only thing the police found in his apartment was a game called "Duck Duck Goose."', style: 'narration' },
  { text: "A children's game? No way this is all I get.", style: 'narration' },
  { text: "A board game and a debt I'll never pay off…", style: 'narration' },
  { text: 'Curiosity gets the better of you. You pop open the lid and read the instructions.', style: 'narration' },
  { text: 'Apparently you actually need a goose to play the game…?', style: 'narration' },
  { text: '"Dude. What the heck."', style: 'dialogue' },
  { text: 'Two hours later, you come back to the abandoned apartment.', style: 'narration' },
  { text: 'You set the goose on the round table and take a seat.', style: 'narration', event: 'goosePlaced' },
  { text: 'The mafia men approach from the shadows. Each takes a seat.', style: 'narration' },
  { text: '"Don\'t run. There\'s men outside."', speaker: 'Mafioso A', style: 'dialogue' },
  { text: '"You owe us. You better have a piggy bank stacked with cash, kiddo…"', speaker: 'Mafioso B', style: 'dialogue' },
  { text: '"…or a part-time job."', speaker: 'Mafioso C', style: 'dialogue' },
  { text: 'They all laugh.', style: 'action' },
  { text: '"Wait — let\'s talk this out. Can\'t we decide the outcome some other way?"', speaker: 'You', style: 'dialogue' },
  { text: '"As if, kid."', style: 'dialogue' },
  { text: '"Yeah, right."', style: 'dialogue' },
  { text: '"You wanna play Duck Duck Goose for your freedom, kiddo?"', speaker: 'Mafioso A', style: 'dialogue' },
  { text: '"No way, boss, c\'mon —"', style: 'dialogue' },
  { text: 'They all laugh.', style: 'action' },
  { text: '"Fine. Let\'s entertain the brat."', style: 'dialogue' },
  { text: '(The goose stares.)', style: 'action' },
  { text: 'Mafioso B draws the first card. It\'s a Goose.', style: 'narration' },
  { text: '[FIRST DEATH]', style: 'action', event: 'firstDeath' },
  { text: 'The goose returns to the table. Beak red. Calm. Quacks.', style: 'narration' },
  { text: 'Mafioso A and C try to bolt.', style: 'narration' },
  { text: 'The goose speaks. Its voice is deep and wrong.', style: 'narration' },
  { text: '"SIT DOWN."', speaker: 'The Goose', style: 'goose' },
  { text: "Free will wasn't an option. Everyone sits.", style: 'narration' },
  { text: '"The rules are simple. The last to survive determines the resolution of the contract."', speaker: 'The Goose', style: 'goose' },
  { text: '"The contract you\'ve chosen for this game… is the boys\' freedom."', speaker: 'The Goose', style: 'goose' },
  { text: '"Continue playing."', speaker: 'The Goose', style: 'goose' },
];

export default function Prologue({ onComplete, onProgress, onFirstDeath, onGoosePlaced, paused }: PrologueProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const advance = useCallback(() => {
    if (paused) return;

    const nextIdx = lineIndex + 1;

    if (nextIdx >= SCRIPT.length) {
      setVisible(false);
      setTimeout(onComplete, 600);
      return;
    }

    setVisible(false);
    setTimeout(() => {
      setLineIndex(nextIdx);
      setVisible(true);
      onProgress(nextIdx / SCRIPT.length);

      // Fire events when we land on that line
      if (SCRIPT[nextIdx].event === 'goosePlaced') {
        onGoosePlaced();
      }
      if (SCRIPT[nextIdx].event === 'firstDeath') {
        onFirstDeath();
      }
    }, 300);
  }, [lineIndex, onComplete, onProgress, onFirstDeath, paused]);

  const line = SCRIPT[lineIndex];
  const isGoose = line.style === 'goose';
  const isAction = line.style === 'action';
  const isDialogue = line.style === 'dialogue';

  return (
    <div className="goose-prologue" onClick={advance}>
      <div className={`prologue-line ${visible ? 'visible' : ''} ${isGoose ? 'goose-voice' : ''} ${isAction ? 'action-line' : ''}`}>
        {isDialogue || isGoose ? (
          <>
            <span className={`prologue-text ${isGoose ? 'goose-text' : ''}`}>
              {line.text}
            </span>
            {line.speaker && (
              <span className={`prologue-speaker ${isGoose ? 'goose-speaker' : ''}`}>
                — {line.speaker}
              </span>
            )}
          </>
        ) : (
          <span className={`prologue-text ${isAction ? 'italic' : ''}`}>
            {line.text}
          </span>
        )}
      </div>

      {!paused && (
        <div className="prologue-hint">
          {lineIndex < SCRIPT.length - 1 ? 'click to continue' : 'click to begin'}
        </div>
      )}

      <div className="prologue-progress">
        <div
          className="prologue-progress-fill"
          style={{ width: `${(lineIndex / SCRIPT.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
