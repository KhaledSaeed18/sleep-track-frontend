'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { clockToNightMinutes, formatClock, formatLocalDate, minutesToClock } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import type { DailyPoint, TimeFormat } from '@/types/models';
import { TooltipCard } from './chart-tooltip';
import { CHART } from './theme';

interface SleepWindowChartProps {
  data: DailyPoint[];
  timeFormat: TimeFormat;
  goalWindow?: { bedtime: string; wake: string; windowMinutes: number } | null;
  height?: number;
}

const HOUR = 60;

/** Floating bars from bedtime to wake time per night on an evening-anchored clock axis. */
export default function SleepWindowChart({
  data,
  timeFormat,
  goalWindow,
  height = 280,
}: SleepWindowChartProps) {
  const rows = data.map((point) => {
    if (!point.bedtime || !point.wake_time)
      return { date: point.date, window: null as [number, number] | null, point };
    const start = clockToNightMinutes(point.bedtime);
    let end = clockToNightMinutes(point.wake_time);
    if (end <= start) end += 1440;
    return { date: point.date, window: [start, end] as [number, number], point };
  });
  const values = rows.flatMap((row) => row.window ?? []);
  const min = values.length ? Math.floor(Math.min(...values) / HOUR) * HOUR - HOUR : 21 * HOUR;
  const max = values.length ? Math.ceil(Math.max(...values) / HOUR) * HOUR + HOUR : 33 * HOUR;
  const ticks: number[] = [];
  for (let t = min; t <= max; t += 2 * HOUR) ticks.push(t);
  const label = (minutes: number) => formatClock(minutesToClock(minutes), timeFormat);

  const bedTarget = goalWindow ? clockToNightMinutes(goalWindow.bedtime) : null;
  const count = data.length;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ ...CHART.margin, left: 4 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        {bedTarget !== null && goalWindow && (
          <ReferenceArea
            y1={bedTarget - goalWindow.windowMinutes}
            y2={bedTarget + goalWindow.windowMinutes}
            fill="var(--chart-2)"
            fillOpacity={0.1}
            stroke="none"
          />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => formatLocalDate(value, count > 45 ? 'MMM' : 'MMM d')}
          tick={CHART.tick}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={[min, max]}
          ticks={ticks}
          reversed
          tickFormatter={label}
          tick={CHART.tick}
          axisLine={false}
          tickLine={false}
          width={timeFormat === '12h' ? 64 : 48}
        />
        <Tooltip
          cursor={{ fill: 'var(--chart-grid)' }}
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as (typeof rows)[number] | undefined;
            if (!active || !row) return null;
            return (
              <TooltipCard
                title={formatLocalDate(row.date, 'EEE, MMM d')}
                rows={
                  row.window
                    ? [
                        { label: 'In bed', value: formatClock(row.point.bedtime, timeFormat) },
                        { label: 'Up', value: formatClock(row.point.wake_time, timeFormat) },
                        { label: 'Asleep', value: formatDuration(row.point.duration_minutes) },
                      ]
                    : [{ label: 'Status', value: 'Not logged' }]
                }
              />
            );
          }}
        />
        <Bar
          dataKey="window"
          fill={CHART.series[1]}
          radius={4}
          maxBarSize={CHART.maxBarSize}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
