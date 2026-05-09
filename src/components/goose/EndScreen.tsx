'use client';

interface EndScreenProps {
  won: boolean;
  onRestart: () => void;
}

export default function EndScreen({ won, onRestart }: EndScreenProps) {
  return (
    <div className="goose-end-overlay">
      <div className="end-content">
        {won ? (
          <>
            <div className="end-title win">// CONTRACT_RESOLVED</div>
            <div className="end-subtitle">&quot;The boy walks free.&quot;</div>
            <div className="end-goose-line">
              The goose folds its wings. The contract dissolves.<br />
              You walk out into the morning. No one follows.
            </div>
          </>
        ) : (
          <>
            <div className="end-title lose">// CONTRACT_DEFAULTED</div>
            <div className="end-subtitle">You didn&apos;t make it.</div>
            <div className="end-goose-line">
              The goose returns to the table. Calm. Patient.<br />
              Waiting for the next debtor.
            </div>
          </>
        )}

        <button className="end-restart-btn" onClick={onRestart}>
          {won ? 'PLAY AGAIN' : 'TRY AGAIN'}
        </button>

        <div className="end-credit">
          GOOSE — a birthofego project
        </div>
      </div>
    </div>
  );
}
