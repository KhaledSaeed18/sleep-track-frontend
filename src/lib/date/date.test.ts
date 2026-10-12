import { describe, expect, it } from 'vitest';
import {
  clockDiff,
  clockToNightMinutes,
  daysBetween,
  formatClock,
  formatTime,
  fromDateTimeInput,
  minutesToClock,
  orderedWeekdays,
  shiftLocalDate,
  startOfWeekFor,
  toDateTimeInput,
} from './index';

describe('datetime-local conversion', () => {
  it('interprets input as wall time in the given zone', () => {
    expect(fromDateTimeInput('2026-10-11T23:30', 'Asia/Beirut')).toBe('2026-10-11T20:30:00.000Z');
    expect(fromDateTimeInput('2026-01-15T07:00', 'America/New_York')).toBe(
      '2026-01-15T12:00:00.000Z',
    );
  });

  it('round-trips through the zone', () => {
    const iso = '2026-10-11T20:30:00.000Z';
    expect(fromDateTimeInput(toDateTimeInput(iso, 'Asia/Beirut'), 'Asia/Beirut')).toBe(iso);
  });

  it('rejects malformed values', () => {
    expect(() => fromDateTimeInput('11/10/2026', 'UTC')).toThrow(RangeError);
  });
});

describe('clock helpers', () => {
  it('formats 24h and 12h clocks', () => {
    expect(formatClock('23:05', '24h')).toBe('23:05');
    expect(formatClock('23:05', '12h')).toBe('11:05 PM');
    expect(formatClock('00:30', '12h')).toBe('12:30 AM');
    expect(formatClock(null, '24h')).toBe('—');
  });

  it('takes the short way around midnight', () => {
    expect(clockDiff('00:30', '23:30')).toBe(60);
    expect(clockDiff('23:00', '00:15')).toBe(-75);
    expect(clockDiff('07:10', '07:00')).toBe(10);
  });

  it('keeps late-night times on one continuous axis', () => {
    expect(clockToNightMinutes('23:30')).toBe(23 * 60 + 30);
    expect(clockToNightMinutes('00:30')).toBe(24 * 60 + 30);
    expect(clockToNightMinutes('07:00')).toBe(31 * 60);
  });

  it('wraps minutes back into a clock', () => {
    expect(minutesToClock(1500)).toBe('01:00');
    expect(minutesToClock(-30)).toBe('23:30');
  });

  it('formats instants in the user zone', () => {
    expect(formatTime('2026-10-11T20:30:00Z', 'Asia/Beirut', '24h')).toBe('23:30');
    expect(formatTime('2026-10-11T20:30:00Z', 'Asia/Beirut', '12h')).toBe('11:30 PM');
  });
});

describe('local dates', () => {
  it('shifts and measures calendar days', () => {
    expect(shiftLocalDate('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-10-01', '2026-10-11')).toBe(10);
  });

  it('finds the start of the week for either convention', () => {
    expect(startOfWeekFor('2026-10-14', 'monday')).toBe('2026-10-12');
    expect(startOfWeekFor('2026-10-14', 'sunday')).toBe('2026-10-11');
  });

  it('orders weekdays from the user week start', () => {
    expect(orderedWeekdays('monday')[0]).toBe(0);
    expect(orderedWeekdays('sunday')[0]).toBe(6);
  });
});
