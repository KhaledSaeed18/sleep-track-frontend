'use client';

import Link from 'next/link';
import { SectionCard } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/states';
import { useFormatters } from '@/hooks/use-preferences';
import { clockDiff } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Goal, Overview } from '@/types/models';

function Row({
  label,
  actual,
  target,
  windowMinutes,
}: {
  label: string;
  actual: string | null;
  target: string;
  windowMinutes: number;
}) {
  const fmt = useFormatters();
  const diff = actual ? clockDiff(actual, target) : null;
  const within = diff !== null && Math.abs(diff) <= windowMinutes;
  // Position the average on a ±2h track around the target.
  const position = diff === null ? 50 : 50 + Math.max(-50, Math.min(50, (diff / 120) * 50));
  const band = (windowMinutes / 120) * 50;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-base-content/60">
          <span className="font-semibold text-base-content">{fmt.clock(actual)}</span> avg, goal{' '}
          {fmt.clock(target)}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-base-300/60" aria-hidden="true">
        <span
          className="absolute inset-y-0 rounded-full bg-primary/25"
          style={{ left: `${String(50 - band)}%`, width: `${String(band * 2)}%` }}
        />
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-base-content/40" />
        {diff !== null && (
          <span
            className={cn(
              'absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-base-100',
              within ? 'bg-primary' : 'bg-warning',
            )}
            style={{ left: `${String(position)}%` }}
          />
        )}
      </div>
      <p className="mt-1.5 text-xs text-base-content/55">
        {diff === null
          ? 'Not enough nights yet'
          : within
            ? 'Within your window'
            : `${formatDuration(Math.abs(diff))} ${diff < 0 ? 'earlier' : 'later'} than your goal`}
      </p>
    </div>
  );
}

export function ScheduleCard({
  overview,
  goal,
  className,
}: {
  overview: Overview | undefined;
  goal: Goal | undefined;
  className?: string;
}) {
  return (
    <SectionCard
      title="Schedule"
      description="Average times against your goal"
      className={className}
      action={
        <Link href="/goals" className="link text-sm text-base-content/60 link-hover">
          Edit goals
        </Link>
      }
    >
      {!overview || !goal ? (
        <div className="space-y-5">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <div className="space-y-6">
          <Row
            label="Bedtime"
            actual={overview.averages.bedtime}
            target={goal.target_bedtime}
            windowMinutes={goal.bedtime_window_minutes}
          />
          <Row
            label="Wake time"
            actual={overview.averages.wake_time}
            target={goal.target_wake_time}
            windowMinutes={goal.bedtime_window_minutes}
          />
        </div>
      )}
    </SectionCard>
  );
}
