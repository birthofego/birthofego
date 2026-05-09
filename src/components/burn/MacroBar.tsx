'use client';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  isCeiling?: boolean; // carbs/fat are ceilings (bad to exceed), protein is a goal (good to hit)
}

export default function MacroBar({ label, current, target, unit, color, isCeiling }: MacroBarProps) {
  const pct = Math.min((current / target) * 100, 100);
  const over = current > target;
  const displayColor = over && isCeiling ? '#ef4444' : color;

  return (
    <div className="burn-macro-bar">
      <div className="burn-macro-header">
        <span className="burn-macro-label">{label}</span>
        <span className="burn-macro-value" style={{ color: over && isCeiling ? '#ef4444' : undefined }}>
          {Math.round(current)}{unit}
          <span className="burn-macro-target"> / {target}{unit}</span>
        </span>
      </div>
      <div className="burn-bar-track">
        <div
          className="burn-bar-fill"
          style={{ width: `${pct}%`, background: displayColor }}
        />
      </div>
      {over && isCeiling && (
        <span className="burn-macro-over">OVER BY {Math.round(current - target)}{unit}</span>
      )}
    </div>
  );
}
