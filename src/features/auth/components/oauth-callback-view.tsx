'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { refreshAccessToken } from '@/lib/api';
import { DEFAULT_AUTHED_ROUTE } from '@/lib/auth/constants';
import { isSafeRedirect } from '@/lib/utils';
import { establishSession } from '../lib/session';
import { AuthCard } from './auth-card';
import { FormAlert } from '@/components/ui/form-alert';

const ERRORS: Record<string, string> = {
  access_denied: 'You cancelled the Google sign-in.',
  provider_disabled: 'Google sign-in is not available right now.',
  email_taken:
    'An account with this email already exists. Sign in with your password, then link Google from settings.',
  account_disabled: 'This account has been deactivated.',
};

/** Landing page after the API completes an OAuth flow and sets the session cookies. */
export function OAuthCallbackView() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const error = params.get('error');
  const next = params.get('next');

  const session = useQuery({
    queryKey: ['oauth-callback'],
    queryFn: refreshAccessToken,
    enabled: !error,
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    meta: { silent: true },
  });

  useEffect(() => {
    if (!session.data) return;
    establishSession(queryClient, session.data);
    router.replace(isSafeRedirect(next) ? next : DEFAULT_AUTHED_ROUTE);
  }, [session.data, next, queryClient, router]);

  if (error || session.isError || (session.isSuccess && !session.data)) {
    return (
      <AuthCard title="Sign-in did not complete">
        <FormAlert tone="error" className="mb-5">
          {(error && ERRORS[error]) ?? 'We could not finish signing you in. Try again.'}
        </FormAlert>
        <Link href="/login" className="btn w-full btn-primary">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Signing you in" description="Finishing up with Google.">
      <span
        className="loading loading-lg loading-dots text-primary"
        role="status"
        aria-label="Signing in"
      />
    </AuthCard>
  );
}
