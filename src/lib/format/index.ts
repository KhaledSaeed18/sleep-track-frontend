export function formatDuration(
  minutes: number | null | undefined,
  options: { compact?: boolean } = {},
): string {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '—';
  const total = Math.round(Math.abs(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  const sign = minutes < 0 ? '−' : '';
  if (options.compact) return `${sign}${String(h)}:${String(m).padStart(2, '0')}`;
  if (h === 0) return `${sign}${String(m)}m`;
  if (m === 0) return `${sign}${String(h)}h`;
  return `${sign}${String(h)}h ${String(m)}m`;
}

export function formatHours(minutes: number | null | undefined, digits = 1): string {
  if (minutes === null || minutes === undefined) return '—';
  return `${(minutes / 60).toFixed(digits)}h`;
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(ratio: number | null | undefined, digits = 0): string {
  if (ratio === null || ratio === undefined) return '—';
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatSigned(value: number, digits = 0, unit = ''): string {
  const rounded = Number(value.toFixed(digits));
  if (rounded === 0) return `±0${unit}`;
  const sign = rounded > 0 ? '+' : '−';
  return `${sign}${Math.abs(rounded).toFixed(digits)}${unit}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString('en-US')} ${count === 1 ? singular : plural}`;
}

export type Trend = 'up' | 'down' | 'flat';

export interface Delta {
  value: number;
  trend: Trend;
  /** Whether the change is good for the user, taking metric direction into account. */
  positive: boolean;
}

export function computeDelta(
  current: number | null | undefined,
  previous: number | null | undefined,
  options: { higherIsBetter?: boolean; threshold?: number } = {},
): Delta | null {
  if (current === null || current === undefined || previous === null || previous === undefined)
    return null;
  const { higherIsBetter = true, threshold = 0 } = options;
  const value = current - previous;
  const trend: Trend = Math.abs(value) <= threshold ? 'flat' : value > 0 ? 'up' : 'down';
  const positive = trend === 'flat' ? true : (trend === 'up') === higherIsBetter;
  return { value, trend, positive };
}

export function scoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'No score';
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Poor';
}

export function scoreTone(
  score: number | null | undefined,
): 'success' | 'primary' | 'warning' | 'error' | 'neutral' {
  if (score === null || score === undefined) return 'neutral';
  if (score >= 85) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 55) return 'warning';
  return 'error';
}

export const QUALITY_LABELS: Record<number, string> = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent',
};

export const MOOD_LABELS: Record<number, string> = {
  1: 'Exhausted',
  2: 'Groggy',
  3: 'Okay',
  4: 'Refreshed',
  5: 'Energised',
};

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
