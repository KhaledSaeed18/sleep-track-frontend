'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PasswordField, TextField } from '@/components/ui/field';
import { isApiError } from '@/lib/api/errors';
import { applyServerErrors } from '@/lib/forms';
import { useLogin } from '../hooks/use-auth';
import { loginSchema, type LoginValues } from '../schemas';
import { AuthCard } from './auth-card';
import { DemoButton } from './demo-button';
import { FormAlert } from './form-alert';
import { OAuthButtons } from './oauth-buttons';

const NOTICES: Record<string, { tone: 'info' | 'success' | 'error'; message: string }> = {
  expired: { tone: 'info', message: 'Your session ended. Sign in to pick up where you left off.' },
  reset: { tone: 'success', message: 'Password updated. Sign in with your new password.' },
  verified: { tone: 'success', message: 'Email confirmed. Sign in to continue.' },
  signed_out: { tone: 'success', message: 'You have been signed out on every device.' },
  deleted: { tone: 'success', message: 'Your account and data have been deleted.' },
};

function useNotice(params: URLSearchParams) {
  const oauthError = params.get('error');
  if (oauthError)
    return {
      tone: 'error' as const,
      message: 'Sign-in with Google did not complete. Try again or use your email.',
    };
  for (const key of Object.keys(NOTICES)) if (params.has(key)) return NOTICES[key]!;
  return null;
}

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next');
  const notice = useNotice(params);
  const login = useLogin(next);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember_me: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
    } catch (error) {
      if (isApiError(error) && error.code === 'invalid_credentials') {
        setError('root.server', {
          message: 'That email and password do not match. Check them and try again.',
        });
        return;
      }
      const message = applyServerErrors(error, setError, ['email', 'password']);
      if (message) setError('root.server', { message });
    }
  });

  const busy = isSubmitting || login.isSuccess;

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to see how you have been sleeping."
      footer={
        <p>
          New to SleepTrack?{' '}
          <Link
            href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
            className="link font-medium link-primary"
          >
            Create an account
          </Link>
        </p>
      }
    >
      {notice && !errors.root && (
        <FormAlert tone={notice.tone} className="mb-5">
          {notice.message}
        </FormAlert>
      )}
      {errors.root?.server && (
        <FormAlert tone="error" className="mb-5">
          {errors.root.server.message}
        </FormAlert>
      )}

      <OAuthButtons next={next} />

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          leading={<Mail className="size-4 text-base-content/45" aria-hidden="true" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          labelAction={
            <Link href="/forgot-password" className="link text-xs text-base-content/65 link-hover">
              Forgot password?
            </Link>
          }
          {...register('password')}
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            {...register('remember_me')}
          />
          Keep me signed in for 30 days
        </label>
        <button type="submit" className="btn w-full btn-primary" disabled={busy}>
          {busy && <span className="loading loading-sm loading-spinner" aria-hidden="true" />}
          Sign in
        </button>
      </form>

      <DemoButton
        className="mt-3 w-full border-(--hairline)"
        variant="ghost"
        label="Explore with demo data"
      />
    </AuthCard>
  );
}
