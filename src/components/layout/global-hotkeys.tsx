'use client';

import { useRouter } from 'next/navigation';
import { NAV_ITEMS } from '@/config/nav';
import { useHotkeys, type HotkeyMap } from '@/hooks/use-hotkeys';
import { useUiStore } from '@/stores/ui-store';

export function GlobalHotkeys({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const setPalette = useUiStore((state) => state.setCommandPaletteOpen);
  const setShortcuts = useUiStore((state) => state.setShortcutsOpen);
  const openEditor = useUiStore((state) => state.openSessionEditor);

  const map: HotkeyMap = {
    'mod+k': () => setPalette(!useUiStore.getState().commandPaletteOpen),
    '?': () => setShortcuts(true),
    n: () => openEditor({ mode: 'create' }),
  };
  for (const item of NAV_ITEMS) {
    if (item.adminOnly && !isAdmin) continue;
    map[`g ${item.chord}`] = () => router.push(item.href);
  }

  useHotkeys(map);
  return null;
}
