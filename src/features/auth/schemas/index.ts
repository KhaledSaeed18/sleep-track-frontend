import { z } from 'zod';
import { isCommonPassword } from '../lib/password-strength';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .pipe(z.email('Enter a valid email address'));

export const newPasswordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number')
  .refine((value) => !isCommonPassword(value), 'This password is too common. Choose another.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
  remember_me: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}`)
    .max(80, `${label[0]!.toUpperCase()}${label.slice(1)} is too long`);

export const registerSchema = z.object({
  first_name: nameSchema('first name'),
  last_name: nameSchema('last name'),
  email: emailSchema,
  password: newPasswordSchema,
  accept_terms: z.literal(true, { error: 'Accept the terms to continue' }),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ password: newPasswordSchema, confirm: z.string() })
  .refine((value) => value.password === value.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
