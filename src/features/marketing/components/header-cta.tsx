'use client';

import Link from 'next/link';
import { useAuthStatus } from '@/features/auth';

export function HeaderCta() {
  const status = useAuthStatus();
  if (status === 'authenticated') {
    return (
      <Link href="/dashboard" className="btn btn-primary btn-sm">
        Open dashboard
      </Link>
    );
  }
  return (
    <>
      <Link href="/login" className="btn hidden btn-ghost btn-sm sm:inline-flex">
        Sign in
      </Link>
      <Link href="/register" className="btn btn-primary btn-sm">
        Get started
      </Link>
    </>
  );
}
