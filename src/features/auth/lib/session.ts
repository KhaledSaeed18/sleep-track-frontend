import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { tokenStore } from '@/lib/auth/token-store';
import { SESSION_HINT_COOKIE } from '@/lib/auth/constants';
import { deleteCookie } from '@/lib/utils/cookies';
import type { AuthResponse } from '@/types/models';
import { useAuthStore } from './auth-store';

/** Stores a fresh session: token in memory, user in the query cache. */
export function establishSession(queryClient: QueryClient, auth: AuthResponse): void {
  tokenStore.set(auth.access_token, auth.expires_in);
  queryClient.setQueryData(queryKeys.me, auth.user);
  useAuthStore.getState().setStatus('authenticated');
}

/** Clears every trace of the session on the client. */
export function clearSession(queryClient: QueryClient): void {
  tokenStore.clear();
  deleteCookie(SESSION_HINT_COOKIE);
  queryClient.clear();
  useAuthStore.getState().setStatus('guest');
}
