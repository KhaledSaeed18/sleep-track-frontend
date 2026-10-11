import { z } from 'zod';

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 23:00');

export const goalSchema = z.object({
  target_duration_minutes: z
    .number()
    .int()
    .min(240, 'Aim for at least 4 hours')
    .max(720, 'Aim for at most 12 hours'),
  target_bedtime: clock,
  target_wake_time: clock,
  bedtime_window_minutes: z.number().int().min(0).max(180),
});

export type GoalValues = z.infer<typeof goalSchema>;
