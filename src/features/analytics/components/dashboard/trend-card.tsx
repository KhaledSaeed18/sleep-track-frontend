'use client';

import { useState } from 'react';
import { ChartCard, DataTable } from '@/components/charts/chart-card';
import { ChartSkeleton, TrendChart } from '@/components/charts';
import { Segmented } from '@/components/ui/segmented';
import { ErrorState } from '@/components/ui/states';
import { useGoal } from '@/features/goals/hooks';
import { formatLocalDate } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import type { DateRange } from '@/lib/query-keys';
import { useDaily } from '../../hooks';

const METRICS = [
  { value: 'duration', label: 'Duration' },
  { value: 'score', label: 'Score' },
  { value: 'quality', label: 'Quality' },
] as const;

type Metric = (typeof METRICS)[number]['value'];

export function TrendCard({
  range,
  title = 'Last 30 nights',
  className,
}: {
  range: DateRange;
  title?: string;
  className?: string;
}) {
  const [metric, setMetric] = useState<Metric>('duration');
  const daily = useDaily(range);
  const goal = useGoal();

  const points = daily.data ?? [];
  const data = points.map((point) => ({
    date: point.date,
    value:
      metric === 'duration'
        ? point.duration_minutes === null
          ? null
          : point.duration_minutes / 60
        : metric === 'score'
          ? point.score
          : point.quality,
  }));

  const format =
    metric === 'duration'
      ? (v: number) => `${String(Math.round(v * 10) / 10)}h`
      : metric === 'score'
        ? (v: number) => String(Math.round(v))
        : (v: number) => v.toFixed(1);
  const tracked = data.filter((d) => d.value !== null).length;

  return (
    <ChartCard
      className={className}
      title={title}
      description={
        metric === 'duration'
          ? `Hours asleep each night. The line marks your ${formatDuration(goal.data?.target_duration_minutes ?? 480)} goal.`
          : metric === 'score'
            ? 'Nightly sleep score, 0 to 100'
            : 'Self-rated quality, 1 to 5'
      }
      action={
        <Segmented label="Metric" value={metric} onChange={setMetric} options={METRICS} size="xs" />
      }
      summary={`${METRICS.find((m) => m.value === metric)?.label ?? ''} per night for ${String(data.length)} days, ${String(tracked)} nights logged.`}
      chart={
        daily.isError ? (
          <ErrorState compact error={daily.error} onRetry={() => void daily.refetch()} />
        ) : daily.isPending ? (
          <ChartSkeleton />
        ) : (
          <TrendChart
            data={data}
            kind={metric === 'duration' ? 'bar' : 'line'}
            format={format}
            valueLabel={METRICS.find((m) => m.value === metric)?.label ?? ''}
            goal={
              metric === 'duration' && goal.data
                ? {
                    value: goal.data.target_duration_minutes / 60,
                    label: `Goal ${formatDuration(goal.data.target_duration_minutes)}`,
                  }
                : null
            }
            domain={metric === 'quality' ? [1, 5] : metric === 'score' ? [0, 100] : [0, 'auto']}
            ticks={metric === 'quality' ? [1, 2, 3, 4, 5] : undefined}
          />
        )
      }
      table={
        <DataTable
          columns={['Night', 'Asleep', 'Score', 'Quality']}
          rows={points.map((p) => [
            formatLocalDate(p.date, 'EEE, MMM d'),
            formatDuration(p.duration_minutes),
            p.score ?? '—',
            p.quality ?? '—',
          ])}
        />
      }
    />
  );
}
