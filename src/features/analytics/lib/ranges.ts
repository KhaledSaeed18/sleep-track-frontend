import { daysBetween, shiftLocalDate } from '@/lib/date';
import type { DateRange } from '@/lib/query-keys';
import type { LocalDate } from '@/types/models';

export const RANGE_PRESETS = [
  { value: '7d', label: '7 days', days: 7 },
  { value: '30d', label: '30 days', days: 30 },
  { value: '90d', label: '90 days', days: 90 },
  { value: '365d', label: 'Year', days: 365 },
] as const;

export type RangePreset = (typeof RANGE_PRESETS)[number]['value'];
export const MAX_RANGE_DAYS = 400;

/**
 * The most recent night that can be complete. A night belongs to the date it began on, so
 * tonight (dated today) is still in progress and would otherwise break streaks and averages.
 */
export function lastNight(today: LocalDate): LocalDate {
  return shiftLocalDate(today, -1);
}

/** Inclusive range of the last `days` nights, ending with last night. */
export function lastNDays(days: number, today: LocalDate): DateRange {
  const to = lastNight(today);
  return { from: shiftLocalDate(to, -(days - 1)), to };
}

export function presetRange(preset: RangePreset, today: LocalDate): DateRange {
  return lastNDays(RANGE_PRESETS.find((item) => item.value === preset)?.days ?? 30, today);
}

export function rangeLength(range: DateRange): number {
  return daysBetween(range.from, range.to) + 1;
}

export function isValidRange(range: Partial<DateRange>): range is DateRange {
  if (!range.from || !range.to) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range.from) || !/^\d{4}-\d{2}-\d{2}$/.test(range.to))
    return false;
  const length = daysBetween(range.from, range.to) + 1;
  return length >= 1 && length <= MAX_RANGE_DAYS;
}
