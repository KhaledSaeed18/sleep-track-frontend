'use client';

import { useAuthStatus } from '@/features/auth';
import { useUiStore } from '@/stores/ui-store';
import type { ThemePreference } from '@/types/models';
import { useUpdatePreferences } from './index';

/** Theme preference that persists locally and, when signed in, to the account. */
export function useThemePreference() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const status = useAuthStatus();
  const update = useUpdatePreferences({ silent: true });

  function change(next: ThemePreference) {
    setTheme(next);
    if (status === 'authenticated') update.mutate({ theme: next });
  }

  return [theme, change] as const;
}
