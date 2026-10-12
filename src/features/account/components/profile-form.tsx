'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, MailWarning } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Avatar } from '@/components/ui/avatar';
import { TextField } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { SectionCard } from '@/components/ui/page-header';
import { useUser } from '@/features/auth';
import { useFormatters } from '@/hooks/use-preferences';
import { applyServerErrors } from '@/lib/forms';
import { useResendVerification, useUpdateProfile } from '../hooks';
import { profileSchema, type ProfileValues } from '../schemas';

export function ProfileForm() {
  const user = useUser();
  const fmt = useFormatters();
  const update = useUpdateProfile();
  const resend = useResendVerification();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: user.date_of_birth ?? '',
      avatar_url: user.avatar_url ?? '',
    },
  });
  const [first, last, avatar] = useWatch({
    control,
    name: ['first_name', 'last_name', 'avatar_url'],
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth || null,
        avatar_url: values.avatar_url || null,
      });
      reset({
        first_name: saved.first_name,
        last_name: saved.last_name,
        date_of_birth: saved.date_of_birth ?? '',
        avatar_url: saved.avatar_url ?? '',
      });
    } catch (error) {
      const message = applyServerErrors(error, setError, [
        'first_name',
        'last_name',
        'date_of_birth',
        'avatar_url',
      ]);
      if (message) setError('root.server', { message });
    }
  });

  return (
    <div className="space-y-6">
      <SectionCard title="Profile" description="How you appear in SleepTrack and in emails.">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {errors.root?.server && <FormAlert tone="error">{errors.root.server.message}</FormAlert>}
          <div className="flex items-center gap-4">
            <Avatar
              firstName={first}
              lastName={last}
              src={/^https?:\/\//.test(avatar) ? avatar : null}
              size="lg"
            />
            <div>
              <p className="font-semibold">{`${first} ${last}`.trim() || 'Your name'}</p>
              <p className="text-sm text-base-content/60">
                Member since {fmt.pattern(user.created_at, 'MMMM yyyy')}
              </p>
            </div>
          </div>
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
            <TextField
              label="Date of birth"
              type="date"
              hint="Used only to recommend how much sleep you need."
              error={errors.date_of_birth?.message}
              {...register('date_of_birth')}
            />
            <TextField
              label="Avatar link"
              type="url"
              placeholder="https://…"
              error={errors.avatar_url?.message}
              {...register('avatar_url')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => reset()}
              disabled={!isDirty || isSubmitting}
            >
              Discard
            </button>
            <button type="submit" className="btn btn-primary" disabled={!isDirty || isSubmitting}>
              {isSubmitting && (
                <span className="loading loading-sm loading-spinner" aria-hidden="true" />
              )}
              Save profile
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Email address"
        description="Where we send your weekly report and account notices."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-medium">{user.email}</span>
            {user.is_email_verified ? (
              <span className="badge gap-1 badge-soft badge-success">
                <BadgeCheck className="size-3.5" aria-hidden="true" /> Verified
              </span>
            ) : (
              <span className="badge gap-1 badge-soft badge-warning">
                <MailWarning className="size-3.5" aria-hidden="true" /> Not verified
              </span>
            )}
          </div>
          {!user.is_email_verified && !user.is_demo && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => resend.mutate()}
              disabled={resend.isPending || resend.isSuccess}
            >
              {resend.isSuccess ? 'Email sent' : 'Resend confirmation'}
            </button>
          )}
        </div>
        <p className="mt-3 text-sm text-base-content/55">
          Signed in with{' '}
          {user.auth_providers
            .map((p) =>
              p === 'password' ? 'email and password' : p[0]!.toUpperCase() + p.slice(1),
            )
            .join(' and ')}
          .
        </p>
      </SectionCard>
    </div>
  );
}
