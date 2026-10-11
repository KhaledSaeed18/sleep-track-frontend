import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8', className)}>
      <defs>
        <linearGradient id="st-mark" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#st-mark)" opacity="0.16" />
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8.5"
        fill="none"
        stroke="url(#st-mark)"
        strokeOpacity="0.5"
      />
      <path d="M19.6 7.4a9 9 0 1 0 5 12.9 7.2 7.2 0 0 1-5-12.9Z" fill="url(#st-mark)" />
      <circle cx="23.5" cy="9.5" r="1.3" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[1.3rem] leading-none font-semibold tracking-tight">
          SleepTrack
        </span>
      )}
    </span>
  );
}
