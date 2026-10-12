import { describe, expect, it } from 'vitest';
import { defaultSessionValues, formValuesToInput, previewDuration } from './defaults';

describe('session defaults', () => {
  it('suggests last night from goal bedtime to goal wake time', () => {
    const now = Date.parse('2026-10-12T10:00:00Z');
    const values = defaultSessionValues(
      'UTC',
      { target_bedtime: '23:00', target_wake_time: '07:00' },
      now,
    );
    expect(values.started_at).toBe('2026-10-11T23:00');
    expect(values.ended_at).toBe('2026-10-12T07:00');
  });

  it('caps the wake time at now when it is still early', () => {
    const now = Date.parse('2026-10-12T03:12:00Z');
    const values = defaultSessionValues(
      'UTC',
      { target_bedtime: '23:00', target_wake_time: '07:00' },
      now,
    );
    expect(values.ended_at).toBe('2026-10-12T03:10');
  });

  it('converts form values to an API payload in UTC', () => {
    const input = formValuesToInput(
      {
        started_at: '2026-10-11T23:30',
        ended_at: '2026-10-12T07:00',
        quality: 4,
        mood_on_wake: 3,
        sleep_latency_minutes: null,
        awakenings: 0,
        notes: '  ',
        tag_ids: ['a'],
      },
      'Asia/Beirut',
    );
    expect(input).toMatchObject({
      started_at: '2026-10-11T20:30:00.000Z',
      ended_at: '2026-10-12T04:00:00.000Z',
      notes: null,
      timezone: 'Asia/Beirut',
      tag_ids: ['a'],
    });
  });

  it('previews the duration', () => {
    expect(previewDuration('2026-10-11T23:30', '2026-10-12T07:00', 'UTC')).toBe(450);
    expect(previewDuration('', '2026-10-12T07:00', 'UTC')).toBeNull();
  });
});
