import { describe, expect, it } from 'vitest';
import { createSessionFormSchema, type SessionFormValues } from './session-form';

const NOW = Date.parse('2026-10-12T09:00:00Z');
const schema = createSessionFormSchema('UTC', () => NOW);

function values(overrides: Partial<SessionFormValues> = {}): SessionFormValues {
  return {
    started_at: '2026-10-11T23:00',
    ended_at: '2026-10-12T07:00',
    quality: 4,
    mood_on_wake: null,
    sleep_latency_minutes: 10,
    awakenings: 1,
    notes: '',
    tag_ids: [],
    ...overrides,
  };
}

function issues(input: SessionFormValues) {
  const result = schema.safeParse(input);
  return result.success
    ? []
    : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

describe('session form schema', () => {
  it('accepts a normal night', () => {
    expect(issues(values())).toEqual([]);
  });

  it('requires wake time after bedtime', () => {
    expect(issues(values({ ended_at: '2026-10-11T22:00' }))).toContain(
      'ended_at: Wake time must be after bedtime',
    );
  });

  it('enforces the 10 minute to 20 hour duration window', () => {
    expect(issues(values({ ended_at: '2026-10-11T23:05' }))).toContain(
      'ended_at: A night must last at least 10 minutes',
    );
    expect(
      issues(values({ started_at: '2026-10-10T08:00', ended_at: '2026-10-11T07:00' })),
    ).toContain('ended_at: A night can last at most 20 hours');
  });

  it('rejects wake times in the future', () => {
    expect(issues(values({ ended_at: '2026-10-12T10:00' }))).toContain(
      'ended_at: Wake time cannot be in the future',
    );
  });

  it('validates ranges for optional numbers', () => {
    expect(issues(values({ sleep_latency_minutes: 300 })).join()).toMatch(
      /Time to fall asleep must be at most 240/,
    );
    expect(issues(values({ awakenings: -1 })).join()).toMatch(/Awakenings must be at least 0/);
    expect(issues(values({ notes: 'x'.repeat(2001) })).join()).toMatch(/2000 characters/);
  });
});
