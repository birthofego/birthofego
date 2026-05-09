'use client';

import { useState } from 'react';
import { content } from '@/data/content';
import { TerminalWindow } from '@/components/ui/TerminalWindow';

export function About() {
  const { prose, signoff } = content.about;
  const a2 = content.about2;
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <section id="about" aria-labelledby="about-title" className="about-section">
        <div className="section-label">{content.about.label}</div>
        <h2 id="about-title" className="section-title">{content.about.title}</h2>
        <div className="about-grid">
          <div className="about-prose">
            {/* Intro */}
            <p className="about-lead">
              {prose.lead.prefix}<span className="accent">{prose.lead.accent}</span>{prose.lead.suffix}
            </p>
            <p>
              {prose.p2.before}
              <em>{prose.p2.em}</em>
              {prose.p2.mid}
              <span className="highlight">{prose.p2.highlight}</span>
              {prose.p2.after}
            </p>
            <p>
              {prose.p3.before}
              <span className="highlight">{prose.p3.highlight}</span>
              {prose.p3.after}
            </p>

            {/* Expand toggle */}
            <button
              className="about-expand-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '▾ COLLAPSE' : '▸ ABOUT ME'}
            </button>
            {!expanded && (
              <p className="about-click-hint">^ click me ^</p>
            )}

            {!expanded && (
              <p className="about-tldr">
                TLDR; Uhh I&rsquo;m sorta cool? I think.. but uhh you should read the full thing :)
              </p>
            )}

            {expanded && (
              <div className="about-expanded">
                <div className="about-divider" />

                {/* Timeline: The Origin */}
                <div className="about-chapter">
                  <span className="about-chapter-tag">AGE 14 — THE SPARK</span>
                  <p>{prose.p4}</p>
                </div>

                <div className="about-pullquote">
                  &ldquo;If I can&rsquo;t play video games... why don&rsquo;t I try making one?&rdquo;
                </div>

                <div className="about-chapter">
                  <span className="about-chapter-tag">AGE 16 — GOING DEEPER</span>
                  <p>{prose.p5}</p>
                </div>

                <div className="about-chapter">
                  <span className="about-chapter-tag">AGE 18 — THE TURNING POINT</span>
                  <p>{prose.p5b}</p>
                </div>

                <div className="about-divider" />

                {/* Career */}
                <div className="about-chapter">
                  <span className="about-chapter-tag">THE GRIND</span>
                  <p>{a2.p6}</p>
                </div>

                <div className="about-chapter">
                  <span className="about-chapter-tag">AGE 24 — NOW</span>
                  <p>{a2.p7}</p>
                </div>

                <div className="about-pullquote">
                  &ldquo;Challenges aren&rsquo;t roadblocks — they&rsquo;re locked doors.&rdquo;
                </div>

                <div className="about-divider" />

                {/* Realness */}
                <div className="about-chapter">
                  <span className="about-chapter-tag">MORE PERSONAL INFORMATION ABOUT ME</span>
                  <p>{a2.p8}</p>
                </div>

                <div className="about-chapter">
                  <span className="about-chapter-tag">ON AI</span>
                  <p>{a2.p9}</p>
                </div>

                <div className="about-divider" />

                {/* Closing */}
                <div className="about-chapter">
                  <span className="about-chapter-tag">THE PERSON BEHIND THE CODE</span>
                  <p>{a2.p10}</p>
                </div>

                <p className="about-closing">{a2.closing}</p>
                <p className="signoff">{signoff}</p>
              </div>
            )}
          </div>

          <div className="about-sidebar">
            <TerminalWindow title={content.profile.terminalTitle} status={content.profile.terminalStatus}>
              <div className="term-line">
                <span className="term-prompt">$</span> cat profile.json
              </div>
              <div className="term-line">
                <span className="term-comment">{'{'}</span>
              </div>
              {content.profile.entries.map((entry, i) => (
                <div key={entry.key} className="term-line">
                  &nbsp;&nbsp;
                  <span className="term-key">&quot;{entry.key}&quot;</span>:{' '}
                  <span className="term-value" style={entry.accent ? { color: 'var(--red)' } : undefined}>
                    {entry.value}
                  </span>
                  {i < content.profile.entries.length - 1 ? ',' : ''}
                </div>
              ))}
              <div className="term-line">
                <span className="term-comment">{'}'}</span>
              </div>
              <div className="term-line">&nbsp;</div>
              <div className="term-line">
                <span className="term-prompt">$</span>{' '}
                <span aria-hidden="true" className="cursor-mini" />
              </div>
            </TerminalWindow>
          </div>
        </div>
      </section>
      <style>{`
        .about-section { padding: 96px 0; scroll-margin-top: 100px; overflow: visible; }
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
          grid-template-columns: 1fr 380px;
          gap: 56px;
          align-items: start;
        }
        .about-sidebar {
          position: sticky;
          top: 100px;
          align-self: start;
        }
        .about-prose p {
          font-family: var(--font-terminal), monospace;
          font-size: 20px;
          color: var(--ink);
          margin-bottom: 18px;
          line-height: 1.6;
        }
        .about-lead {
          font-size: 26px !important;
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

        /* Click hint */
        .about-click-hint {
          font-family: var(--font-pixel), monospace;
          font-size: 10px !important;
          color: var(--red) !important;
          text-align: center;
          letter-spacing: 2px;
          margin-top: 6px !important;
          margin-bottom: 8px !important;
          animation: about-hint-pulse 1.5s ease-in-out infinite;
        }
        @keyframes about-hint-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Expand button */
        .about-expand-btn {
          display: block;
          margin: 28px 0 16px;
          font-family: var(--font-pixel), monospace;
          font-size: 13px;
          letter-spacing: 3px;
          color: var(--bg-alt);
          background: var(--red);
          border: 2px solid var(--red);
          padding: 14px 28px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: center;
        }
        .about-expand-btn:hover {
          background: var(--red-dark);
          border-color: var(--red-dark);
          transform: translateY(-2px);
          box-shadow: 4px 4px 0 var(--ink);
        }

        /* TLDR */
        .about-tldr {
          font-family: var(--font-terminal), monospace;
          font-size: 16px !important;
          color: var(--muted) !important;
          font-style: italic;
          text-align: center;
          margin-top: 4px !important;
        }

        /* Expanded content */
        .about-expanded {
          animation: about-slide-in 0.4s ease;
        }
        @keyframes about-slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Dividers */
        .about-divider {
          width: 60px;
          height: 2px;
          background: var(--red);
          margin: 36px 0;
          opacity: 0.5;
        }

        /* Chapter tags */
        .about-chapter {
          margin-bottom: 24px;
        }
        .about-chapter-tag {
          display: inline-block;
          font-family: var(--font-pixel), monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: var(--red);
          border: 1px solid var(--red);
          padding: 4px 10px;
          border-radius: 4px;
          margin-bottom: 12px;
          opacity: 0.8;
        }
        .about-chapter p {
          margin-bottom: 0 !important;
        }

        /* Pull quotes */
        .about-pullquote {
          font-family: var(--font-terminal), monospace;
          font-size: 24px;
          color: var(--red);
          border-left: 3px solid var(--red);
          padding-left: 20px;
          margin: 32px 0;
          line-height: 1.5;
          font-style: italic;
          opacity: 0.9;
        }

        /* Closing */
        .about-closing {
          font-style: italic;
          color: var(--muted) !important;
          margin-top: 24px !important;
          font-size: 22px !important;
        }
        .about-prose .signoff {
          font-family: var(--font-pixel), monospace;
          font-size: 11px;
          color: var(--red);
          letter-spacing: 2px;
          margin-top: 28px;
          margin-bottom: 0 !important;
        }

        /* Terminal */
        .term-line { margin-bottom: 6px; font-family: var(--font-terminal), monospace; font-size: 18px; }
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
          .about-sidebar { position: static; }
          .about-pullquote { font-size: 20px; }
        }
      `}</style>
    </>
  );
}
