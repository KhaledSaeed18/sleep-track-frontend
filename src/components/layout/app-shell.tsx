'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { SessionEditor } from '@/features/sessions/components/session-editor';
import { useUser } from '@/features/auth';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useUiStore } from '@/stores/ui-store';
import { CommandPalette } from './command-palette';
import { GlobalHotkeys } from './global-hotkeys';
import { MobileDock } from './mobile-dock';
import { ShortcutsDialog } from './shortcuts-dialog';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { VerifyEmailBanner } from './verify-email-banner';

const DRAWER_ID = 'app-drawer';

/** Keeps the local theme in step with the account preference when the user loads. */
function useServerThemeSync() {
  const user = useUser();
  const setTheme = useUiStore((state) => state.setTheme);
  const serverTheme = user.preferences.theme;
  useEffect(() => {
    if (serverTheme !== useUiStore.getState().theme) setTheme(serverTheme);
  }, [serverTheme, setTheme]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const desktop = useMediaQuery('(min-width: 1024px)', true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  useServerThemeSync();

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawerOpen(false);
  }

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input
          id={DRAWER_ID}
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={(event) => setDrawerOpen(event.target.checked)}
          aria-label="Toggle navigation"
        />
        <div className="drawer-content flex min-h-dvh min-w-0 flex-col">
          <VerifyEmailBanner />
          <Topbar drawerId={DRAWER_ID} />
          <main
            id="main"
            tabIndex={-1}
            className="flex-1 px-4 pt-6 pb-28 outline-none sm:px-6 lg:px-10 lg:pt-8 lg:pb-12"
          >
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
        <div className="drawer-side z-50">
          <label htmlFor={DRAWER_ID} className="drawer-overlay" aria-label="Close navigation" />
          <Sidebar mobile={!desktop} onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>
      <MobileDock drawerId={DRAWER_ID} />
      <CommandPalette />
      <ShortcutsDialog />
      <SessionEditor />
      <GlobalHotkeys isAdmin={user.role === 'admin'} />
    </>
  );
}
