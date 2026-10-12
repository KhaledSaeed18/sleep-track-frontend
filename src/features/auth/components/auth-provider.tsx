'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';
import { refreshAccessToken } from '@/lib/api';
import { authEvents } from '@/lib/auth/events';
import { SESSION_HINT_COOKIE, isProtectedPath } from '@/lib/auth/constants';
import { queryKeys } from '@/lib/query-keys';
import { readCookie } from '@/lib/utils/cookies';
import { useAuthStore } from '../lib/auth-store';
import { clearSession } from '../lib/session';

/** Restores the session on load and reacts to token refreshes and expiry from the HTTP layer. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (useAuthStore.getState().status === 'authenticated') return;
      if (readCookie(SESSION_HINT_COOKIE) === null) {
        setStatus('guest');
        return;
      }
      try {
        const auth = await refreshAccessToken();
        if (cancelled) return;
        setStatus(auth ? 'authenticated' : 'guest');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    }

    void restore();

    const offRefreshed = authEvents.on('refreshed', (auth) => {
      queryClient.setQueryData(queryKeys.me, auth.user);
      setStatus('authenticated');
    });

    const offExpired = authEvents.on('expired', () => {
      const wasAuthenticated = useAuthStore.getState().status === 'authenticated';
      clearSession(queryClient);
      const current = pathnameRef.current;
      if (isProtectedPath(current)) {
        if (wasAuthenticated)
          toast.info('Your session ended. Sign in to continue.', { id: 'session-expired' });
        router.replace(`/login?expired=1&next=${encodeURIComponent(current)}`);
      }
    });

    return () => {
      cancelled = true;
      offRefreshed();
      offExpired();
    };
  }, [queryClient, router, setStatus]);

  return children;
}
