'use client';

import { BedDouble, Clock, MoonStar, Repeat2, Smile } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { NightArc } from '@/components/brand/night-arc';
import { ScoreRing } from '@/components/ui/score-ring';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { Rating } from '@/components/ui/rating';
import { useGoal } from '@/features/goals/hooks';
import { useRecentSessions } from '@/features/sessions/hooks';
import { TagChip } from '@/features/tags/components/tag-chip';
import { useFormatters } from '@/hooks/use-preferences';
import { clockDiff, daysBetween, formatInZone } from '@/lib/date';
import { MOOD_LABELS, formatDuration, scoreLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-base-content/45" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-base-content/55">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function offsetLabel(diff: number, early: string, late: string) {
  if (Math.abs(diff) < 5) return 'on target';
  return `${formatDuration(Math.abs(diff))} ${diff < 0 ? early : late}`;
}

export function LastNightCard({ className }: { className?: string }) {
  const fmt = useFormatters();
  const { data, isPending, isError, error, refetch } = useRecentSessions(1);
  const goal = useGoal();
  const openEditor = useUiStore((state) => state.openSessionEditor);
  const session = data?.items[0];

  if (isPending) {
    return (
      <section className={cn('surface p-6', className)} aria-busy="true">
        <Skeleton className="mb-6 h-4 w-32" />
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <Skeleton className="h-44" />
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      </section>
    );
  }

  if (isError)
    return (
      <ErrorState
        className={cn('surface', className)}
        error={error}
        onRetry={() => void refetch()}
      />
    );

  if (!session?.ended_at) {
    return (
      <section className={cn('surface', className)}>
        <EmptyState
          icon={MoonStar}
          title="Your first night goes here"
          description="Log last night, or start the sleep timer before bed. Your score and trends appear right after."
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openEditor({ mode: 'create' })}
            >
              Log last night
            </button>
          }
        />
      </section>
    );
  }

  const age = daysBetween(session.night_of, fmt.today());
  const heading = age <= 1 ? 'Last night' : 'Most recent night';
  const bedClock = formatInZone(session.started_at, fmt.zone, 'HH:mm');
  const wakeClock = formatInZone(session.ended_at, fmt.zone, 'HH:mm');
  const bedDiff = goal.data ? clockDiff(bedClock, goal.data.target_bedtime) : null;
  const wakeDiff = goal.data ? clockDiff(wakeClock, goal.data.target_wake_time) : null;
  const target = goal.data?.target_duration_minutes ?? 480;
  const durationDiff = (session.duration_minutes ?? 0) - target;

  return (
    <section
      className={cn('surface glow-ring relative overflow-hidden', className)}
      aria-labelledby="last-night-title"
    >
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <div>
          <h2 id="last-night-title" className="text-base font-semibold">
            {heading}
          </h2>
          <p className="text-sm text-base-content/55">
            Night of {fmt.localDate(session.night_of, 'EEEE, MMMM d')}
          </p>
        </div>
        <Link
          href={`/journal/${session.id}`}
          className="link text-sm text-base-content/60 link-hover"
        >
          View details
        </Link>
      </div>
      <div className="grid gap-6 p-6 pt-4 md:grid-cols-[1.25fr_1fr] md:items-center">
        <div className="sky-gradient rounded-box border border-(--hairline) px-5 pt-5 pb-3">
          <NightArc
            progress={1}
            fill={Math.min(1, (session.duration_minutes ?? 0) / target)}
            startLabel={`In bed ${fmt.time(session.started_at)}`}
            endLabel={`Up ${fmt.time(session.ended_at)}`}
            className="mx-auto max-w-sm"
            title={`Slept ${formatDuration(session.duration_minutes)} from ${fmt.time(session.started_at)} to ${fmt.time(session.ended_at)}`}
          >
            <span className="text-5xl font-semibold tracking-tight">
              {formatDuration(session.duration_minutes)}
            </span>
            <span
              className={cn(
                'mt-1 text-xs font-medium',
                durationDiff >= -15 ? 'text-success' : 'text-base-content/60',
              )}
            >
              {durationDiff >= -15
                ? 'Goal met'
                : `${formatDuration(-durationDiff)} under your goal`}
            </span>
          </NightArc>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <ScoreRing value={session.score} size="5.25rem" thickness="0.45rem">
              <span className="text-2xl font-semibold">{session.score ?? '—'}</span>
            </ScoreRing>
            <div>
              <p className="text-xs text-base-content/55">Sleep score</p>
              <p className="text-lg font-semibold">{scoreLabel(session.score)}</p>
              <Rating value={session.quality} label="Quality" size="xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Detail
              icon={BedDouble}
              label="Bedtime vs goal"
              value={bedDiff === null ? '—' : offsetLabel(bedDiff, 'early', 'late')}
            />
            <Detail
              icon={Clock}
              label="Wake vs goal"
              value={wakeDiff === null ? '—' : offsetLabel(wakeDiff, 'early', 'late')}
            />
            <Detail
              icon={Repeat2}
              label="Woke up"
              value={session.awakenings === null ? '—' : `${String(session.awakenings)} times`}
            />
            <Detail
              icon={Smile}
              label="Mood"
              value={session.mood_on_wake ? MOOD_LABELS[session.mood_on_wake] : '—'}
            />
          </div>
          {session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {session.tags.map((tag) => (
                <TagChip key={tag.id} tag={tag} size="xs" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
