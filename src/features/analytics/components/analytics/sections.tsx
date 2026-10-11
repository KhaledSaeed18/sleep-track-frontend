'use client';

import { useState } from 'react';
import { ChartCard, DataTable } from '@/components/charts/chart-card';
import {
  CategoryBarChart,
  ChartSkeleton,
  ImpactChart,
  SleepWindowChart,
} from '@/components/charts';
import { SectionCard } from '@/components/ui/page-header';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useGoal } from '@/features/goals/hooks';
import { TagChip } from '@/features/tags/components/tag-chip';
import { useFormatters } from '@/hooks/use-preferences';
import { WEEKDAY_LABELS, WEEKDAY_NAMES, formatLocalDate, orderedWeekdays } from '@/lib/date';
import { formatDuration, formatSigned } from '@/lib/format';
import type { DateRange } from '@/lib/query-keys';
import { Tags } from 'lucide-react';
import { useDaily, useDistribution, useTagImpact, useWeekday } from '../../hooks';
import { lastNDays } from '../../lib/ranges';
import { CalendarHeatmap } from './calendar-heatmap';

const hours = (v: number) => `${String(Math.round(v * 10) / 10)}h`;

export function SleepWindowSection({ range }: { range: DateRange }) {
  const fmt = useFormatters();
  const daily = useDaily(range);
  const goal = useGoal();
  const points = daily.data ?? [];
  return (
    <ChartCard
      title="When you sleep"
      description="Each bar runs from bedtime to wake time. The shaded band is your bedtime window."
      summary={`Bedtime and wake time for ${String(points.filter((p) => p.bedtime).length)} nights.`}
      chart={
        daily.isError ? (
          <ErrorState compact error={daily.error} onRetry={() => void daily.refetch()} />
        ) : daily.isPending ? (
          <ChartSkeleton height={280} />
        ) : (
          <SleepWindowChart
            data={points}
            timeFormat={fmt.timeFormat}
            goalWindow={
              goal.data
                ? {
                    bedtime: goal.data.target_bedtime,
                    wake: goal.data.target_wake_time,
                    windowMinutes: goal.data.bedtime_window_minutes,
                  }
                : null
            }
          />
        )
      }
      table={
        <DataTable
          columns={['Night', 'In bed', 'Up', 'Asleep']}
          rows={points
            .filter((p) => p.bedtime)
            .map((p) => [
              formatLocalDate(p.date, 'EEE, MMM d'),
              fmt.clock(p.bedtime),
              fmt.clock(p.wake_time),
              formatDuration(p.duration_minutes),
            ])}
        />
      }
    />
  );
}

export function WeekdaySection({ range }: { range: DateRange }) {
  const fmt = useFormatters();
  const weekday = useWeekday(range);
  const order = orderedWeekdays(fmt.weekStartsOn);
  const rows = order
    .map((index) => weekday.data?.find((w) => w.weekday === index))
    .filter((w) => w !== undefined);
  const data = rows.map((w) => ({
    key: String(w.weekday),
    label: WEEKDAY_LABELS[w.weekday] ?? '',
    value: w.avg_duration_minutes === null ? null : w.avg_duration_minutes / 60,
    detail: `${String(w.nights)} nights`,
  }));
  const best = [...rows].sort(
    (a, b) => (b.avg_duration_minutes ?? 0) - (a.avg_duration_minutes ?? 0),
  )[0];
  const worst = [...rows]
    .filter((w) => w.avg_duration_minutes !== null)
    .sort((a, b) => (a.avg_duration_minutes ?? 0) - (b.avg_duration_minutes ?? 0))[0];

  return (
    <ChartCard
      title="Weekday patterns"
      description="Average sleep by the night it began"
      summary={
        best && worst
          ? `You sleep longest on ${WEEKDAY_NAMES[best.weekday] ?? ''} nights and least on ${WEEKDAY_NAMES[worst.weekday] ?? ''} nights.`
          : 'Average sleep by weekday.'
      }
      chart={
        weekday.isPending ? (
          <ChartSkeleton height={220} />
        ) : weekday.isError ? (
          <ErrorState compact error={weekday.error} />
        ) : (
          <CategoryBarChart data={data} format={hours} valueLabel="Average sleep" />
        )
      }
      table={
        <DataTable
          columns={['Night', 'Nights', 'Asleep', 'Quality', 'In bed', 'Up']}
          rows={rows.map((w) => [
            WEEKDAY_NAMES[w.weekday] ?? '',
            w.nights,
            formatDuration(w.avg_duration_minutes),
            w.avg_quality ?? '—',
            fmt.clock(w.avg_bedtime),
            fmt.clock(w.avg_wake_time),
          ])}
        />
      }
      footer={
        best && worst && best !== worst ? (
          <p className="text-sm text-base-content/65">
            Longest on <strong className="text-base-content">{WEEKDAY_NAMES[best.weekday]}</strong>{' '}
            ({formatDuration(best.avg_duration_minutes)}), shortest on{' '}
            <strong className="text-base-content">{WEEKDAY_NAMES[worst.weekday]}</strong> (
            {formatDuration(worst.avg_duration_minutes)}).
          </p>
        ) : undefined
      }
    />
  );
}

