'use client';

import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" data-theme="midnight">
      <body className="grid min-h-dvh place-items-center px-6">
        <main className="flex max-w-md flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold">SleepTrack could not load</h1>
          <p className="text-sm text-base-content/70">
            Something went wrong while starting the app. Try again in a moment.
          </p>
          {error.digest && <p className="text-xs text-base-content/45">Reference {error.digest}</p>}
          <button type="button" className="btn mt-3 btn-primary btn-sm" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
