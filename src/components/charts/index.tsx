'use client';

import dynamic from 'next/dynamic';
function ChartSkeleton({ height = 240 }: { height?: number }) {
  return <div aria-hidden="true" className="w-full skeleton rounded-field" style={{ height }} />;
}

const loading = () => <ChartSkeleton />;

/** Recharts is large; every chart is split into its own lazily loaded chunk. */
export const TrendChart = dynamic(() => import('./trend-chart'), { ssr: false, loading });
export const SleepWindowChart = dynamic(() => import('./sleep-window-chart'), {
  ssr: false,
  loading,
});
export const CategoryBarChart = dynamic(() => import('./category-bar-chart'), {
  ssr: false,
  loading,
});
export const ImpactChart = dynamic(() => import('./impact-chart'), { ssr: false, loading });
export const SimpleAreaChart = dynamic(() => import('./area-chart'), { ssr: false, loading });
export const Sparkline = dynamic(() => import('./sparkline'), { ssr: false, loading: () => null });

export { ChartSkeleton };
export type { TrendPoint } from './trend-chart';
export type { CategoryDatum } from './category-bar-chart';
export type { ImpactDatum } from './impact-chart';
