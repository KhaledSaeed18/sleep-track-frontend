import type { AuthResponse } from '@/types/models';
import { authEvents } from '@/lib/auth/events';
import { CSRF_COOKIE, CSRF_HEADER } from '@/lib/auth/constants';
import { tokenStore } from '@/lib/auth/token-store';
import { readCookie } from '@/lib/utils/cookies';
import { API_PREFIX, apiBaseUrl } from './base-url';
import { networkError } from './errors';

let inflight: Promise<AuthResponse | null> | null = null;

async function performRefresh(): Promise<AuthResponse | null> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${API_PREFIX}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', [CSRF_HEADER]: readCookie(CSRF_COOKIE) ?? '' },
    });
  } catch {
    throw networkError();
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      tokenStore.clear();
      authEvents.emit('expired', undefined);
      return null;
    }
    throw networkError();
  }

  const auth = (await response.json()) as AuthResponse;
  tokenStore.set(auth.access_token, auth.expires_in);
  authEvents.emit('refreshed', auth);
  return auth;
}

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share one request,
 * which matters because the backend rotates refresh tokens and treats reuse as theft.
 * Resolves to `null` when the session is gone; rejects only on network failure.
 */
export function refreshAccessToken(): Promise<AuthResponse | null> {
  inflight ??= performRefresh().finally(() => {
    inflight = null;
  });
  return inflight;
}
