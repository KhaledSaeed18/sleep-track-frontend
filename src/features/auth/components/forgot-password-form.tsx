'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { TextField } from '@/components/ui/field';
import { applyServerErrors } from '@/lib/forms';
import { authApi } from '../api';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';
import { AuthCard } from './auth-card';
import { FormAlert } from '@/components/ui/form-alert';

export function ForgotPasswordForm() {
  const request = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    meta: { silent: true },
  });
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await request.mutateAsync(email);
    } catch (error) {
      const message = applyServerErrors(error, setError, ['email']);
      if (message) setError('root.server', { message });
    }
  });

  const back = (
    <Link href="/login" className="inline-flex link items-center gap-1.5 link-hover">
      <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to sign in
    </Link>
  );

  if (request.isSuccess) {
    return (
      <AuthCard title="Check your inbox" footer={back}>
        <div className="surface flex gap-4 p-5">
          <MailCheck className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm">
            If an account exists for <strong>{getValues('email')}</strong>, a reset link is on its
            way. It expires in one hour. Check your spam folder if it does not arrive within a few
            minutes.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email you signed up with and we will send you a reset link."
      footer={back}
    >
      {errors.root?.server && (
        <FormAlert tone="error" className="mb-5">
          {errors.root.server.message}
        </FormAlert>
      )}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <button type="submit" className="btn w-full btn-primary" disabled={isSubmitting}>
          {isSubmitting && (
            <span className="loading loading-sm loading-spinner" aria-hidden="true" />
          )}
          Send reset link
        </button>
      </form>
    </AuthCard>
  );
}
