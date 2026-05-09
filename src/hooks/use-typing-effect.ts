'use client';
import { useEffect, useState } from 'react';

export function useTypingEffect(
  phrases: string[],
  opts: { typeSpeed?: number; deleteSpeed?: number; holdMs?: number } = {}
) {
  const { typeSpeed = 90, deleteSpeed = 40, holdMs = 1800 } = opts;
  const [text, setText] = useState('');
  const [pIdx, setPIdx] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setText(phrases[phrases.length - 1]);
      return;
    }

    const current = phrases[pIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (cIdx < current.length) {
        timeout = setTimeout(() => {
          setCIdx(cIdx + 1);
          setText(current.slice(0, cIdx + 1));
        }, typeSpeed);
      } else {
        timeout = setTimeout(() => setDeleting(true), holdMs);
      }
    } else {
      if (cIdx > 0) {
        timeout = setTimeout(() => {
          setCIdx(cIdx - 1);
          setText(current.slice(0, cIdx - 1));
        }, deleteSpeed);
      } else {
        setDeleting(false);
        setPIdx((pIdx + 1) % phrases.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [pIdx, cIdx, deleting, phrases, typeSpeed, deleteSpeed, holdMs]);

  return text;
}
