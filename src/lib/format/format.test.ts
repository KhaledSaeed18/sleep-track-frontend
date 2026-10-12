import { describe, expect, it } from 'vitest';
import {
  computeDelta,
  formatDuration,
  formatPercent,
  formatSigned,
  pluralize,
  scoreLabel,
  scoreTone,
} from './index';

describe('formatDuration', () => {
  it.each([
    [452, '7h 32m'],
    [480, '8h'],
    [45, '45m'],
    [-90, '−1h 30m'],
    [null, '—'],
  ])('formats %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });

  it('supports a compact clock-like form', () => {
    expect(formatDuration(452, { compact: true })).toBe('7:32');
  });
});

describe('computeDelta', () => {
  it('marks increases as positive when higher is better', () => {
    expect(computeDelta(80, 74)).toEqual({ value: 6, trend: 'up', positive: true });
  });

  it('inverts for metrics where lower is better', () => {
    expect(computeDelta(30, 10, { higherIsBetter: false })?.positive).toBe(false);
  });

  it('treats changes within the threshold as flat', () => {
    expect(computeDelta(100, 99, { threshold: 2 })?.trend).toBe('flat');
  });

  it('returns null when a side is missing', () => {
    expect(computeDelta(null, 5)).toBeNull();
    expect(computeDelta(5, undefined)).toBeNull();
  });
});

describe('misc formatters', () => {
  it('formats signed values', () => {
    expect(formatSigned(1.04, 1)).toBe('+1.0');
    expect(formatSigned(-0.5, 1)).toBe('−0.5');
    expect(formatSigned(0)).toBe('±0');
  });

  it('formats percentages and plurals', () => {
    expect(formatPercent(0.634)).toBe('63%');
    expect(pluralize(1, 'night')).toBe('1 night');
    expect(pluralize(3, 'night')).toBe('3 nights');
  });

  it('labels and tones scores', () => {
    expect(scoreLabel(90)).toBe('Excellent');
    expect(scoreLabel(60)).toBe('Fair');
    expect(scoreTone(null)).toBe('neutral');
    expect(scoreTone(40)).toBe('error');
  });
});
