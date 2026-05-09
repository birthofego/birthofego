'use client';

import { useState, useCallback } from 'react';
import { useEchoSession } from './useEchoSession';
import ChatPanel from './ChatPanel';
import ObservatoryPanel from './ObservatoryPanel';
import InterceptorView from './InterceptorView';

export default function EchoApp() {
  const session = useEchoSession();
  const [showInterceptor, setShowInterceptor] = useState(false);
  const [rightPanel, setRightPanel] = useState<'observatory' | 'interceptor'>('observatory');
  const [mobilePanel, setMobilePanel] = useState(false);

  const handleStart = useCallback(async () => {
    await session.connect();
  }, [session]);

  const toggleRight = useCallback((panel: 'observatory' | 'interceptor') => {
    setRightPanel(panel);
    if (panel === 'interceptor') setShowInterceptor(true);
  }, []);

  // ── Idle / Landing ──
  if (session.state === 'idle') {
    return (
      <div className="echo-app">
        <div className="echo-landing">
          <div className="echo-landing-badge">E2E ENCRYPTED</div>
          <h1 className="echo-landing-title">ECHO</h1>
          <p className="echo-landing-desc">
            Zero-signup encrypted messenger with a live encryption observatory.
            Watch every crypto operation happen in real time.
          </p>
          <div className="echo-landing-stack-grid">
            <div className="echo-stack-item">
              <span className="echo-stack-label">FRAMEWORK</span>
              <span className="echo-stack-value">Next.js 16 App Router</span>
            </div>
            <div className="echo-stack-item">
              <span className="echo-stack-label">LANGUAGE</span>
              <span className="echo-stack-value">TypeScript (strict)</span>
            </div>
            <div className="echo-stack-item">
              <span className="echo-stack-label">ENCRYPTION</span>
              <span className="echo-stack-value">ECDH P-256 + AES-256-GCM</span>
            </div>
            <div className="echo-stack-item">
              <span className="echo-stack-label">CRYPTO</span>
              <span className="echo-stack-value">Web Crypto API</span>
            </div>
            <div className="echo-stack-item">
              <span className="echo-stack-label">BACKEND</span>
              <span className="echo-stack-value">API Routes + In-Memory Store</span>
            </div>
            <div className="echo-stack-item">
              <span className="echo-stack-label">REAL-TIME</span>
              <span className="echo-stack-value">Short-Polling (1s interval)</span>
            </div>
          </div>
          <button className="echo-landing-btn" onClick={handleStart}>
            START ENCRYPTED SESSION
          </button>
          <div className="echo-landing-note">
            Demo mode — a bot with its own key pair responds to your messages.
            All encryption is real, not simulated.
          </div>
        </div>
      </div>
    );
  }

  // ── Connecting ──
  if (session.state === 'connecting') {
    return (
      <div className="echo-app">
        <div className="echo-landing">
          <div className="echo-connecting-text">
            <span className="echo-connecting-dot" />
            Generating keys & establishing channel...
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (session.state === 'error') {
    return (
      <div className="echo-app">
        <div className="echo-landing">
          <div className="echo-landing-title">CONNECTION FAILED</div>
          <button className="echo-landing-btn" onClick={handleStart}>
            RETRY
          </button>
        </div>
      </div>
    );
  }

  // ── Active Session ──
  return (
    <div className="echo-app">
      <div className="echo-layout">
        {/* Left: Chat */}
        <ChatPanel
          messages={session.messages}
          onSend={session.sendMessage}
          roomId={session.roomId}
          handle={session.handle}
          disabled={session.state !== 'ready'}
        />

        {/* Mobile toggle for observatory */}
        <button
          className="echo-mobile-toggle"
          onClick={() => setMobilePanel(!mobilePanel)}
        >
          {mobilePanel ? '← CHAT' : '⚡ CRYPTO'}
        </button>

        {/* Right: Observatory / Interceptor */}
        <div className={`echo-right-panel${mobilePanel ? ' mobile-visible' : ''}`}>
          <div className="echo-right-tabs">
            <button
              className={`echo-right-tab ${rightPanel === 'observatory' ? 'active' : ''}`}
              onClick={() => toggleRight('observatory')}
            >
              OBSERVATORY
            </button>
            <button
              className={`echo-right-tab ${rightPanel === 'interceptor' ? 'active' : ''}`}
              onClick={() => toggleRight('interceptor')}
            >
              INTERCEPTOR
            </button>
          </div>

          {rightPanel === 'observatory' ? (
            <ObservatoryPanel events={session.pipeline.events} />
          ) : (
            <InterceptorView rawMessages={session.rawMessages} />
          )}
        </div>
      </div>

      {/* Top bar */}
      <div className="echo-topbar">
        <div className="echo-topbar-left">
          <span className="echo-topbar-logo">ECHO</span>
          <span className="echo-topbar-sep">/</span>
          <span className="echo-topbar-room">{session.roomId}</span>
          <span className="echo-topbar-mode">DEMO</span>
        </div>
        <button className="echo-topbar-disconnect" onClick={session.disconnect}>
          DISCONNECT
        </button>
      </div>
    </div>
  );
}
