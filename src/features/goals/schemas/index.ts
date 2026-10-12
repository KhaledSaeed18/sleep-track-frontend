import { z } from 'zod';

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 23:00');

export const goalSchema = z.object({
  target_duration_minutes: z
    .number()
    .int()
    .min(180, 'Aim for at least 3 hours')
    .max(900, 'Aim for at most 15 hours'),
  target_bedtime: clock,
  target_wake_time: clock,
  bedtime_window_minutes: z.number().int().min(0).max(180),
});

export type GoalValues = z.infer<typeof goalSchema>;
