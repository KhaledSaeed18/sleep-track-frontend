import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to SleepTrack to log your nights and see your sleep trends.',
  alternates: { canonical: '/login' },
};

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
