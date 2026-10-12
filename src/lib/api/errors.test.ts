import { describe, expect, it } from 'vitest';
import { ApiError, errorMessage, normaliseField, toApiError } from './errors';

function response(status: number, headers: Record<string, string> = {}) {
  return new Response(null, { status, headers });
}

describe('toApiError', () => {
  it('reads RFC 9457 problem details', () => {
    const error = toApiError(
      {
        title: 'Validation failed',
        status: 422,
        code: 'validation_error',
        detail: 'One or more fields are invalid.',
        errors: [{ field: 'ended_at', message: 'must be after started_at', code: 'value_error' }],
        request_id: 'req-1',
      },
      response(422),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('validation_error');
    expect(error.fieldErrors).toHaveLength(1);
    expect(error.requestId).toBe('req-1');
  });

  it('maps legacy FastAPI validation arrays', () => {
    const error = toApiError(
      {
        detail: [
          { loc: ['body', 'email'], msg: 'value is not a valid email', type: 'value_error' },
        ],
      },
      response(422),
    );
    expect(error.code).toBe('validation_error');
    expect(error.fieldErrors[0]).toMatchObject({
      field: 'body.email',
      message: 'value is not a valid email',
    });
  });

  it('falls back to a status-derived code for unknown bodies', () => {
    expect(toApiError('Bad gateway', response(502)).code).toBe('internal_error');
    expect(toApiError(null, response(404)).code).toBe('not_found');
  });

  it('includes Retry-After in the rate limit message', () => {
    const error = toApiError(
      { title: 'Too many requests', status: 429, code: 'rate_limited' },
      response(429, { 'Retry-After': '30' }),
    );
    expect(error.retryAfter).toBe(30);
    expect(error.friendlyMessage).toContain('30 seconds');
  });

  it('ignores unknown codes and keeps a friendly message', () => {
    const error = toApiError({ title: 'Teapot', status: 418, code: 'teapot' }, response(418));
    expect(error.code).toBe('unknown_error');
    expect(errorMessage(error)).toMatch(/Something went wrong/);
  });
});

describe('normaliseField', () => {
  it('strips request location prefixes', () => {
    expect(normaliseField('body.ended_at')).toBe('ended_at');
    expect(normaliseField('query.page')).toBe('page');
    expect(normaliseField('started_at')).toBe('started_at');
  });
});
