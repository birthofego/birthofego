'use client';
import { useTypingEffect } from '@/hooks/use-typing-effect';
import { content } from '@/data/content';

export function Hero() {
  const typed = useTypingEffect(content.hero.typingPhrases);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-prompt">
          <span className="hero-prompt-ink">{content.hero.promptUser}</span>
          <span className="hero-prompt-red">@</span>
          <span className="hero-prompt-ink">{content.hero.promptHost}</span>
          :~$ <span aria-live="polite">{typed}</span>
        </div>
        <div className="hero-handle" aria-hidden="true">{content.hero.handle}</div>
        <h1 id="hero-title" className="hero-h1">
          {content.hero.title}
          <span className="cursor" aria-hidden="true" />
        </h1>
        <p className="hero-tagline">{content.hero.tagline}</p>
        <p className="hero-subtagline">
          {content.hero.subtagline.before}
          <span className="red">{content.hero.subtagline.red1}</span>
        </p>
        <div className="cta-row">
          {content.hero.ctas.map((cta) => (
            <a key={cta.label} href={cta.href} className={`btn${cta.variant === 'ghost' ? ' ghost' : ''}`}>
              {cta.label}
            </a>
          ))}
        </div>
      </section>
      <style>{`
        .hero {
          min-height: calc(100vh - 70px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 0 80px;
        }
        .hero-prompt {
          font-size: 24px;
          color: var(--muted);
          margin-bottom: 24px;
          font-family: var(--font-terminal), monospace;
        }
        .hero-prompt-red { color: var(--red); }
        .hero-prompt-ink { color: var(--ink); }
        .hero-handle {
          font-family: var(--font-pixel), monospace;
          font-size: 11px;
          color: var(--red);
          letter-spacing: 3px;
          margin-bottom: 18px;
        }
        .hero-h1 {
          font-family: var(--font-pixel), monospace;
          font-size: clamp(36px, 8vw, 100px);
          color: var(--ink);
          letter-spacing: 6px;
          margin-bottom: 28px;
          line-height: 1.05;
          display: inline-block;
        }
        .hero-h1 .dot { color: var(--red); }
        .hero-h1 .cursor {
          display: inline-block;
          width: 0.55em;
          height: 0.9em;
          background: var(--red);
          vertical-align: baseline;
          margin-left: 10px;
          animation: blink 1s steps(2) infinite;
        }
        .hero-tagline {
          font-family: var(--font-terminal), monospace;
          font-size: 26px;
          color: var(--ink);
          max-width: 760px;
          margin-bottom: 12px;
        }
        .hero-subtagline {
          font-family: var(--font-terminal), monospace;
          font-size: 22px;
          color: var(--muted);
          max-width: 720px;
          margin-bottom: 40px;
        }
        .hero-subtagline .red { color: var(--red); }
        .cta-row { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn {
          font-family: var(--font-pixel), monospace;
          font-size: 11px;
          padding: 16px 24px;
          border-radius: 10px;
          border: 2px solid var(--ink);
          background: var(--ink);
          color: var(--bg-alt);
          text-decoration: none;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .btn:hover {
          background: var(--red);
          border-color: var(--red);
          transform: translateY(-2px);
          box-shadow: 4px 4px 0 var(--ink);
        }
        .btn:focus-visible {
          outline: 2px solid var(--red);
          outline-offset: 2px;
        }
        .btn.ghost {
          background: transparent;
          color: var(--ink);
          border-color: var(--ink);
        }
        .btn.ghost:hover {
          background: transparent;
          color: var(--red);
          border-color: var(--red);
          box-shadow: 4px 4px 0 var(--ink);
        }
        @media (max-width: 640px) {
          .hero-h1 { letter-spacing: 3px; }
        }
      `}</style>
    </>
  );
}
