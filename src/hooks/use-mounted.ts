'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => undefined;

/** True after hydration. Use to defer rendering that depends on browser-only state. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
