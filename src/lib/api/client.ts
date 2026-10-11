import createClient from 'openapi-fetch';
import type { paths } from '@/types/api';
import { authEvents } from '@/lib/auth/events';
import { CSRF_COOKIE, CSRF_HEADER, SESSION_HINT_COOKIE } from '@/lib/auth/constants';
import { tokenStore } from '@/lib/auth/token-store';
import { readCookie } from '@/lib/utils/cookies';
import { apiBaseUrl } from './base-url';
import { isApiError, networkError, toApiError } from './errors';
import { refreshAccessToken } from './refresh';

/** Endpoints that authenticate by credentials or cookie and must never trigger a refresh-and-retry. */
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/demo',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/oauth/providers',
  '/meta',
];

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => pathname.endsWith(path));
}

function hasSessionHint(): boolean {
  return readCookie(SESSION_HINT_COOKIE) !== null;
}

function decorate(request: Request): Request {
  const token = tokenStore.get();
  if (token) request.headers.set('Authorization', `Bearer ${token}`);
  if (UNSAFE_METHODS.has(request.method)) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) request.headers.set(CSRF_HEADER, csrf);
  }
  return request;
}

/**
 * fetch wrapper used by the typed client: attaches the bearer token and CSRF header, refreshes a
 * stale token up front, and on a 401 refreshes once and replays the original request.
 */
export async function authFetch(request: Request): Promise<Response> {
  const replay = request.clone();
  const { pathname } = new URL(request.url);
  const canRefresh = !isPublicAuthPath(pathname) && typeof window !== 'undefined';

  if (canRefresh && tokenStore.isStale() && hasSessionHint()) {
    await refreshAccessToken().catch(() => null);
  }

  const response = await fetch(decorate(request));
  if (response.status !== 401 || !canRefresh) return response;

  const refreshed = await refreshAccessToken().catch(() => null);
  if (!refreshed) {
    if (tokenStore.get() === null) authEvents.emit('expired', undefined);
    return response;
  }
  return fetch(decorate(replay));
}

export const api = createClient<paths>({
  baseUrl: apiBaseUrl(),
  credentials: 'include',
  fetch: authFetch,
});

interface ClientResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Resolves a typed client call to its data or throws an `ApiError`. */
export async function unwrap<T>(call: Promise<ClientResult<T>>): Promise<T> {
  let result: ClientResult<T>;
  try {
    result = await call;
  } catch (error) {
    if (isApiError(error) || isAbort(error)) throw error;
    throw networkError();
  }
  if (!result.response.ok) throw toApiError(result.error, result.response);
  return result.data as T;
}

/** Raw request through the same auth pipeline, for downloads and multipart uploads. */
export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await authFetch(
      new Request(`${apiBaseUrl()}${path}`, { credentials: 'include', ...init }),
    );
  } catch (error) {
    if (isAbort(error)) throw error;
    throw networkError();
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw toApiError(body, response);
  }
  return response;
}
