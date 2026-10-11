import type { ProblemDetails, ProblemFieldError } from '@/types/models';

export type ProblemCode =
  | 'validation_error'
  | 'invalid_credentials'
  | 'email_taken'
  | 'email_not_verified'
  | 'account_disabled'
  | 'token_invalid'
  | 'token_expired'
  | 'not_authenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'session_overlap'
  | 'timer_already_running'
  | 'no_active_timer'
  | 'rate_limited'
  | 'csrf_failed'
  | 'provider_disabled'
  | 'internal_error'
  | 'network_error'
  | 'unknown_error';

const FRIENDLY_MESSAGES: Record<ProblemCode, string> = {
  validation_error: 'Some fields need attention.',
  invalid_credentials: 'That email and password combination is incorrect.',
  email_taken: 'An account with this email already exists.',
  email_not_verified: 'Verify your email address to continue.',
  account_disabled: 'This account has been deactivated. Contact support to restore it.',
  token_invalid: 'This link is invalid. Request a new one.',
  token_expired: 'This link has expired. Request a new one.',
  not_authenticated: 'Your session has ended. Sign in again.',
  forbidden: 'You do not have access to this.',
  not_found: 'We could not find what you were looking for.',
  conflict: 'That conflicts with something that already exists.',
  session_overlap: 'This overlaps another night you have logged. Adjust the times.',
  timer_already_running: 'A sleep timer is already running.',
  no_active_timer: 'There is no running timer to stop.',
  rate_limited: 'Too many attempts. Wait a moment and try again.',
  csrf_failed: 'Your session could not be verified. Refresh the page and try again.',
  provider_disabled: 'This sign-in method is not available right now.',
  internal_error: 'Something went wrong on our side. Try again in a moment.',
  network_error: 'Cannot reach the server. Check your connection and try again.',
  unknown_error: 'Something went wrong. Try again.',
};

const KNOWN_CODES = new Set(Object.keys(FRIENDLY_MESSAGES));

function codeFromStatus(status: number): ProblemCode {
  if (status === 401) return 'not_authenticated';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 422 || status === 400) return 'validation_error';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'internal_error';
  return 'unknown_error';
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ProblemCode;
  readonly title: string;
  readonly detail: string | null;
  readonly fieldErrors: ProblemFieldError[];
  readonly requestId: string | null;
  readonly retryAfter: number | null;

  constructor(
    problem: Partial<ProblemDetails> & { status: number },
    retryAfter: number | null = null,
  ) {
    const code =
      problem.code && KNOWN_CODES.has(problem.code)
        ? (problem.code as ProblemCode)
        : codeFromStatus(problem.status);
    super(problem.detail ?? problem.title ?? FRIENDLY_MESSAGES[code]);
    this.name = 'ApiError';
    this.status = problem.status;
    this.code = code;
    this.title = problem.title ?? FRIENDLY_MESSAGES[code];
    this.detail = problem.detail ?? null;
    this.fieldErrors = problem.errors ?? [];
    this.requestId = problem.request_id ?? null;
    this.retryAfter = retryAfter;
  }

  /** A short, user-facing sentence for toasts and alerts. */
  get friendlyMessage(): string {
    if (this.code === 'rate_limited' && this.retryAfter) {
      return `Too many attempts. Try again in ${String(this.retryAfter)} seconds.`;
    }
    if (this.code === 'validation_error' && this.detail && this.fieldErrors.length === 0)
      return this.detail;
    if (this.code === 'conflict' && this.detail) return this.detail;
    return FRIENDLY_MESSAGES[this.code];
  }

  is(...codes: ProblemCode[]): boolean {
    return codes.includes(this.code);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Best-effort message for any thrown value. */
export function errorMessage(error: unknown, fallback = FRIENDLY_MESSAGES.unknown_error): string {
  if (isApiError(error)) return error.friendlyMessage;
  return fallback;
}

/** Normalises FastAPI-style field paths such as `body.ended_at` to `ended_at`. */
export function normaliseField(field: string): string {
  const parts = field
    .split('.')
    .filter((part) => part !== 'body' && part !== 'query' && part !== 'path');
  return parts.join('.') || field;
}

function isProblemLike(value: unknown): value is Partial<ProblemDetails> {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('title' in value || 'code' in value || 'detail' in value)
  );
}

/** Builds an ApiError from a failed response body. Handles problem+json and legacy FastAPI shapes. */
export function toApiError(body: unknown, response: Response): ApiError {
  const retryHeader = response.headers.get('Retry-After');
  const retryAfter = retryHeader ? Number.parseInt(retryHeader, 10) || null : null;
  const requestId = response.headers.get('X-Request-ID');

  if (isProblemLike(body)) {
    const detail = typeof body.detail === 'string' ? body.detail : null;
    return new ApiError(
      {
        ...body,
        detail,
        status: body.status ?? response.status,
        request_id: body.request_id ?? requestId,
      },
      retryAfter,
    );
  }

  if (typeof body === 'object' && body !== null && 'detail' in body && Array.isArray(body.detail)) {
    const errors = (
      body.detail as { loc?: (string | number)[]; msg?: string; type?: string }[]
    ).map((item) => ({
      field: (item.loc ?? []).map(String).join('.'),
      message: item.msg ?? 'Invalid value',
      code: item.type,
    }));
    return new ApiError(
      {
        status: response.status,
        code: 'validation_error',
        title: 'Validation failed',
        errors,
        request_id: requestId,
      },
      retryAfter,
    );
  }

  return new ApiError({ status: response.status, request_id: requestId }, retryAfter);
}

export function networkError(): ApiError {
  return new ApiError({ status: 0, code: 'network_error', title: FRIENDLY_MESSAGES.network_error });
}
