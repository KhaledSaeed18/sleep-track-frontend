'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Globe2 } from 'lucide-react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { PasswordField, TextField } from '@/components/ui/field';
import { useAppMeta } from '@/features/meta/api';
import { useMounted } from '@/hooks/use-mounted';
import { browserTimezone } from '@/lib/date';
import { applyServerErrors } from '@/lib/forms';
import { useRegister } from '../hooks/use-auth';
import { registerSchema, type RegisterValues } from '../schemas';
import { AuthCard } from './auth-card';
import { FormAlert } from './form-alert';
import { OAuthButtons } from './oauth-buttons';
import { PasswordStrengthMeter } from './password-strength-meter';

export function RegisterForm() {
  const registerAccount = useRegister();
  const { data: meta } = useAppMeta();
  const mounted = useMounted();
  const timezone = mounted ? browserTimezone() : 'your local time zone';
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      accept_terms: false as unknown as true,
    },
    mode: 'onTouched',
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async ({ accept_terms: _accepted, ...values }) => {
    try {
      await registerAccount.mutateAsync({ ...values, timezone: browserTimezone() });
    } catch (error) {
      const message = applyServerErrors(error, setError, [
        'first_name',
        'last_name',
        'email',
        'password',
      ]);
      if (message) setError('root.server', { message });
    }
  });

  const closed = meta?.features.registration_open === false;
  const busy = isSubmitting || registerAccount.isSuccess;

  return (
    <AuthCard
      title="Create your account"
      description="Two minutes to set up. Your first insight arrives after a few nights."
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/login" className="link font-medium link-primary">
            Sign in
          </Link>
        </p>
      }
    >
      {closed && (
        <FormAlert tone="info" className="mb-5">
          New sign-ups are paused right now. You can still explore the demo from the home page.
        </FormAlert>
      )}
      {errors.root?.server && (
        <FormAlert tone="error" className="mb-5">
          {errors.root.server.message}
        </FormAlert>
      )}

      <OAuthButtons />

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            aria-describedby="password-strength"
            {...register('password')}
          />
          <PasswordStrengthMeter id="password-strength" password={password} />
        </div>
        <p className="flex items-center gap-2 text-xs text-base-content/60">
          <Globe2 className="size-3.5" aria-hidden="true" />
          Times will be shown in {timezone}. You can change this later.
        </p>
        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              className="checkbox mt-0.5 checkbox-sm checkbox-primary"
              aria-invalid={errors.accept_terms ? true : undefined}
              {...register('accept_terms')}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="link" target="_blank">
                terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="link" target="_blank">
                privacy policy
              </Link>
              .
            </span>
          </label>
          {errors.accept_terms && <p className="field-error">{errors.accept_terms.message}</p>}
        </div>
        <button type="submit" className="btn w-full btn-primary" disabled={busy || closed}>
          {busy && <span className="loading loading-sm loading-spinner" aria-hidden="true" />}
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
