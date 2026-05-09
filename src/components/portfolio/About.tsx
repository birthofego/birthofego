import { content } from '@/data/content';
import { TerminalWindow } from '@/components/ui/TerminalWindow';

export function About() {
  const { prose, signoff } = content.about;

  return (
    <>
      <section id="about" aria-labelledby="about-title" className="about-section">
        <div className="section-label">{content.about.label}</div>
        <h2 id="about-title" className="section-title">{content.about.title}</h2>
        <div className="about-grid">
          <div className="about-prose">
            <p className="about-lead">
              I go by <span className="accent">Ego</span>. I know how it lands at first.
            </p>
            <p>
              Most people hear &ldquo;ego&rdquo; and think arrogance. But ego just means{' '}
              <em>self</em>. It means me. And it also means{' '}
              <span className="highlight">confidence</span> &mdash; the quiet kind you build when
              you stop shrinking yourself to make other people comfortable.
            </p>
            <p>
              <span className="highlight">birthofego</span> is exactly what it sounds like. This is
              the birth of who I am.
            </p>
            <p>{prose.p4}</p>
            <p>{prose.p5}</p>
            <p className="signoff">{signoff}</p>
          </div>
          <TerminalWindow title={content.profile.terminalTitle} status={content.profile.terminalStatus}>
            <div className="term-line">
              <span className="term-prompt">$</span> cat profile.json
            </div>
            <div className="term-line">
              <span className="term-comment">{'{'}</span>
            </div>
            {content.profile.entries.map((entry) => (
              <div key={entry.key} className="term-line">
                &nbsp;&nbsp;
                <span className="term-key">&quot;{entry.key}&quot;</span>:{' '}
                <span className="term-value" style={entry.accent ? { color: 'var(--red)' } : undefined}>
                  {entry.value}
                </span>
                {entry.key !== 'mantra' ? ',' : ''}
              </div>
            ))}
            <div className="term-line">
              <span className="term-comment">{'}'}</span>
            </div>
            <div className="term-line">&nbsp;</div>
            <div className="term-line">
              <span className="term-prompt">$</span>{' '}
              <span
                aria-hidden="true"
                className="cursor-mini"
              />
            </div>
          </TerminalWindow>
        </div>
      </section>
      <style>{`
        .about-section { padding: 96px 0; scroll-margin-top: 100px; }
        .section-label {
          font-family: var(--font-pixel), monospace;
          font-size: 10px;
          color: var(--red);
          letter-spacing: 2px;
          margin-bottom: 14px;
        }
        .section-title {
          font-family: var(--font-pixel), monospace;
          font-size: 22px;
          color: var(--ink);
          margin-bottom: 48px;
          line-height: 1.4;
        }
        .section-title::before {
          content: "> ";
          color: var(--red);
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: start;
        }
        .about-prose p {
          font-family: var(--font-terminal), monospace;
          font-size: 22px;
          color: var(--ink);
          margin-bottom: 18px;
          line-height: 1.55;
        }
        .about-lead {
          font-size: 28px !important;
          margin-bottom: 22px !important;
        }
        .about-prose em { font-style: italic; color: var(--ink); }
        .about-prose .accent {
          background: var(--red);
          padding: 0 6px;
          border-radius: 3px;
          color: #fff;
          font-style: normal;
        }
        .about-prose .highlight { color: var(--red); font-style: normal; }
        .about-prose .signoff {
          font-family: var(--font-pixel), monospace;
          font-size: 11px;
          color: var(--red);
          letter-spacing: 2px;
          margin-top: 28px;
          margin-bottom: 0 !important;
        }
        .term-line { margin-bottom: 6px; font-family: var(--font-terminal), monospace; font-size: 20px; }
        .term-prompt { color: var(--red); }
        .term-value { color: var(--ink); }
        .term-comment { color: var(--muted); }
        .term-key { color: var(--ink-soft); }
        .cursor-mini {
          display: inline-block;
          width: 10px;
          height: 16px;
          background: var(--red);
          vertical-align: middle;
          animation: blink 1s steps(2) infinite;
        }
        @media (max-width: 960px) {
          .about-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
