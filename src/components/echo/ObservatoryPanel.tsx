'use client';

import { useRef, useEffect } from 'react';
import type { PipelineEvent } from './types';

interface ObservatoryPanelProps {
  events: PipelineEvent[];
}

const TYPE_COLORS: Record<string, string> = {
  'key-generate': '#00d68f',
  'key-export': '#00d68f',
  'key-exchange': '#00d68f',
  'key-derive': '#00d68f',
  'encrypt': '#3b82f6',
  'decrypt': '#f59e0b',
  'net-send': '#8b5cf6',
  'net-receive': '#8b5cf6',
  'net-poll': '#6a6a6a',
};

const TYPE_ICONS: Record<string, string> = {
  'key-generate': 'KEY',
  'key-export': 'KEY',
  'key-exchange': 'KEY',
  'key-derive': 'KEY',
  'encrypt': 'ENC',
  'decrypt': 'DEC',
  'net-send': 'NET',
  'net-receive': 'NET',
  'net-poll': 'NET',
};

export default function ObservatoryPanel({ events }: ObservatoryPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  return (
    <div className="echo-observatory">
      <div className="echo-obs-header">
        <span className="echo-obs-title">ENCRYPTION OBSERVATORY</span>
        <span className="echo-obs-count">{events.length} events</span>
      </div>

      <div className="echo-obs-events">
        {events.length === 0 && (
          <div className="echo-obs-empty">
            Waiting for crypto operations...
          </div>
        )}
        {events.map(event => (
          <div
            key={event.id}
            className="echo-obs-event"
            style={{ '--event-color': TYPE_COLORS[event.type] || '#6a6a6a' } as React.CSSProperties}
          >
            <div className="echo-obs-event-head">
              <span
                className="echo-obs-event-badge"
                style={{ background: TYPE_COLORS[event.type] || '#6a6a6a' }}
              >
                {TYPE_ICONS[event.type] || '???'}
              </span>
              <span className="echo-obs-event-label">{event.label}</span>
              {event.durationMs !== undefined && (
                <span className="echo-obs-event-timing">{event.durationMs.toFixed(1)}ms</span>
              )}
            </div>
            <div className="echo-obs-event-detail">{event.detail}</div>
            {event.dataPreview && (
              <div className="echo-obs-event-data">{event.dataPreview}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
