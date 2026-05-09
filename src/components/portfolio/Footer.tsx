import { content } from '@/data/content';

export function Footer() {
  return (
    <>
      <footer>
        <div className="footer-brand">
          BIRTHOFEGO<span className="footer-dot" aria-hidden="true">.</span>
          {' '}// {content.footer.year}
        </div>
        <div className="footer-sub">{content.footer.subline}</div>
      </footer>
      <style>{`
        footer {
          padding: 48px;
          text-align: center;
          font-family: var(--font-terminal), monospace;
          font-size: 18px;
          color: var(--muted);
          border-top: 2px solid var(--ink);
          margin-top: 64px;
          position: relative;
          z-index: 1;
        }
        .footer-brand {
          font-family: var(--font-pixel), monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: var(--ink);
        }
        .footer-dot { color: var(--red); }
        .footer-sub { margin-top: 10px; }
      `}</style>
    </>
  );
}
