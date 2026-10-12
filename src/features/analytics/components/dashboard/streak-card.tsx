'use client';

import { Flame } from 'lucide-react';
import { SectionCard } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/states';
import { formatLocalDate } from '@/lib/date';
import { formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DailyPoint, Overview } from '@/types/models';

interface StreakCardProps {
  overview: Overview | undefined;
  lastWeek: DailyPoint[] | undefined;
  goalMinutes: number;
  className?: string;
}

export function StreakCard({ overview, lastWeek, goalMinutes, className }: StreakCardProps) {
  const loading = !overview;
  return (
    <SectionCard
      title="Streak"
      description="Nights in a row that met your goal"
      className={className}
    >
      {loading ? (
        <Skeleton className="h-28" />
      ) : (
        <div className="space-y-5">
          <div className="flex items-end gap-3">
            <Flame
              className={cn(
                'mb-1.5 size-7',
                overview.current_streak > 0 ? 'text-accent' : 'text-base-content/30',
              )}
              aria-hidden="true"
            />
            <p className="text-5xl leading-none font-semibold">{overview.current_streak}</p>
            <p className="mb-1 text-sm text-base-content/60">
              {overview.current_streak === 1 ? 'night' : 'nights'}
            </p>
          </div>
          <ol className="flex justify-between gap-1" aria-label="Last 7 nights against your goal">
            {(lastWeek ?? []).map((day) => {
              const met = day.duration_minutes !== null && day.duration_minutes >= goalMinutes - 15;
              const logged = day.duration_minutes !== null;
              return (
                <li key={day.date} className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full text-[0.65rem] font-semibold',
                      met
                        ? 'bg-primary text-primary-content'
                        : logged
                          ? 'bg-base-300 text-base-content/70'
                          : 'border border-dashed border-(--hairline)',
                    )}
                    title={`${formatLocalDate(day.date, 'EEE, MMM d')}: ${met ? 'goal met' : logged ? 'below goal' : 'not logged'}`}
                  >
                    {met ? '✓' : ''}
                    <span className="sr-only">{`${formatLocalDate(day.date, 'EEEE')}: ${met ? 'goal met' : logged ? 'below goal' : 'not logged'}`}</span>
                  </span>
                  <span className="text-[0.65rem] text-base-content/50" aria-hidden="true">
                    {formatLocalDate(day.date, 'EEEEE')}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="flex justify-between text-sm text-base-content/65">
            <span>
              Best: <strong className="text-base-content">{overview.longest_streak}</strong>
            </span>
            <span>
              Goal met{' '}
              <strong className="text-base-content">
                {formatPercent(overview.goal_attainment_rate)}
              </strong>{' '}
              of nights
            </span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
