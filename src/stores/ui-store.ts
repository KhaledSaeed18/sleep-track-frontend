import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemePreference } from '@/types/models';
import { THEME_STORAGE_KEY, isThemePreference } from '@/lib/theme';

function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : 'system';
}

export type SessionEditorState = { mode: 'create' } | { mode: 'edit'; sessionId: string } | null;

interface UiState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;

  sessionEditor: SessionEditorState;
  openSessionEditor: (state: Exclude<SessionEditorState, null>) => void;
  closeSessionEditor: () => void;

  verifyBannerDismissed: boolean;
  dismissVerifyBanner: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: readStoredTheme(),
      setTheme: (theme) => {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        set({ theme });
      },

      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

      shortcutsOpen: false,
      setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),

      sessionEditor: null,
      openSessionEditor: (sessionEditor) => set({ sessionEditor }),
      closeSessionEditor: () => set({ sessionEditor: null }),

      verifyBannerDismissed: false,
      dismissVerifyBanner: () => set({ verifyBannerDismissed: true }),
    }),
    {
      name: 'st-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
