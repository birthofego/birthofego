'use client';

interface TutorialProps {
  onContinue: () => void;
}

export default function Tutorial({ onContinue }: TutorialProps) {
  return (
    <div className="goose-tutorial" onClick={onContinue}>
      <div className="tutorial-content">
        <div className="tutorial-title">THE RULES</div>
        <div className="tutorial-subtitle">Draw one. Play one. Don&apos;t die.</div>

        <div className="tutorial-grid">
          <div className="tutorial-card-item">
            <span className="tutorial-emoji">🦆</span>
            <div className="tutorial-card-info">
              <span className="tutorial-card-name">DUCK</span>
              <span className="tutorial-card-desc">+1 to counter</span>
            </div>
          </div>
          <div className="tutorial-card-item">
            <span className="tutorial-emoji">🦆🦆</span>
            <div className="tutorial-card-info">
              <span className="tutorial-card-name">+2 DUCK</span>
              <span className="tutorial-card-desc">+2 to counter · deflects kill</span>
            </div>
          </div>
          <div className="tutorial-card-item">
            <span className="tutorial-emoji">🦆🦆🦆🦆</span>
            <div className="tutorial-card-info">
              <span className="tutorial-card-name">+4 DUCK</span>
              <span className="tutorial-card-desc">+4 to counter · deflects kill</span>
            </div>
          </div>
          <div className="tutorial-card-item">
            <span className="tutorial-emoji">🍞</span>
            <div className="tutorial-card-info">
              <span className="tutorial-card-name">BREAD</span>
              <span className="tutorial-card-desc">survives one goose attack</span>
            </div>
          </div>
          <div className="tutorial-card-item tutorial-card-danger">
            <span className="tutorial-emoji">🪿</span>
            <div className="tutorial-card-info">
              <span className="tutorial-card-name">GOOSE</span>
              <span className="tutorial-card-desc">draw this and you die</span>
            </div>
          </div>
        </div>

        <div className="tutorial-rules">
          <div className="tutorial-rule">
            <span className="tutorial-rule-icon">⚠</span>
            Counter hits <strong>10</strong> — next player dies unless they deflect.
          </div>
          <div className="tutorial-rule">
            <span className="tutorial-rule-icon">✋</span>
            Max <strong>4</strong> cards. Fifth card? The goose notices.
          </div>
          <div className="tutorial-rule">
            <span className="tutorial-rule-icon">🏆</span>
            Outlast the mafia. Last one alive sets the terms.
          </div>
        </div>

        <div className="tutorial-cta">click to continue</div>
      </div>
    </div>
  );
}
