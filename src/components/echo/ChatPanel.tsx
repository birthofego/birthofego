'use client';

import { useState, useRef, useEffect } from 'react';
import type { DecryptedMessage } from './types';

interface ChatPanelProps {
  messages: DecryptedMessage[];
  onSend: (text: string) => void;
  roomId: string | null;
  handle: string;
  disabled: boolean;
}

export default function ChatPanel({ messages, onSend, roomId, handle, disabled }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="echo-chat-panel">
      <div className="echo-chat-header">
        <div className="echo-chat-header-left">
          <span className="echo-status-dot" />
          <span className="echo-chat-title">ECHO</span>
        </div>
        {roomId && (
          <span className="echo-room-id">
            room: {roomId}
          </span>
        )}
      </div>

      <div className="echo-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`echo-msg ${msg.isOwn ? 'echo-msg-own' : ''} ${msg.senderId === 'system' ? 'echo-msg-system' : ''} ${msg.isBot ? 'echo-msg-bot' : ''}`}
          >
            {msg.senderId !== 'system' && (
              <span className="echo-msg-sender">
                {msg.isOwn ? handle : msg.senderHandle}
              </span>
            )}
            <span className="echo-msg-text">{msg.plaintext}</span>
            <span className="echo-msg-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="echo-input-bar" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="echo-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={disabled ? 'Connecting...' : 'Type a message...'}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="echo-send-btn"
          disabled={disabled || !input.trim()}
        >
          SEND
        </button>
      </form>
    </div>
  );
}
