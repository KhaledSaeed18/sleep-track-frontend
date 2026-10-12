'use client';

import { useSyncExternalStore } from 'react';
import { DARK_THEME, type ResolvedTheme } from '@/lib/theme';

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function getSnapshot(): ResolvedTheme {
  return (document.documentElement.dataset.theme as ResolvedTheme | undefined) ?? DARK_THEME;
}

/** The theme actually applied to the document, kept in sync with `data-theme`. */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribe, getSnapshot, () => DARK_THEME);
}
