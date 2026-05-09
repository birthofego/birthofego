'use client';

import { useState, useEffect, useRef } from 'react';

const PASS_HASH = '936a185caaa266bb9cbe981e9e05cb78cd732b0b3280eb944412bb6f8f8f07af';

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [booting, setBooting] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Default to dark mode
    const saved = localStorage.getItem('birthofego-theme');
    if (!saved || saved === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('birthofego-theme', 'dark');
    }

    setChecking(false);

    const bootTimer = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    if (!booting && !authenticated && !unlocking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [booting, authenticated, unlocking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(input.trim().toLowerCase());
    if (hash === PASS_HASH) {
      setUnlocking(true);
      setTimeout(() => setAuthenticated(true), 2800);
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2000);
    }
  };

  if (checking) return null;
  if (authenticated) return <>{children}</>;

  return (
    <>
      <div className="gate-screen" onClick={() => inputRef.current?.focus()}>
        <div className="gate-scanline" />
        <div className="gate-container">
          {unlocking ? (
            <div className="gate-unlock">
              <p className="gate-unlock-line"><span className="gate-ok">[OK]</span> Access key accepted.</p>
              <p className="gate-unlock-line"><span className="gate-ok">[OK]</span> Decrypting session ...</p>
              <p className="gate-unlock-line"><span className="gate-ok">[OK]</span> Loading portfolio modules ...</p>
              <div className="gate-unlock-bar-wrap">
                <div className="gate-unlock-bar" />
              </div>
              <p className="gate-unlock-line gate-unlock-welcome">Welcome, visitor.</p>
            </div>
          ) : booting ? (
            <div className="gate-boot">
              <p className="gate-boot-line">BIOS v2.4.1 ... <span className="gate-ok">OK</span></p>
              <p className="gate-boot-line">Memory check ... <span className="gate-ok">32768K OK</span></p>
              <p className="gate-boot-line">Loading kernel modules ...</p>
              <p className="gate-boot-line">Mounting filesystem ... <span className="gate-ok">OK</span></p>
              <p className="gate-boot-line">Starting birthofego.dev <span className="gate-cursor">_</span></p>
            </div>
          ) : (
            <div className="gate-prompt-area">
              <pre className="gate-ascii">{`
  ┌──────────────────────────────┐
  │   ACCESS RESTRICTED          │
  │   birthofego.dev             │
  └──────────────────────────────┘`}</pre>

              <div className="gate-info">
                <p className="gate-system-msg">[SYSTEM] This terminal requires authentication.</p>
                <p className="gate-system-msg">[SYSTEM] Enter access key to proceed.</p>
              </div>

              <form className="gate-form" onSubmit={handleSubmit}>
                <div className="gate-input-line">
                  <span className="gate-prompt-symbol">visitor@birthofego:~$</span>
                  <input
                    ref={inputRef}
                    className="gate-input"
                    type="password"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder=""
                  />
                  <span className="gate-cursor">_</span>
                </div>
              </form>

              {error && (
                <p className="gate-error">[ERROR] Access denied. Invalid key.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .gate-screen {
          position: fixed;
          inset: 0;
          background: #0a0a0a;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: text;
          overflow: hidden;
        }

        .gate-scanline {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.015) 2px,
            rgba(0, 255, 0, 0.015) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        .gate-container {
          position: relative;
          z-index: 2;
          max-width: 600px;
          width: 100%;
          padding: 24px;
        }

        /* Boot sequence */
        .gate-boot {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gate-boot-line {
          font-family: var(--font-terminal), 'Courier New', monospace;
          font-size: 16px;
          color: #4ade80;
          opacity: 0;
          animation: gate-type-in 0.3s ease forwards;
        }

        .gate-boot-line:nth-child(1) { animation-delay: 0.0s; }
        .gate-boot-line:nth-child(2) { animation-delay: 0.3s; }
        .gate-boot-line:nth-child(3) { animation-delay: 0.7s; }
        .gate-boot-line:nth-child(4) { animation-delay: 1.0s; }
        .gate-boot-line:nth-child(5) { animation-delay: 1.4s; }

        .gate-ok {
          color: #22c55e;
        }

        /* Prompt area */
        .gate-prompt-area {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: gate-fade-in 0.4s ease;
        }

        .gate-ascii {
          font-family: var(--font-terminal), 'Courier New', monospace;
          font-size: 14px;
          color: #e63946;
          line-height: 1.4;
          white-space: pre;
        }

        .gate-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gate-system-msg {
          font-family: var(--font-terminal), 'Courier New', monospace;
          font-size: 14px;
          color: #6a6a6a;
        }

        .gate-form {
          margin: 0;
        }

        .gate-input-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-terminal), 'Courier New', monospace;
          font-size: 16px;
        }

        .gate-prompt-symbol {
          color: #4ade80;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .gate-input {
          background: transparent;
          border: none;
          outline: none;
          color: #e8e8e8;
          font-family: var(--font-terminal), 'Courier New', monospace;
          font-size: 16px;
          flex: 1;
          caret-color: transparent;
          letter-spacing: 4px;
        }

        .gate-input::placeholder {
          color: transparent;
        }

        .gate-cursor {
          color: #4ade80;
          animation: blink 1s steps(2) infinite;
        }

        .gate-error {
          font-family: var(--font-terminal), 'Courier New', monospace;
          font-size: 14px;
          color: #e63946;
          animation: gate-shake 0.3s ease;
        }

        /* Unlock sequence */
        .gate-unlock {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gate-unlock-line {
          font-family: var(--font-terminal), 'Courier New', monospace;
          font-size: 15px;
          color: #4ade80;
          opacity: 0;
          animation: gate-type-in 0.3s ease forwards;
        }

        .gate-unlock-line:nth-child(1) { animation-delay: 0.0s; }
        .gate-unlock-line:nth-child(2) { animation-delay: 0.4s; }
        .gate-unlock-line:nth-child(3) { animation-delay: 0.8s; }
        .gate-unlock-bar-wrap {
          opacity: 0;
          animation: gate-type-in 0.3s ease forwards;
          animation-delay: 1.1s;
        }
        .gate-unlock-welcome {
          animation-delay: 2.2s !important;
          color: #e63946 !important;
          font-size: 18px !important;
          margin-top: 8px;
          letter-spacing: 2px;
        }

        .gate-unlock-bar-wrap {
          height: 4px;
          background: #1a1a1a;
          border-radius: 2px;
          overflow: hidden;
          margin: 8px 0;
        }

        .gate-unlock-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #4ade80, #22c55e);
          border-radius: 2px;
          animation: gate-load-bar 1.0s ease forwards;
          animation-delay: 1.2s;
        }

        @keyframes gate-load-bar {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes gate-type-in {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes gate-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes gate-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
        }

        @media (max-width: 480px) {
          .gate-prompt-symbol {
            font-size: 12px;
          }
          .gate-ascii {
            font-size: 11px;
          }
          .gate-input {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
