'use client';

import type { ReactNode } from 'react';
import { DeltaBadge } from '@/components/ui/delta-badge';
import { Skeleton } from '@/components/ui/states';
import { computeDelta, formatDuration, formatNumber, formatSigned, type Delta } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Overview } from '@/types/models';

interface Tile {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  delta?: Delta | null;
  deltaFormat?: (value: number) => string;
}

export function StatTiles({
  tiles,
  className,
  loading = false,
}: {
  tiles: Tile[];
  className?: string;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        'surface stats w-full stats-vertical overflow-hidden rounded-box sm:stats-horizontal',
        className,
      )}
    >
      {tiles.map((tile) => (
        <div key={tile.label} className="stat min-w-0 gap-1 border-(--hairline) px-5 py-4">
          <div className="stat-title text-sm text-base-content/60">{tile.label}</div>
          <div className="stat-value text-[1.75rem] leading-tight font-semibold">
            {loading ? <Skeleton className="mt-1 h-8 w-24" /> : tile.value}
          </div>
          <div className="stat-desc flex items-center gap-2">
            {!loading && tile.delta && tile.deltaFormat && (
              <DeltaBadge delta={tile.delta} format={tile.deltaFormat} />
            )}
            {!loading && tile.hint && (
              <span className="truncate text-base-content/55">{tile.hint}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The four headline numbers shared by the dashboard and analytics pages. */
export function overviewTiles(overview: Overview | undefined, periodLabel: string): Tile[] {
  const prev = overview?.previous_period;
  const avg = overview?.averages;
  return [
    {
      label: 'Average sleep',
      value: formatDuration(avg?.duration_minutes),
      delta: computeDelta(avg?.duration_minutes, prev?.duration_minutes, { threshold: 2 }),
      deltaFormat: (v) => `${v > 0 ? '+' : '−'}${formatDuration(Math.abs(v))}`,
      hint: `${String(overview?.nights_tracked ?? 0)} nights, ${periodLabel}`,
    },
    {
      label: 'Sleep score',
      value: formatNumber(avg?.score),
      delta: computeDelta(avg?.score, prev?.score, { threshold: 0.5 }),
      deltaFormat: (v) => formatSigned(v),
      hint: 'out of 100',
    },
    {
      label: 'Consistency',
      value: formatNumber(overview?.consistency_score),
      delta: computeDelta(overview?.consistency_score, prev?.consistency_score, { threshold: 0.5 }),
      deltaFormat: (v) => formatSigned(v),
      hint: 'bedtime and wake regularity',
    },
    {
      label: 'Sleep debt',
      value: formatDuration(overview?.sleep_debt_minutes ?? null),
      hint: `short of your goal, last ${String(Math.min(14, overview?.range.days ?? 14))} nights`,
    },
  ];
}
