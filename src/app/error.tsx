'use client';

import { RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-[70dvh] place-items-center px-6">
      <div className="surface flex max-w-md flex-col items-center gap-3 p-10 text-center">
        <h1 className="font-display text-2xl font-semibold">This screen hit a problem</h1>
        <p className="text-sm text-base-content/70">
          Your data is safe. Try again, and if it keeps happening, reload the page.
        </p>
        {error.digest && <p className="text-xs text-base-content/45">Reference {error.digest}</p>}
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
            <RotateCw className="size-4" aria-hidden="true" /> Try again
          </button>
          <Link href="/" className="btn btn-ghost btn-sm">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
