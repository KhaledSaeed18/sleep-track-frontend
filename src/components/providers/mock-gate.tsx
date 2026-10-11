'use client';

import { useEffect, useState, type ReactNode } from 'react';

const MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'true';

let starting: Promise<unknown> | null = null;

function startWorker() {
  starting ??= import('@/mocks/browser').then(({ worker }) =>
    worker.start({ quiet: true, onUnhandledFrame: 'bypass' }),
  );
  return starting;
}

/** When API mocking is enabled, holds rendering until the service worker is ready. */
export function MockGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!MOCKING);

  useEffect(() => {
    if (!MOCKING) return;
    let active = true;
    void startWorker().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return ready ? children : null;
}
