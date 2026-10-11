'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TooltipCard } from './chart-tooltip';
import { CHART } from './theme';

export interface CategoryDatum {
  key: string;
  label: string;
  value: number | null;
  detail?: string;
}

interface CategoryBarChartProps {
  data: CategoryDatum[];
  format: (value: number) => string;
  valueLabel: string;
  height?: number;
  series?: 0 | 1 | 2;
  domain?: [number | 'auto', number | 'auto'];
}

/** Single-series columns over ordered categories (weekdays, buckets, ratings). */
export default function CategoryBarChart({
  data,
  format,
  valueLabel,
  height = 220,
  series = 0,
  domain = [0, 'auto'],
}: CategoryBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={CHART.margin} barCategoryGap="24%">
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" tick={CHART.tick} axisLine={false} tickLine={false} interval={0} />
        <YAxis
          tickFormatter={format}
          tick={CHART.tick}
          axisLine={false}
          tickLine={false}
          width={44}
          domain={domain}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'var(--chart-grid)' }}
          content={({ active, payload }) => {
            const datum = payload?.[0]?.payload as CategoryDatum | undefined;
            if (!active || !datum) return null;
            return (
              <TooltipCard
                title={datum.label}
                rows={[
                  {
                    label: valueLabel,
                    value: datum.value === null ? 'No data' : format(datum.value),
                    color: CHART.series[series],
                  },
                  ...(datum.detail ? [{ label: 'Based on', value: datum.detail }] : []),
                ]}
              />
            );
          }}
        />
        <Bar
          dataKey="value"
          fill={CHART.series[series]}
          radius={CHART.barRadius}
          maxBarSize={CHART.maxBarSize + 16}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
