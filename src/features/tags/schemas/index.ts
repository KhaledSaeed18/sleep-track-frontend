import { z } from 'zod';

export const tagSchema = z.object({
  name: z.string().trim().min(1, 'Give the tag a name').max(40, 'Keep it under 40 characters'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a colour'),
  icon: z.string().nullable(),
});

export type TagValues = z.infer<typeof tagSchema>;