const DIST_VIEWS = [
  { value: 'duration', label: 'Duration' },
  { value: 'quality', label: 'Quality' },
  { value: 'bedtime', label: 'Bedtime' },
] as const;

export function DistributionSection({ range }: { range: DateRange }) {
  const fmt = useFormatters();
  const [view, setView] = useState<(typeof DIST_VIEWS)[number]['value']>('duration');
  const dist = useDistribution(range);
  const d = dist.data;

  const data =
    view === 'duration'
      ? (d?.duration ?? []).map((b) => ({ key: b.bucket, label: b.bucket, value: b.count }))
      : view === 'quality'
        ? (d?.quality ?? []).map((q) => ({
            key: String(q.rating),
            label: `${String(q.rating)}★`,
            value: q.count,
          }))
        : (() => {
            const bins = d?.bedtime ?? [];
            // Show the evening-to-morning span where bedtimes actually fall.
            const ordered = [
              ...bins.filter((b) => b.hour >= 18),
              ...bins.filter((b) => b.hour < 6),
            ];
            return ordered.map((b) => ({
              key: String(b.hour),
              label: fmt.clock(`${String(b.hour).padStart(2, '0')}:00`).replace(':00', ''),
              value: b.count,
            }));
          })();

  return (
    <ChartCard
      title="Distribution"
      description={
        view === 'duration'
          ? 'How long your nights usually are'
          : view === 'quality'
            ? 'How you rate your nights'
            : 'When you usually go to bed'
      }
      action={
        <Segmented
          label="Distribution"
          value={view}
          onChange={setView}
          options={DIST_VIEWS}
          size="xs"
        />
      }
      summary={`Number of nights per ${view === 'duration' ? 'duration bucket' : view === 'quality' ? 'quality rating' : 'bedtime hour'}.`}
      chart={
        dist.isPending ? (
          <ChartSkeleton height={220} />
        ) : dist.isError ? (
          <ErrorState compact error={dist.error} />
        ) : (
          <CategoryBarChart
            data={data}
            format={(v) => String(v)}
            valueLabel="Nights"
            series={view === 'bedtime' ? 1 : 0}
          />
        )
      }
      table={
        <DataTable
          columns={['Group', 'Nights']}
          rows={data.map((item) => [item.label, item.value])}
        />
      }
    />
  );
}

export function TagImpactSection({ range, className }: { range: DateRange; className?: string }) {
  const impact = useTagImpact(range);
  const rows = (impact.data ?? []).filter(
    (item) => item.quality_impact !== null && item.nights_with >= 2,
  );
  const data = rows
    .slice(0, 10)
    .map((item) => ({
      label: item.tag.name,
      value: item.quality_impact ?? 0,
      detail: `${String(item.nights_with)} with the tag`,
    }));

  if (impact.isPending)
    return (
      <SectionCard title="Tag impact" className={className}>
        <Skeleton className="h-60" />
      </SectionCard>
    );
  if (!rows.length) {
    return (
      <SectionCard title="Tag impact" className={className}>
        <EmptyState
          compact
          icon={Tags}
          title="No tag patterns yet"
          description="Tag a few nights with things like caffeine or exercise to see how they relate to your sleep."
        />
      </SectionCard>
    );
  }

  return (
    <ChartCard
      className={className}
      title="Tag impact"
      description="Change in quality on nights with each tag, compared with nights without it"
      summary={`Quality impact for ${String(data.length)} tags.`}
      chart={
        <ImpactChart data={data} format={(v) => formatSigned(v, 1)} valueLabel="Quality change" />
      }
      table={
        <DataTable
          columns={['Tag', 'Nights', 'Quality with', 'Without', 'Duration change']}
          rows={rows.map((item) => [
            item.tag.name,
            item.nights_with,
            item.avg_quality_with ?? '—',
            item.avg_quality_without ?? '—',
            item.duration_impact_minutes === null
              ? '—'
              : formatSigned(item.duration_impact_minutes, 0, 'm'),
          ])}
        />
      }
      footer={
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {rows.slice(0, 3).map((item) => (
            <span key={item.tag.id} className="flex items-center gap-2 text-base-content/70">
              <TagChip tag={item.tag} size="xs" />
              {item.duration_impact_minutes === null
                ? 'no duration change'
                : `${formatSigned(item.duration_impact_minutes, 0, 'm')} sleep`}
            </span>
          ))}
        </div>
      }
    />
  );
}

export function YearHeatmapSection() {
  const fmt = useFormatters();
  const range = lastNDays(365, fmt.today());
  const daily = useDaily(range);
  return (
    <SectionCard
      title="Your year in nights"
      description="Nightly sleep score over the last 12 months"
    >
      {daily.isPending ? (
        <Skeleton className="h-32" />
      ) : daily.isError ? (
        <ErrorState compact error={daily.error} />
      ) : (
        <CalendarHeatmap data={daily.data} weekStart={fmt.weekStartsOn} />
      )}
    </SectionCard>
  );
}
