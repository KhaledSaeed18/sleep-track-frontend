import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { isApiError, normaliseField } from '@/lib/api/errors';

/**
 * Maps API problem field errors onto react-hook-form fields. Returns the message to show at form
 * level when the error cannot be attributed to a known field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  aliases: Partial<Record<string, Path<T>>> = {},
): string | null {
  if (!isApiError(error)) return 'Something went wrong. Try again.';
  let unmatched = false;
  let matched = false;
  for (const fieldError of error.fieldErrors) {
    const name = normaliseField(fieldError.field);
    const target =
      aliases[name] ?? (fields.includes(name as Path<T>) ? (name as Path<T>) : undefined);
    if (target) {
      setError(target, { type: 'server', message: fieldError.message }, { shouldFocus: !matched });
      matched = true;
    } else {
      unmatched = true;
    }
  }
  if (!matched || unmatched || error.fieldErrors.length === 0) return error.friendlyMessage;
  return null;
}

/** Converts an `<input type="number">` value to a number or null for empty strings. */
export function numberOrNull(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
