'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query-keys';
import { authApi } from '../api';
import { useAuthStatus } from '../hooks/use-auth';
import { AuthCard } from './auth-card';

export function VerifyEmailView() {
  const token = useSearchParams().get('token');
  const status = useAuthStatus();
  const queryClient = useQueryClient();
  const verification = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => authApi.verifyEmail(token!),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    meta: { silent: true },
  });

  useEffect(() => {
    if (verification.isSuccess) void queryClient.invalidateQueries({ queryKey: queryKeys.me });
  }, [verification.isSuccess, queryClient]);

  const continueLink =
    status === 'authenticated' ? (
      <Link href="/dashboard" className="btn w-full btn-primary">
        Go to your dashboard
      </Link>
    ) : (
      <Link href="/login?verified=1" className="btn w-full btn-primary">
        Sign in
      </Link>
    );

  if (!token || verification.isError) {
    return (
      <AuthCard
        title="We could not confirm your email"
        description={token ? errorMessage(verification.error) : 'This link is missing its token.'}
      >
        <div className="space-y-3">
          <XCircle className="size-10 text-error" aria-hidden="true" />
          <p className="text-sm text-base-content/70">
            Sign in and use the banner at the top of the app to send a fresh confirmation email.
          </p>
          {continueLink}
        </div>
      </AuthCard>
    );
  }

  if (verification.isSuccess) {
    return (
      <AuthCard title="Email confirmed" description="Thanks. Your account is fully set up.">
        <div className="space-y-5">
          <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
          {continueLink}
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Confirming your email" description="This only takes a moment.">
      <span
        className="loading loading-lg loading-dots text-primary"
        role="status"
        aria-label="Confirming"
      />
    </AuthCard>
  );
}
