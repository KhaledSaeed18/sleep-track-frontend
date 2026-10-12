'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PasswordField } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { SectionCard } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { useLogoutEverywhere, useUser } from '@/features/auth';
import { PasswordStrengthMeter } from '@/features/auth/components/password-strength-meter';
import { useFormatters } from '@/hooks/use-preferences';
import { relativeTime } from '@/lib/date';
import { applyServerErrors } from '@/lib/forms';
import { useAuditLog, useChangePassword, useDevices, useRevokeDevice } from '../hooks';
import { changePasswordSchema, type ChangePasswordValues } from '../schemas';

const EVENT_LABELS: Record<string, string> = {
  login: 'Signed in',
  login_failed: 'Failed sign-in attempt',
  logout: 'Signed out',
  logout_all: 'Signed out everywhere',
  register: 'Account created',
  password_changed: 'Password changed',
  password_reset: 'Password reset',
  password_reset_requested: 'Password reset requested',
  email_verified: 'Email confirmed',
  session_revoked: 'Device signed out',
  data_exported: 'Data exported',
  data_imported: 'Data imported',
  token_reuse_detected: 'Suspicious session reuse blocked',
  oauth_linked: 'Google account linked',
  account_updated_by_admin: 'Account updated by an administrator',
};

function PasswordForm() {
  const user = useUser();
  const change = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', new_password: '', confirm: '' },
  });
  const next = useWatch({ control, name: 'new_password' });

  if (user.is_demo) {
    return (
      <SectionCard title="Password">
        <p className="text-sm text-base-content/65">
          Demo accounts sign in with a one-click link and cannot set a password. Create your own
          account to keep your data.
        </p>
      </SectionCard>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    if (user.has_password && !values.current_password) {
      setError('current_password', { message: 'Enter your current password' });
      return;
    }
    try {
      await change.mutateAsync({
        current_password: user.has_password ? values.current_password : null,
        new_password: values.new_password,
      });
      reset();
    } catch (error) {
      const message = applyServerErrors(error, setError, ['current_password', 'new_password']);
      if (message) setError('root.server', { message });
    }
  });

  return (
    <SectionCard
      title={user.has_password ? 'Change password' : 'Set a password'}
      description={
        user.has_password
          ? 'Other devices will be signed out.'
          : 'Add a password so you can also sign in with your email.'
      }
    >
      <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
        {errors.root?.server && <FormAlert tone="error">{errors.root.server.message}</FormAlert>}
        {change.isSuccess && <FormAlert tone="success">Password updated.</FormAlert>}
        {user.has_password && (
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.current_password?.message}
            {...register('current_password')}
          />
        )}
        <div>
          <PasswordField
            label="New password"
            autoComplete="new-password"
            error={errors.new_password?.message}
            {...register('new_password')}
          />
          <PasswordStrengthMeter password={next} />
        </div>
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && (
            <span className="loading loading-sm loading-spinner" aria-hidden="true" />
          )}
          {user.has_password ? 'Update password' : 'Set password'}
        </button>
      </form>
    </SectionCard>
  );
}

function DevicesCard() {
  const devices = useDevices();
  const revoke = useRevokeDevice();
  const logoutAll = useLogoutEverywhere();
  const [confirmAll, setConfirmAll] = useState(false);

  return (
    <SectionCard
      title="Where you are signed in"
      description="Sign out devices you do not recognise."
      bodyClassName="px-2 pb-3"
      action={
        <button
          type="button"
          className="btn btn-ghost text-error btn-sm"
          onClick={() => setConfirmAll(true)}
        >
          <LogOut className="size-4" aria-hidden="true" /> Sign out everywhere
        </button>
      }
    >
      {devices.isPending ? (
        <div className="space-y-2 px-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : devices.isError ? (
        <ErrorState compact error={devices.error} onRetry={() => void devices.refetch()} />
      ) : (
        <ul className="divide-y divide-(--hairline)">
          {devices.data.map((device) => {
            const mobile = /iphone|android|mobile/i.test(device.user_agent ?? '');
            const Icon = mobile ? Smartphone : Monitor;
            return (
              <li key={device.id} className="flex items-center gap-4 px-3 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-base-200">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {device.device_label ?? 'Unknown device'}
                    {device.current && (
                      <span className="badge badge-soft badge-xs badge-primary">This device</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-base-content/55">
                    {device.ip_address ?? 'Unknown location'}, active{' '}
                    {relativeTime(device.last_used_at)}
                  </p>
                </div>
                {!device.current && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => revoke.mutate(device.id)}
                    disabled={revoke.isPending && revoke.variables === device.id}
                  >
                    Sign out
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <ConfirmDialog
        open={confirmAll}
        onClose={() => setConfirmAll(false)}
        title="Sign out on every device?"
        description="You will be signed out here too and need to sign in again."
        confirmLabel="Sign out everywhere"
        tone="error"
        pending={logoutAll.isPending}
        onConfirm={() => logoutAll.mutate()}
      />
    </SectionCard>
  );
}

function AuditLogCard() {
  const fmt = useFormatters();
  const [page, setPage] = useState(1);
  const log = useAuditLog(page);
  return (
    <SectionCard title="Account activity" description="Recent security events on your account.">
      {log.isPending ? (
        <Skeleton className="h-48" />
      ) : log.isError ? (
        <ErrorState compact error={log.error} onRetry={() => void log.refetch()} />
      ) : log.data.items.length === 0 ? (
        <p className="text-sm text-base-content/60">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">When</th>
                  <th scope="col">IP address</th>
                </tr>
              </thead>
              <tbody>
                {log.data.items.map((entry) => (
                  <tr key={entry.id}>
                    <td
                      className={
                        entry.event.includes('failed') || entry.event.includes('reuse')
                          ? 'text-warning'
                          : undefined
                      }
                    >
                      {EVENT_LABELS[entry.event] ?? entry.event.replace(/_/g, ' ')}
                    </td>
                    <td className="whitespace-nowrap text-base-content/70">
                      {fmt.dateTime(entry.created_at)}
                    </td>
                    <td className="tabular text-base-content/70">{entry.ip_address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={log.data.page}
            pages={log.data.pages}
            total={log.data.total}
            pageSize={log.data.page_size}
            onChange={setPage}
          />
        </div>
      )}
    </SectionCard>
  );
}

export function SecuritySection() {
  return (
    <div className="space-y-6">
      <PasswordForm />
      <DevicesCard />
      <AuditLogCard />
    </div>
  );
}
