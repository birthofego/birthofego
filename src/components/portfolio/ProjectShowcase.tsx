'use client';

import { useTilt } from '@/hooks/use-tilt';
import { content } from '@/data/content';

const PROJECTS = [
  {
    number: 'PROJECT_01',
    title: 'ADVENTURER',
    description: 'A gamified task manager with a kanban quest board, daily to-do lists, and slime monsters you defeat by completing tasks.',
    tags: ['NEXT.JS', 'REACT', 'TS', 'CSS'],
    href: '/adventurer',
  },
  {
    number: 'PROJECT_02',
    title: 'GOOSE',
    description: 'A grainy little browser horror game. Pull cards, dodge the goose, win your freedom from the mafia. PS1-era cursed-cartoon aesthetic.',
    tags: ['NEXT.JS', 'TS', 'THREE.JS', 'WEB AUDIO'],
    href: '/goose',
  },
  {
    number: 'PROJECT_03',
    title: 'ECHO',
    description: 'Zero-signup encrypted messenger with a live encryption observatory. ECDH key exchange, AES-256-GCM — watch every crypto operation in real time.',
    tags: ['NEXT.JS', 'WEB CRYPTO', 'E2E ENCRYPTION', 'TS'],
    href: '/echo',
  },
  {
    number: 'PROJECT_04',
    title: 'THIS WEBSITE',
    description: 'The portfolio you\'re looking at right now. Built from scratch with no templates — password-gated, dark mode, custom terminal aesthetic, deployed on Netlify.',
    tags: ['NEXT.JS', 'TYPESCRIPT', 'CSS', 'NETLIFY'],
    href: '#',
  },
];

function LiveCard({ project }: { project: typeof PROJECTS[number] }) {
  const ref = useTilt({ maxAngle: 6, translateZ: 10 });

  return (
    <article ref={ref} className="showcase-card live">
      <div className="card-top-row">
        <span className="card-num">{project.number}</span>
        <span className="card-pill live">
          <span className="card-pill-dot" />
          LIVE
        </span>
      </div>
      <h3 className="card-title">{project.title}</h3>
      <p className="card-desc">{project.description}</p>
      <div className="card-tags">
        {project.tags.map(t => (
          <span key={t} className="card-tag">{t}</span>
        ))}
      </div>
      <div className="card-footer-row">
        <a href={project.href} className="card-link">&rarr; {project.title === 'GOOSE' ? 'play' : project.title === 'ECHO' ? 'demo' : project.title === 'THIS WEBSITE' ? 'you\'re here' : 'live demo'}</a>
        <a href="#" className="card-link">&rarr; source</a>
      </div>
    </article>
  );
}

function ComingSoonCard({ index }: { index: number }) {
  const ref = useTilt({ maxAngle: 4, translateZ: 6 });
  const num = String(index).padStart(2, '0');

  return (
    <article ref={ref} className="showcase-card soon">
      <div className="card-top-row">
        <span className="card-num">PROJECT_{num}</span>
        <span className="card-pill soon">SOON</span>
      </div>
      <div className="soon-center">
        <span className="soon-label">COMING SOON</span>
        <span className="soon-cursor" />
      </div>
    </article>
  );
}

export function ProjectShowcase() {
  return (
    <>
      <section id="projects" className="showcase-section">
        <div className="section-label">{content.projects.label}</div>
        <h2 className="section-title">{content.projects.title}</h2>
        <div className="showcase-grid">
          {PROJECTS.map(p => (
            <LiveCard key={p.number} project={p} />
          ))}
          {[6].map(i => (
            <ComingSoonCard key={i} index={i} />
          ))}
        </div>
      </section>
      <style>{`
        .showcase-section { padding: 96px 0; scroll-margin-top: 100px; }
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
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          perspective: 1400px;
        }

        /* Shared card base */
        .showcase-card {
          background: var(--bg-alt);
          border: 2px solid var(--ink);
          border-radius: 14px;
          padding: 28px;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s, border-color 0.25s;
          transform-style: preserve-3d;
          will-change: transform;
          position: relative;
          overflow: hidden;
          min-height: 280px;
          display: flex;
          flex-direction: column;
        }
        .showcase-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            500px circle at var(--mx, 50%) var(--my, 50%),
            var(--red-soft),
            transparent 45%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .showcase-card:hover {
          box-shadow: 8px 8px 0 var(--ink);
        }
        .showcase-card.live:hover {
          border-color: var(--red);
        }
        .showcase-card:hover::before { opacity: 1; }

        /* Coming soon cards */
        .showcase-card.soon {
          border-style: dashed;
        }
        .showcase-card.soon:hover {
          border-color: var(--muted);
        }
        .showcase-card.soon::before {
          background: radial-gradient(
            500px circle at var(--mx, 50%) var(--my, 50%),
            rgba(10, 10, 10, 0.03),
            transparent 45%
          );
        }
        .soon-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .soon-label {
          font-family: var(--font-pixel), monospace;
          font-size: 14px;
          color: var(--muted);
          letter-spacing: 3px;
        }
        .soon-cursor {
          display: inline-block;
          width: 18px;
          height: 3px;
          background: var(--red);
          animation: blink 1s steps(2) infinite;
        }

        /* Card internals */
        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .card-num {
          font-family: var(--font-pixel), monospace;
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 2px;
        }
        .card-pill {
          font-family: var(--font-pixel), monospace;
          font-size: 8px;
          letter-spacing: 2px;
          padding: 6px 10px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .card-pill.live {
          border: 2px solid var(--red);
          background: var(--red);
          color: var(--bg-alt);
        }
        .card-pill.soon {
          border: 2px solid var(--ink);
          background: var(--bg);
          color: var(--muted);
        }
        .card-pill-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--bg-alt);
          animation: blink 1.2s steps(2) infinite;
        }
        .card-title {
          font-family: var(--font-pixel), monospace;
          font-size: 14px;
          color: var(--ink);
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .card-desc {
          font-family: var(--font-terminal), monospace;
          font-size: 20px;
          color: var(--muted);
          margin-bottom: 20px;
          flex-grow: 1;
        }
        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 18px;
        }
        .card-tag {
          font-family: var(--font-pixel), monospace;
          font-size: 8px;
          padding: 6px 10px;
          border: 2px solid var(--ink);
          border-radius: 5px;
          color: var(--ink);
          letter-spacing: 1px;
          background: var(--bg);
        }
        .card-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 2px dashed var(--line-soft);
          font-family: var(--font-terminal), monospace;
          font-size: 18px;
        }
        .card-link {
          color: var(--ink);
          text-decoration: none;
          transition: color 0.2s, gap 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .card-link:hover { color: var(--red); gap: 10px; }
        .card-link:focus-visible {
          outline: 2px solid var(--red);
          outline-offset: 2px;
          border-radius: 2px;
        }

        @media (max-width: 960px) {
          .showcase-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .showcase-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
