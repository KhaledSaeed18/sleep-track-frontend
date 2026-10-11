'use client';

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { CHART } from './theme';

export default function Sparkline({
  data,
  height = 36,
}: {
  data: (number | null)[];
  height?: number;
}) {
  const points = data.map((value, index) => ({ index, value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line
          dataKey="value"
          type="monotone"
          stroke={CHART.series[0]}
          strokeWidth={2}
          dot={false}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
