'use client';

import { useAuthStatus } from '@/features/auth';
import { useMounted } from '@/hooks/use-mounted';
import { useUiStore } from '@/stores/ui-store';
import type { ThemePreference } from '@/types/models';
import { useUpdatePreferences } from './index';

/**
 * Theme preference that persists locally and, when signed in, to the account.
 *
 * The store reads `localStorage` on the client, so until hydration finishes this reports the
 * server's value (`system`) to keep server and client markup identical.
 */
export function useThemePreference() {
  const stored = useUiStore((state) => state.theme);
  const mounted = useMounted();
  const theme: ThemePreference = mounted ? stored : 'system';
  const setTheme = useUiStore((state) => state.setTheme);
  const status = useAuthStatus();
  const update = useUpdatePreferences({ silent: true });

  function change(next: ThemePreference) {
    setTheme(next);
    if (status === 'authenticated') update.mutate({ theme: next });
  }

  return [theme, change] as const;
}
