'use client';
import { useTilt } from '@/hooks/use-tilt';

type Props = { label: string };

export function StackChip({ label }: Props) {
  const ref = useTilt({ maxAngle: 5, translateZ: 0 });

  return (
    <>
      <div ref={ref} className="stack-chip">
        {label}
      </div>
      <style>{`
        .stack-chip {
          background: var(--bg-alt);
          border: 2px solid var(--ink);
          border-radius: 10px;
          padding: 22px 16px;
          text-align: center;
          font-family: var(--font-pixel), monospace;
          font-size: 10px;
          color: var(--ink);
          letter-spacing: 1px;
          transition: all 0.2s;
          cursor: default;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .stack-chip:hover {
          background: var(--red);
          border-color: var(--red);
          color: var(--bg-alt);
          transform: translateY(-3px);
          box-shadow: 4px 4px 0 var(--ink);
        }
      `}</style>
    </>
  );
}
