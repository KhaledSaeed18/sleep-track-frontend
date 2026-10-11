'use client';

import { useEffect } from 'react';
import { applyTheme } from '@/lib/theme';
import { useUiStore } from '@/stores/ui-store';

/** Applies the theme preference to `<html>` and follows the OS setting while on "system". */
export function ThemeSync() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  return null;
}
