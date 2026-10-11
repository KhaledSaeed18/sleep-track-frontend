'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TooltipCard } from './chart-tooltip';
import { CHART } from './theme';

export interface ImpactDatum {
  label: string;
  value: number;
  detail: string;
}

/** Diverging horizontal bars around zero: cool for positive impact, warm for negative. */
export default function ImpactChart({
  data,
  format,
  valueLabel,
}: {
  data: ImpactDatum[];
  format: (value: number) => string;
  valueLabel: string;
}) {
  const extent = Math.max(0.5, ...data.map((d) => Math.abs(d.value)));
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34 + 32)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
        barCategoryGap="30%"
      >
        <CartesianGrid horizontal={false} stroke={CHART.grid} />
        <XAxis
          type="number"
          domain={[-extent, extent]}
          tickFormatter={format}
          tick={CHART.tick}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ ...CHART.tick, fill: 'var(--color-base-content)' }}
          axisLine={false}
          tickLine={false}
          width={96}
        />
        <ReferenceLine x={0} stroke={CHART.axis} strokeWidth={1} />
        <Tooltip
          cursor={{ fill: 'var(--chart-grid)' }}
          content={({ active, payload }) => {
            const datum = payload?.[0]?.payload as ImpactDatum | undefined;
            if (!active || !datum) return null;
            return (
              <TooltipCard
                title={datum.label}
                rows={[
                  { label: valueLabel, value: format(datum.value) },
                  { label: 'Nights', value: datum.detail },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="value" radius={4} maxBarSize={18} isAnimationActive={false}>
          {data.map((datum) => (
            <Cell key={datum.label} fill={datum.value >= 0 ? CHART.series[0] : CHART.series[2]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
