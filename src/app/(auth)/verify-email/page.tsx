import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailView } from '@/features/auth/components/verify-email-view';

export const metadata: Metadata = { title: 'Confirm your email', robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailView />
    </Suspense>
  );
}
