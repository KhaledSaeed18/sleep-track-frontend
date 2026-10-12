import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NightArcProps {
  /** Position of the moon along the arc, 0 (bedtime) to 1 (wake). Omit to hide the moon. */
  progress?: number | null;
  /** Portion of the arc to draw as "slept", 0 to 1. Defaults to `progress`. */
  fill?: number | null;
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Animate the moon gently (used while a timer is running). */
  live?: boolean;
  title?: string;
}

const W = 240;
const H = 132;
const CX = W / 2;
const CY = 120;
const R = 104;

function pointAt(t: number) {
  const angle = Math.PI * Math.min(1, Math.max(0, t));
  return { x: CX - R * Math.cos(angle), y: CY - R * Math.sin(angle) };
}

const ARC_LENGTH = Math.PI * R;
const ARC_PATH = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/**
 * The night drawn as a horizon arc from bedtime to wake, with the moon travelling across it.
 * This is the product's signature visual and appears on the dashboard, timer and marketing site.
 */
export function NightArc({
  progress,
  fill,
  startLabel,
  endLabel,
  children,
  className,
  live = false,
  title,
}: NightArcProps) {
  const id = useId().replace(/:/g, '');
  const filled = fill ?? progress ?? 0;
  const moon = progress === null || progress === undefined ? null : pointAt(progress);

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full overflow-visible"
          role={title ? 'img' : undefined}
          aria-label={title}
          aria-hidden={title ? undefined : true}
        >
          <defs>
            <linearGradient id={`arc-${id}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="var(--color-secondary)" />
              <stop offset="0.55" stopColor="var(--color-primary)" />
              <stop offset="1" stopColor="var(--color-accent)" />
            </linearGradient>
            <radialGradient id={`moon-${id}`}>
              <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <line
            x1={CX - R - 12}
            x2={CX + R + 12}
            y1={CY}
            y2={CY}
            stroke="var(--hairline)"
            strokeWidth="1"
          />
          <path
            d={ARC_PATH}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={ARC_PATH}
            fill="none"
            stroke={`url(#arc-${id})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={ARC_LENGTH * (1 - Math.min(1, Math.max(0, filled)))}
            className="transition-[stroke-dashoffset] duration-700 ease-(--ease-out-soft)"
          />
          {moon && (
            <g
              className={
                live ? 'origin-center animate-breathe [transform-box:fill-box]' : undefined
              }
            >
              <circle cx={moon.x} cy={moon.y} r="16" fill={`url(#moon-${id})`} />
              <mask id={`crescent-${id}`}>
                <circle cx={moon.x} cy={moon.y} r="7" fill="white" />
                <circle cx={moon.x + 3} cy={moon.y - 2.4} r="5.6" fill="black" />
              </mask>
              <circle
                cx={moon.x}
                cy={moon.y}
                r="7"
                fill="var(--color-accent)"
                mask={`url(#crescent-${id})`}
              />
            </g>
          )}
        </svg>
        {children && (
          // Anchored to the arc, not the wrapper, so it always sits above the horizon line.
          <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center text-center">
            {children}
          </div>
        )}
      </div>
      {(startLabel !== undefined || endLabel !== undefined) && (
        <div className="tabular mt-1.5 flex justify-between px-[2%] text-xs text-base-content/65">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  );
}
