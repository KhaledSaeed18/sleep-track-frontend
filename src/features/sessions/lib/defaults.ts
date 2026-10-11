import { TZDate } from '@date-fns/tz';
import { clockToMinutes, fromDateTimeInput, toDateTimeInput } from '@/lib/date';
import type { Goal, SleepSession } from '@/types/models';
import type { SessionInput } from '../api';
import type { SessionFormValues } from '../schemas/session-form';

/** Sensible starting values for a new entry: last night, from the goal bedtime to the goal wake time. */
export function defaultSessionValues(
  zone: string,
  goal?: Pick<Goal, 'target_bedtime' | 'target_wake_time'>,
  now = Date.now(),
): SessionFormValues {
  const bed = clockToMinutes(goal?.target_bedtime ?? '23:00');
  const wake = clockToMinutes(goal?.target_wake_time ?? '07:00');
  const local = new TZDate(now, zone);
  const y = local.getFullYear();
  const m = local.getMonth();
  const d = local.getDate();

  // If it is still before the usual wake time, "last night" ends this morning; otherwise it ended earlier today.
  const bedDayOffset = bed >= 12 * 60 ? -1 : 0;
  const start = new TZDate(y, m, d + bedDayOffset, 0, bed, 0, zone);
  let end = new TZDate(y, m, d, 0, wake, 0, zone);
  if (end.getTime() > now) {
    const rounded = Math.floor(now / 300_000) * 300_000;
    end = new TZDate(rounded, zone);
  }
  if (end.getTime() - start.getTime() < 10 * 60_000) {
    start.setTime(end.getTime() - 8 * 3_600_000);
  }

  return {
    started_at: toDateTimeInput(start, zone),
    ended_at: toDateTimeInput(end, zone),
    quality: null,
    mood_on_wake: null,
    sleep_latency_minutes: null,
    awakenings: null,
    notes: '',
    tag_ids: [],
  };
}

export function sessionToFormValues(session: SleepSession, zone: string): SessionFormValues {
  return {
    started_at: toDateTimeInput(session.started_at, zone),
    ended_at: session.ended_at ? toDateTimeInput(session.ended_at, zone) : '',
    quality: session.quality,
    mood_on_wake: session.mood_on_wake,
    sleep_latency_minutes: session.sleep_latency_minutes,
    awakenings: session.awakenings,
    notes: session.notes ?? '',
    tag_ids: session.tags.map((tag) => tag.id),
  };
}

export function formValuesToInput(values: SessionFormValues, zone: string): SessionInput {
  return {
    started_at: fromDateTimeInput(values.started_at, zone),
    ended_at: fromDateTimeInput(values.ended_at, zone),
    quality: values.quality,
    mood_on_wake: values.mood_on_wake,
    sleep_latency_minutes: values.sleep_latency_minutes,
    awakenings: values.awakenings,
    notes: values.notes.trim() ? values.notes.trim() : null,
    tag_ids: values.tag_ids,
    timezone: zone,
  };
}

/** Duration in minutes between two `datetime-local` values interpreted in `zone`, or null. */
export function previewDuration(startValue: string, endValue: string, zone: string): number | null {
  try {
    const minutes =
      (Date.parse(fromDateTimeInput(endValue, zone)) -
        Date.parse(fromDateTimeInput(startValue, zone))) /
      60_000;
    return Number.isFinite(minutes) ? Math.round(minutes) : null;
  } catch {
    return null;
  }
}
