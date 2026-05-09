'use client';

import { useState, useCallback, useRef } from 'react';
import type { PipelineEvent } from './types';

const MAX_EVENTS = 60;

export function usePipeline() {
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const idCounter = useRef(0);

  const push = useCallback((event: PipelineEvent) => {
    setEvents(prev => {
      const next = [...prev, { ...event, id: event.id || `pe-${++idCounter.current}` }];
      return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
    });
  }, []);

  const pushMany = useCallback((newEvents: PipelineEvent[]) => {
    setEvents(prev => {
      const next = [...prev, ...newEvents];
      return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
    });
  }, []);

  const clear = useCallback(() => setEvents([]), []);

  return { events, push, pushMany, clear };
}
