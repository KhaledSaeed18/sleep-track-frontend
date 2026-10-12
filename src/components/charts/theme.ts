export const CHART = {
  series: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'] as const,
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
  surface: 'var(--chart-surface)',
  barRadius: [4, 4, 0, 0] as [number, number, number, number],
  maxBarSize: 24,
  tick: { fill: 'var(--chart-axis)', fontSize: 12 },
  margin: { top: 8, right: 8, bottom: 0, left: -8 },
};
