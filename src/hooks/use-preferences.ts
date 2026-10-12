'use client';

import { useMemo } from 'react';
import { useCurrentUser } from '@/features/auth';
import {
  browserTimezone,
  formatClock,
  formatDateTime,
  formatInZone,
  formatLocalDate,
  formatTime,
  todayIn,
} from '@/lib/date';
import type { ClockTime, LocalDate, Preferences } from '@/types/models';

export const DEFAULT_PREFERENCES: Preferences = {
  timezone: 'UTC',
  time_format: '24h',
  week_starts_on: 'monday',
  theme: 'system',
  email_weekly_report: true,
  email_bedtime_reminder: false,
};

export function usePreferences(): Preferences {
  const { data: user } = useCurrentUser();
  return useMemo(
    () => user?.preferences ?? { ...DEFAULT_PREFERENCES, timezone: browserTimezone() },
    [user?.preferences],
  );
}

/** Formatting helpers bound to the user's timezone and time format. */
export function useFormatters() {
  const prefs = usePreferences();
  return useMemo(() => {
    const zone = prefs.timezone;
    const tf = prefs.time_format;
    return {
      zone,
      timeFormat: tf,
      weekStartsOn: prefs.week_starts_on,
      time: (iso: string | Date) => formatTime(iso, zone, tf),
      dateTime: (iso: string | Date) => formatDateTime(iso, zone, tf),
      pattern: (iso: string | Date, pattern: string) => formatInZone(iso, zone, pattern),
      clock: (value: ClockTime | null | undefined) => formatClock(value, tf),
      localDate: (value: LocalDate, pattern?: string) => formatLocalDate(value, pattern),
      today: () => todayIn(zone),
    };
  }, [prefs.timezone, prefs.time_format, prefs.week_starts_on]);
}
