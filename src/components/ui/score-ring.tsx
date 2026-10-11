import type { CSSProperties, ReactNode } from 'react';
import { scoreTone } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  value: number | null | undefined;
  size?: string;
  thickness?: string;
  label?: string;
  children?: ReactNode;
  className?: string;
}

const TONE = {
  success: 'text-success',
  primary: 'text-primary',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-base-content/30',
} as const;

/** daisyUI radial progress for 0–100 scores. */
export function ScoreRing({
  value,
  size = '7rem',
  thickness = '0.55rem',
  label = 'Sleep score',
  children,
  className,
}: ScoreRingProps) {
  const score = value ?? 0;
  return (
    <div
      className={cn('tabular radial-progress bg-base-300/40', TONE[scoreTone(value)], className)}
      style={{ '--value': score, '--size': size, '--thickness': thickness } as CSSProperties}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value ?? undefined}
    >
      <span className="flex flex-col items-center text-base-content">
        {children ?? value ?? '—'}
      </span>
    </div>
  );
}
