import { describe, expect, it } from 'vitest';
import { isValidRange, lastNDays, lastNight, presetRange, rangeLength } from './ranges';

describe('analytics ranges', () => {
  it('ends ranges on last night', () => {
    expect(lastNight('2026-10-12')).toBe('2026-10-11');
    expect(lastNDays(7, '2026-10-12')).toEqual({ from: '2026-10-05', to: '2026-10-11' });
    expect(rangeLength(presetRange('30d', '2026-10-12'))).toBe(30);
  });

  it('validates custom ranges', () => {
    expect(isValidRange({ from: '2026-01-01', to: '2026-01-31' })).toBe(true);
    expect(isValidRange({ from: '2026-02-01', to: '2026-01-31' })).toBe(false);
    expect(isValidRange({ from: '2024-01-01', to: '2026-01-31' })).toBe(false);
    expect(isValidRange({ from: 'yesterday', to: '2026-01-31' })).toBe(false);
  });
});
