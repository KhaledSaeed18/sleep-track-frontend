'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatLocalDate } from '@/lib/date';
import { TooltipCard } from './chart-tooltip';
import { CHART } from './theme';

export default function SimpleAreaChart({
  data,
  valueLabel,
  height = 220,
}: {
  data: { date: string; value: number }[];
  valueLabel: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={CHART.margin}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => formatLocalDate(value, 'MMM d')}
          tick={CHART.tick}
          axisLine={false}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis
          tick={CHART.tick}
          axisLine={false}
          tickLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipCard
                title={formatLocalDate(String(label), 'EEE, MMM d')}
                rows={[
                  {
                    label: valueLabel,
                    value: String(payload[0]?.value ?? 0),
                    color: CHART.series[1],
                  },
                ]}
              />
            ) : null
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke={CHART.series[1]}
          strokeWidth={2}
          fill={CHART.series[1]}
          fillOpacity={0.1}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
