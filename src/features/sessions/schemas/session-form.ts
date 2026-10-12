import { z } from 'zod';
import { fromDateTimeInput } from '@/lib/date';

export const MIN_DURATION_MINUTES = 10;
export const MAX_DURATION_MINUTES = 20 * 60;

const optionalInt = (min: number, max: number, label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${String(min)}`)
    .max(max, `${label} must be at most ${String(max)}`)
    .nullable();

const rating = z.number().int().min(1).max(5).nullable();

export function createSessionFormSchema(zone: string, now: () => number = Date.now) {
  return z
    .object({
      started_at: z.string().min(1, 'Choose when you went to bed'),
      ended_at: z.string().min(1, 'Choose when you woke up'),
      quality: rating,
      mood_on_wake: rating,
      sleep_latency_minutes: optionalInt(0, 240, 'Time to fall asleep'),
      awakenings: optionalInt(0, 50, 'Awakenings'),
      notes: z.string().max(2000, 'Notes can be up to 2000 characters'),
      tag_ids: z.array(z.string()),
    })
    .superRefine((value, ctx) => {
      if (!value.started_at || !value.ended_at) return;
      let start: number;
      let end: number;
      try {
        start = Date.parse(fromDateTimeInput(value.started_at, zone));
        end = Date.parse(fromDateTimeInput(value.ended_at, zone));
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: ['started_at'],
          message: 'Enter a valid date and time',
        });
        return;
      }
      const minutes = (end - start) / 60_000;
      if (minutes <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['ended_at'],
          message: 'Wake time must be after bedtime',
        });
      } else if (minutes < MIN_DURATION_MINUTES) {
        ctx.addIssue({
          code: 'custom',
          path: ['ended_at'],
          message: 'A night must last at least 10 minutes',
        });
      } else if (minutes > MAX_DURATION_MINUTES) {
        ctx.addIssue({
          code: 'custom',
          path: ['ended_at'],
          message: 'A night can last at most 20 hours',
        });
      }
      if (end > now() + 60_000) {
        ctx.addIssue({
          code: 'custom',
          path: ['ended_at'],
          message: 'Wake time cannot be in the future',
        });
      }
    });
}

export type SessionFormValues = z.infer<ReturnType<typeof createSessionFormSchema>>;

export const SESSION_FORM_FIELDS = [
  'started_at',
  'ended_at',
  'quality',
  'mood_on_wake',
  'sleep_latency_minutes',
  'awakenings',
  'notes',
  'tag_ids',
] as const;
