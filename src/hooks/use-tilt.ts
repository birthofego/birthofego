'use client';
import { useEffect, useRef } from 'react';

export function useTilt(options: { maxAngle?: number; translateZ?: number } = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const { maxAngle = 6, translateZ = 10 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -maxAngle;
      const rotY = ((x - cx) / cx) * maxAngle;
      el.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${translateZ}px)`;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };
    const onLeave = () => {
      el.style.transform = `perspective(1200px) rotateX(0) rotateY(0) translateZ(0)`;
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [maxAngle, translateZ]);

  return ref as React.RefObject<HTMLDivElement>;
}
