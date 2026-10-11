import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Create a free SleepTrack account and start understanding your sleep.',
  alternates: { canonical: '/register' },
};

export default function Page() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
