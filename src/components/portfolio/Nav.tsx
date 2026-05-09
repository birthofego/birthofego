import { content } from '@/data/content';
import { DarkModeToggle } from '@/components/portfolio/DarkModeToggle';

export function Nav() {
  return (
    <>
      <nav>
        <div className="logo">
          {content.brand.name}
          <span className="dot" aria-hidden="true">.</span>
          <span className="cursor" aria-hidden="true" />
        </div>
        <div className="nav-right">
          <ul>
            {content.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <DarkModeToggle />
        </div>
      </nav>
      <style>{`
        nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 48px;
          background: rgba(250, 250, 250, 0.9);
          backdrop-filter: blur(8px);
          border-bottom: 2px solid var(--ink);
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        nav .logo {
          font-family: var(--font-pixel), monospace;
          font-size: 14px;
          color: var(--ink);
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
        }
        nav .logo .dot {
          color: var(--red);
          margin-left: 4px;
          font-size: 18px;
          line-height: 0;
        }
        nav .logo .cursor {
          display: inline-block;
          width: 8px;
          height: 14px;
          background: var(--red);
          margin-left: 6px;
          animation: blink 1s steps(2) infinite;
          vertical-align: middle;
        }
        nav ul {
          display: flex;
          gap: 28px;
          list-style: none;
        }
        nav a {
          font-family: var(--font-terminal), monospace;
          font-size: 22px;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
        }
        nav a:hover { color: var(--ink); }
        nav a:hover::after {
          content: "_";
          color: var(--red);
          margin-left: 2px;
          animation: blink 1s steps(2) infinite;
        }
        nav a:focus-visible {
          outline: 2px solid var(--red);
          outline-offset: 2px;
          border-radius: 2px;
        }
        @media (max-width: 960px) {
          nav { padding: 16px 24px; }
          nav ul { gap: 16px; }
        }
        @media (max-width: 640px) {
          nav ul { gap: 12px; }
          nav a { font-size: 18px; }
        }
      `}</style>
    </>
  );
}
