'use client';

import { useState, useEffect } from 'react';

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('birthofego-theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('birthofego-theme', next ? 'dark' : 'light');
  };

  return (
    <>
      <button
        onClick={toggle}
        className="dark-toggle"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? '☀' : '☾'}
      </button>
      <style>{`
        .dark-toggle {
          font-size: 18px;
          width: 36px;
          height: 36px;
          border: 2px solid var(--ink);
          border-radius: 8px;
          background: var(--bg);
          color: var(--ink);
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .dark-toggle:hover {
          background: var(--red);
          border-color: var(--red);
          color: var(--bg-alt);
          transform: translateY(-2px);
          box-shadow: 3px 3px 0 var(--ink);
        }
      `}</style>
    </>
  );
}
