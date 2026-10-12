import { describe, expect, it } from 'vitest';
import { clamp, cn, initials, isSafeRedirect } from './index';

describe('utils', () => {
  it('joins class names', () => {
    expect(cn('a', false, null, ['b', { c: true, d: false }])).toBe('a b c');
  });

  it('accepts only same-site redirect paths', () => {
    expect(isSafeRedirect('/journal?page=2')).toBe(true);
    expect(isSafeRedirect('//evil.example')).toBe(false);
    expect(isSafeRedirect('https://evil.example')).toBe(false);
    expect(isSafeRedirect('/\\evil')).toBe(false);
    expect(isSafeRedirect(null)).toBe(false);
  });

  it('clamps and builds initials', () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(initials('maya', 'haddad')).toBe('MH');
    expect(initials('', '')).toBe('?');
  });
});
