import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OAuthCallbackView } from '@/features/auth/components/oauth-callback-view';

export const metadata: Metadata = { title: 'Signing in', robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <OAuthCallbackView />
    </Suspense>
  );
}
