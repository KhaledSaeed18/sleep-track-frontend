import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { applyServerErrors, numberOrNull } from './forms';

describe('applyServerErrors', () => {
  it('assigns field errors and returns null when all match', () => {
    const setError = vi.fn();
    const error = new ApiError({
      status: 422,
      code: 'validation_error',
      errors: [
        { field: 'body.ended_at', message: 'must be after started_at', code: 'value_error' },
      ],
    });
    expect(applyServerErrors(error, setError, ['started_at', 'ended_at'])).toBeNull();
    expect(setError).toHaveBeenCalledWith(
      'ended_at',
      { type: 'server', message: 'must be after started_at' },
      { shouldFocus: true },
    );
  });

  it('returns a form-level message for errors without fields', () => {
    const setError = vi.fn();
    const error = new ApiError({
      status: 409,
      code: 'session_overlap',
      detail: 'Overlaps another session',
    });
    expect(applyServerErrors(error, setError, ['started_at'])).toMatch(/overlaps another night/);
    expect(setError).not.toHaveBeenCalled();
  });

  it('handles unknown throwables', () => {
    expect(applyServerErrors(new Error('boom'), vi.fn(), [])).toMatch(/Something went wrong/);
  });
});

describe('numberOrNull', () => {
  it('converts input values', () => {
    expect(numberOrNull('')).toBeNull();
    expect(numberOrNull('12')).toBe(12);
    expect(numberOrNull('abc')).toBeNull();
  });
});
