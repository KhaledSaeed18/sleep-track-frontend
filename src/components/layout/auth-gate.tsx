'use client';

import { CloudOff } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { LogoMark } from '@/components/brand/logo';
import { useAuthStatus, useAuthStore, useCurrentUser } from '@/features/auth';

function Splash({ label = 'Loading your nights' }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-12 animate-breathe" />
        <span className="text-sm text-base-content/60">{label}</span>
      </div>
    </div>
  );
}

/** Client-side guard for the authenticated app. The proxy handles the common case on the server. */
export function AuthGate({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const status = useAuthStatus();
  const { data: user, error, refetch } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const signedOutRedirect = useAuthStore((state) => state.signedOutRedirect);

  useEffect(() => {
    if (status !== 'guest') return;
    router.replace(signedOutRedirect ?? `/login?expired=1&next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname, signedOutRedirect]);

  if (status === 'offline' || (status === 'authenticated' && error && !user)) {
    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <div className="surface flex max-w-sm flex-col items-center gap-3 p-8 text-center">
          <CloudOff className="size-8 text-base-content/60" aria-hidden="true" />
          <h1 className="font-display text-xl font-semibold">Cannot reach SleepTrack</h1>
          <p className="text-sm text-base-content/65">
            Your data is safe. Check your connection, then try again.
          </p>
          <button
            type="button"
            className="btn mt-2 btn-primary btn-sm"
            onClick={() => (status === 'offline' ? window.location.reload() : void refetch())}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || !user) return <Splash />;
  if (requireAdmin && user.role !== 'admin') return <Splash label="Checking access" />;
  return children;
}
