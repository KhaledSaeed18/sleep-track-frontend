'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatLocalDate } from '@/lib/date';
import { CHART } from './theme';
import { TooltipCard } from './chart-tooltip';

export interface TrendPoint {
  date: string;
  value: number | null;
}

interface TrendChartProps {
  data: TrendPoint[];
  kind: 'bar' | 'line';
  /** Formats values for the axis and tooltip. */
  format: (value: number) => string;
  valueLabel: string;
  goal?: { value: number; label: string } | null;
  domain?: [number | 'auto', number | 'auto'];
  height?: number;
  ticks?: number[];
}

function dateTick(value: string, count: number) {
  return formatLocalDate(value, count > 45 ? 'MMM' : 'MMM d');
}

export default function TrendChart({
  data,
  kind,
  format,
  valueLabel,
  goal,
  domain = [0, 'auto'],
  height = 240,
  ticks,
}: TrendChartProps) {
  const count = data.length;
  const interval = count <= 10 ? 0 : 'preserveStartEnd';
  const common = (
    <>
      <CartesianGrid vertical={false} stroke={CHART.grid} />
      <XAxis
        dataKey="date"
        tickFormatter={(value: string) => dateTick(value, count)}
        tick={CHART.tick}
        axisLine={false}
        tickLine={false}
        interval={interval}
        minTickGap={24}
      />
      <YAxis
        tickFormatter={format}
        tick={CHART.tick}
        axisLine={false}
        tickLine={false}
        width={44}
        domain={domain}
        ticks={ticks}
        allowDecimals={false}
      />
      <Tooltip
        cursor={
          kind === 'bar' ? { fill: 'var(--chart-grid)' } : { stroke: CHART.axis, strokeWidth: 1 }
        }
        content={({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          const raw = payload[0]?.value;
          return (
            <TooltipCard
              title={formatLocalDate(String(label), 'EEE, MMM d')}
              rows={[
                {
                  label: valueLabel,
                  value: typeof raw === 'number' ? format(raw) : 'Not logged',
                  color: CHART.series[0],
                },
              ]}
            />
          );
        }}
      />
      {goal && (
        <ReferenceLine
          y={goal.value}
          stroke="var(--color-base-content)"
          strokeOpacity={0.55}
          strokeWidth={1.5}
          ifOverflow="extendDomain"
          aria-label={goal.label}
        />
      )}
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      {kind === 'bar' ? (
        <BarChart data={data} margin={CHART.margin} barCategoryGap="22%">
          {common}
          <Bar
            dataKey="value"
            fill={CHART.series[0]}
            radius={CHART.barRadius}
            maxBarSize={CHART.maxBarSize}
            isAnimationActive={false}
          />
        </BarChart>
      ) : (
        <LineChart data={data} margin={CHART.margin}>
          {common}
          <Line
            dataKey="value"
            type="monotone"
            stroke={CHART.series[0]}
            strokeWidth={2}
            dot={
              count <= 31
                ? { r: 3, strokeWidth: 2, stroke: CHART.surface, fill: CHART.series[0] }
                : false
            }
            activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.surface }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
