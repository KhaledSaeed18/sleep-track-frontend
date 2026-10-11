'use client';

import { ChevronLeft, ChevronRight, Mail, Printer, ThumbsDown, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import { ChartCard, DataTable } from '@/components/charts/chart-card';
import { ChartSkeleton, TrendChart } from '@/components/charts';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { overviewTiles, StatTiles } from '@/features/analytics/components/stat-tiles';
import { useGoal } from '@/features/goals/hooks';
import { InsightCard } from '@/features/insights/components/insight-card';
import { useUser } from '@/features/auth';
import { useFormatters } from '@/hooks/use-preferences';
import { formatLocalDate, shiftLocalDate, startOfWeekFor } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import type { SleepSession } from '@/types/models';
import { useEmailReport, useWeeklyReport } from '../hooks';

function NightCard({
  title,
  icon: Icon,
  session,
  tone,
}: {
  title: string;
  icon: typeof ThumbsUp;
  session: SleepSession | null;
  tone: string;
}) {
  const fmt = useFormatters();
  return (
    <section className="surface p-5">
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${tone}`} aria-hidden="true" />
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {session ? (
        <Link href={`/journal/${session.id}`} className="mt-3 block">
          <p className="text-sm text-base-content/65">
            {fmt.localDate(session.night_of, 'EEEE, MMMM d')}
          </p>
          <p className="mt-1 text-3xl font-semibold">{formatDuration(session.duration_minutes)}</p>
          <p className="mt-1 text-sm text-base-content/60">
            Score {session.score ?? '—'}, {fmt.time(session.started_at)} to{' '}
            {session.ended_at ? fmt.time(session.ended_at) : '—'}
          </p>
        </Link>
      ) : (
        <p className="mt-3 text-sm text-base-content/60">Not enough nights this week.</p>
      )}
    </section>
  );
}

export function WeeklyReportView() {
  const fmt = useFormatters();
  const user = useUser();
  const goal = useGoal();
  const defaultWeek = shiftLocalDate(startOfWeekFor(fmt.today(), fmt.weekStartsOn), -7);
  const [week, setWeek] = useQueryState(
    'week',
    parseAsString
      .withDefault(defaultWeek)
      .withOptions({ history: 'replace', clearOnDefault: true }),
  );
  const weekStart = startOfWeekFor(week, fmt.weekStartsOn);
  const report = useWeeklyReport(weekStart);
  const email = useEmailReport();
  const latest = weekStart >= defaultWeek;
  const r = report.data;

  const title = `${formatLocalDate(weekStart, 'MMM d')} – ${formatLocalDate(shiftLocalDate(weekStart, 6), 'MMM d, yyyy')}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly report"
        description={`Week of ${title}`}
        actions={
          <div className="no-print flex flex-wrap items-center gap-2">
            <div className="join">
              <button
                type="button"
                className="btn join-item btn-sm"
                aria-label="Previous week"
                onClick={() => void setWeek(shiftLocalDate(weekStart, -7))}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <input
                type="date"
                className="input join-item w-40 input-sm"
                aria-label="Pick a day in the week"
                value={weekStart}
                max={defaultWeek}
                onChange={(event) => event.target.value && void setWeek(event.target.value)}
              />
              <button
                type="button"
                className="btn join-item btn-sm"
                aria-label="Next week"
                disabled={latest}
                onClick={() => void setWeek(shiftLocalDate(weekStart, 7))}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" /> Print
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => email.mutate(weekStart)}
              disabled={email.isPending}
            >
              {email.isPending ? (
                <span className="loading loading-xs loading-spinner" aria-hidden="true" />
              ) : (
                <Mail className="size-4" aria-hidden="true" />
              )}
              Email me this report
            </button>
          </div>
        }
      />
      <p className="hidden text-sm text-base-content/60 print:block">
        Prepared for {user.full_name}. Times in {fmt.zone.replace(/_/g, ' ')}.
      </p>

      {report.isError ? (
        <ErrorState
          className="surface"
          error={report.error}
          onRetry={() => void report.refetch()}
        />
      ) : (
        <>
          <StatTiles tiles={overviewTiles(r?.overview, 'this week')} loading={report.isPending} />

          <div className="grid gap-6 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Night by night"
              description="Hours asleep against your goal"
              summary={`Sleep duration for each night of the week of ${title}.`}
              chart={
                !r ? (
                  <ChartSkeleton height={220} />
                ) : (
                  <TrendChart
                    data={r.daily.map((d) => ({
                      date: d.date,
                      value: d.duration_minutes === null ? null : d.duration_minutes / 60,
                    }))}
                    kind="bar"
                    format={(v) => `${String(Math.round(v * 10) / 10)}h`}
                    valueLabel="Asleep"
                    height={220}
                    goal={
                      goal.data
                        ? { value: goal.data.target_duration_minutes / 60, label: 'Goal' }
                        : null
                    }
                  />
                )
              }
              table={
                r && (
                  <DataTable
                    columns={['Night', 'Asleep', 'Score', 'Quality', 'In bed', 'Up']}
                    rows={r.daily.map((d) => [
                      formatLocalDate(d.date, 'EEE, MMM d'),
                      formatDuration(d.duration_minutes),
                      d.score ?? '—',
                      d.quality ?? '—',
                      fmt.clock(d.bedtime),
                      fmt.clock(d.wake_time),
                    ])}
                  />
                )
              }
            />
            <div className="grid gap-6">
              {r ? (
                <>
                  <NightCard
                    title="Best night"
                    icon={ThumbsUp}
                    session={r.best_night}
                    tone="text-success"
                  />
                  <NightCard
                    title="Toughest night"
                    icon={ThumbsDown}
                    session={r.worst_night}
                    tone="text-warning"
                  />
                </>
              ) : (
                <>
                  <Skeleton className="h-36" />
                  <Skeleton className="h-36" />
                </>
              )}
            </div>
          </div>

          <section aria-labelledby="report-insights">
            <h2 id="report-insights" className="mb-3 text-lg font-semibold">
              What stood out
            </h2>
            {r ? (
              r.insights.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {r.insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-base-content/60">
                  Nothing notable this week. Log a few more nights for sharper insights.
                </p>
              )
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
