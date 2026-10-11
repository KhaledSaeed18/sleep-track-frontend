'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { PasswordField } from '@/components/ui/field';
import { isApiError } from '@/lib/api/errors';
import { applyServerErrors } from '@/lib/forms';
import { authApi } from '../api';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';
import { AuthCard } from './auth-card';
import { FormAlert } from './form-alert';
import { PasswordStrengthMeter } from './password-strength-meter';

export function ResetPasswordForm() {
  const token = useSearchParams().get('token');
  const router = useRouter();
  const reset = useMutation({
    mutationFn: (password: string) => authApi.resetPassword(token ?? '', password),
    meta: { silent: true },
  });
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
    mode: 'onTouched',
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async ({ password: value }) => {
    try {
      await reset.mutateAsync(value);
      router.replace('/login?reset=1');
    } catch (error) {
      if (isApiError(error) && error.is('token_invalid', 'token_expired')) {
        setError('root.server', { message: error.friendlyMessage });
        return;
      }
      const message = applyServerErrors(error, setError, ['password']);
      if (message) setError('root.server', { message });
    }
  });

  if (!token) {
    return (
      <AuthCard
        title="This link is incomplete"
        description="Open the reset link from your email again, or request a new one."
      >
        <Link href="/forgot-password" className="btn w-full btn-primary">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Signing in again will be required on all your devices."
    >
      {errors.root?.server && (
        <FormAlert tone="error" className="mb-5">
          {errors.root.server.message}{' '}
          <Link href="/forgot-password" className="link font-medium">
            Request a new link
          </Link>
        </FormAlert>
      )}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <PasswordField
            label="New password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        <button
          type="submit"
          className="btn w-full btn-primary"
          disabled={isSubmitting || reset.isSuccess}
        >
          {(isSubmitting || reset.isSuccess) && (
            <span className="loading loading-sm loading-spinner" aria-hidden="true" />
          )}
          Update password
        </button>
      </form>
    </AuthCard>
  );
}
