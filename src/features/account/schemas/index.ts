import { z } from 'zod';
import { newPasswordSchema } from '@/features/auth/schemas';
import { isValidTimezone } from '@/lib/date';

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'Enter your first name').max(80),
  last_name: z.string().trim().min(1, 'Enter your last name').max(80),
  date_of_birth: z
    .string()
    .refine(
      (value) =>
        !value ||
        (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
          value <= new Date().toISOString().slice(0, 10) &&
          value >= '1900-01-01'),
      'Enter a valid date in the past',
    ),
  avatar_url: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => !value || /^https?:\/\/\S+$/.test(value), 'Use a full http(s) link'),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const preferencesSchema = z.object({
  timezone: z.string().refine(isValidTimezone, 'Choose a valid time zone'),
  time_format: z.enum(['24h', '12h']),
  week_starts_on: z.enum(['monday', 'sunday']),
  theme: z.enum(['system', 'light', 'dark']),
  email_weekly_report: z.boolean(),
  email_bedtime_reminder: z.boolean(),
});
export type PreferencesValues = z.infer<typeof preferencesSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string(),
    new_password: newPasswordSchema,
    confirm: z.string(),
  })
  .refine((value) => value.new_password === value.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
