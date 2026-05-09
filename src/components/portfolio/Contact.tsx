import { content } from '@/data/content';
import { TerminalWindow } from '@/components/ui/TerminalWindow';

export function Contact() {
  const { email, github } = content.contact;

  return (
    <>
      <section id="contact" aria-labelledby="contact-title" className="contact-section">
        <div className="section-label">{content.contact.label}</div>
        <h2 id="contact-title" className="section-title">{content.contact.title}</h2>
        <div className="contact-wrap">
          <TerminalWindow title={content.contact.terminalTitle} status={content.contact.terminalStatus}>
            <div className="ct-body">
              <div className="ct-line"><span className="ct-prompt">$</span> echo &quot;Open to junior / full-stack dev roles&quot;</div>
              <div className="ct-line">Open to junior / full-stack dev roles</div>
              <div className="ct-line">&nbsp;</div>
              <div className="ct-line"><span className="ct-prompt">$</span> contact --email</div>
              <div className="ct-line">
                <a href={`mailto:${email}`} className="ct-link">{email}</a>
              </div>
              <div className="ct-line">&nbsp;</div>
              <div className="ct-line"><span className="ct-prompt">$</span> contact --github</div>
              <div className="ct-line">
                <a href="#" className="ct-link">{github}</a>
              </div>
              <div className="ct-line">&nbsp;</div>
              <div className="ct-line">
                <span className="ct-prompt">$</span>{' '}
                <span aria-hidden="true" className="ct-cursor" />
              </div>
            </div>
          </TerminalWindow>
        </div>
      </section>
      <style>{`
        .contact-section { padding: 96px 0; scroll-margin-top: 100px; }
        .contact-wrap { max-width: 760px; }
        .ct-body { padding: 6px 8px; }
        .ct-line {
          font-family: var(--font-terminal), monospace;
          font-size: 22px;
          margin-bottom: 8px;
        }
        .ct-prompt { color: var(--red); }
        .ct-link {
          color: var(--ink);
          text-decoration: none;
          border-bottom: 2px solid var(--red);
          padding-bottom: 1px;
          transition: color 0.2s;
        }
        .ct-link:hover { color: var(--red); }
        .ct-link:focus-visible {
          outline: 2px solid var(--red);
          outline-offset: 2px;
        }
        .ct-cursor {
          display: inline-block;
          width: 10px;
          height: 16px;
          background: var(--red);
          vertical-align: middle;
          animation: blink 1s steps(2) infinite;
        }
      `}</style>
    </>
  );
}
