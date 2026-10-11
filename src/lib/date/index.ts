import { TZDate, tz } from '@date-fns/tz';
import {
  addDays,
  differenceInMinutes,
  format,
  formatDistanceToNowStrict,
  parseISO,
  startOfWeek,
} from 'date-fns';
import type { ClockTime, LocalDate, TimeFormat, WeekStart } from '@/types/models';

export const FALLBACK_TIMEZONE = 'UTC';

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

export function isValidTimezone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export function supportedTimezones(): string[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
  const zones = intl.supportedValuesOf?.('timeZone') ?? [];
  return zones.length ? zones : ['UTC', browserTimezone()];
}

/** Wall-clock view of a UTC instant in the given zone. */
export function inZone(iso: string | Date, zone: string): TZDate {
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  return new TZDate(date.getTime(), zone);
}

export function timePattern(timeFormat: TimeFormat): string {
  return timeFormat === '12h' ? 'h:mm a' : 'HH:mm';
}

export function formatTime(iso: string | Date, zone: string, timeFormat: TimeFormat): string {
  return format(inZone(iso, zone), timePattern(timeFormat));
}

export function formatDateTime(iso: string | Date, zone: string, timeFormat: TimeFormat): string {
  return format(inZone(iso, zone), `EEE, MMM d, ${timePattern(timeFormat)}`);
}

export function formatInZone(iso: string | Date, zone: string, pattern: string): string {
  return format(inZone(iso, zone), pattern);
}

/** Parses a `YYYY-MM-DD` local date as a calendar date (no zone conversion). */
export function parseLocalDate(value: LocalDate): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toLocalDate(date: Date): LocalDate {
  return format(date, 'yyyy-MM-dd');
}

export function formatLocalDate(value: LocalDate, pattern = 'EEE, MMM d'): string {
  return format(parseLocalDate(value), pattern);
}

/** Today's calendar date in the given zone. */
export function todayIn(zone: string): LocalDate {
  return format(new TZDate(Date.now(), zone), 'yyyy-MM-dd');
}

export function shiftLocalDate(value: LocalDate, days: number): LocalDate {
  return toLocalDate(addDays(parseLocalDate(value), days));
}

export function daysBetween(from: LocalDate, to: LocalDate): number {
  return Math.round((parseLocalDate(to).getTime() - parseLocalDate(from).getTime()) / 86_400_000);
}

export function weekStartIndex(weekStart: WeekStart): 0 | 1 {
  return weekStart === 'sunday' ? 0 : 1;
}

export function startOfWeekFor(value: LocalDate, weekStart: WeekStart): LocalDate {
  return toLocalDate(
    startOfWeek(parseLocalDate(value), { weekStartsOn: weekStartIndex(weekStart) }),
  );
}

/** `YYYY-MM-DDTHH:mm` for `<input type="datetime-local">`, shown in the given zone. */
export function toDateTimeInput(iso: string | Date, zone: string): string {
  return format(inZone(iso, zone), "yyyy-MM-dd'T'HH:mm");
}

/** Interprets a `datetime-local` value as wall time in `zone` and returns a UTC ISO string. */
export function fromDateTimeInput(value: string, zone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) throw new RangeError(`Invalid datetime-local value: ${value}`);
  const [, y, mo, d, h, mi] = match.map(Number) as [number, number, number, number, number, number];
  return new TZDate(y, mo - 1, d, h, mi, 0, zone).toISOString();
}

export function minutesBetween(startIso: string, endIso: string): number {
  return differenceInMinutes(parseISO(endIso), parseISO(startIso));
}

export function clockToMinutes(value: ClockTime): number {
  const [h, m] = value.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToClock(total: number): ClockTime {
  const wrapped = ((Math.round(total) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Maps a clock time onto a continuous evening-anchored axis so that 23:30 and 00:30 sit next to
 * each other. Times before `pivotHour` are treated as after midnight (value + 24h).
 */
export function clockToNightMinutes(value: ClockTime, pivotHour = 15): number {
  const minutes = clockToMinutes(value);
  return minutes < pivotHour * 60 ? minutes + 1440 : minutes;
}

export function formatClock(value: ClockTime | null | undefined, timeFormat: TimeFormat): string {
  if (!value) return '—';
  if (timeFormat === '24h') return value.slice(0, 5);
  const minutes = clockToMinutes(value);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12)}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Signed difference between two clock times in minutes, taking the shorter way around midnight. */
export function clockDiff(actual: ClockTime, target: ClockTime): number {
  let diff = clockToMinutes(actual) - clockToMinutes(target);
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
}

export function relativeTime(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Weekday indexes (0 = Monday) in display order for the user's week start. */
export function orderedWeekdays(weekStart: WeekStart): number[] {
  return weekStart === 'sunday' ? [6, 0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6];
}

export { tz };
