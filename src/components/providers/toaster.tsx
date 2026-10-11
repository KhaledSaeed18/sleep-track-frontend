'use client';

import type { CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export function Toaster() {
  const resolved = useResolvedTheme();
  return (
    <Sonner
      theme={resolved === 'dawn' ? 'light' : 'dark'}
      position="bottom-right"
      closeButton
      offset={{ bottom: 24, right: 24 }}
      mobileOffset={{ bottom: 88 }}
      style={
        {
          '--normal-bg': 'var(--color-base-100)',
          '--normal-border': 'var(--hairline)',
          '--normal-text': 'var(--color-base-content)',
          '--border-radius': 'var(--radius-field)',
          fontFamily: 'var(--font-sans)',
        } as CSSProperties
      }
    />
  );
}
