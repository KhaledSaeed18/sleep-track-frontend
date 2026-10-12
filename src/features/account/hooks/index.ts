'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clearSession } from '@/features/auth';
import { authApi } from '@/features/auth/api';
import { queryKeys } from '@/lib/query-keys';
import type { Preferences, User } from '@/types/models';
import { accountApi, type ProfileInput } from '../api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => accountApi.updateProfile(input),
    meta: { silent: true, successMessage: 'Profile saved' },
    onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user),
  });
}

export function useUpdatePreferences(options: { silent?: boolean } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Preferences>) => accountApi.updatePreferences(input),
    meta: options.silent ? { silent: true } : { successMessage: 'Preferences saved' },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.me });
      const previous = queryClient.getQueryData<User>(queryKeys.me);
      if (previous) {
        queryClient.setQueryData<User>(queryKeys.me, {
          ...previous,
          preferences: { ...previous.preferences, ...input },
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.me, context.previous);
    },
    onSuccess: (preferences, input) => {
      queryClient.setQueryData<User>(queryKeys.me, (user) =>
        user ? { ...user, preferences } : user,
      );
      if (input.timezone || input.week_starts_on) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: accountApi.changePassword,
    meta: { silent: true, successMessage: 'Password updated. Other devices were signed out.' },
  });
}

export function useDevices() {
  return useQuery({
    queryKey: queryKeys.account.devices(),
    queryFn: ({ signal }) => accountApi.devices(signal),
  });
}

export function useRevokeDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.revokeDevice(id),
    meta: { successMessage: 'Device signed out' },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.account.all }),
  });
}

export function useAuditLog(page: number) {
  return useQuery({
    queryKey: queryKeys.account.auditLog(page),
    queryFn: ({ signal }) => accountApi.auditLog(page, signal),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
    meta: { successMessage: 'Verification email sent. Check your inbox.' },
  });
}

export function useExportData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (format: 'json' | 'csv') => accountApi.exportData(format),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.account.all }),
  });
}

export function useImportData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => accountApi.importCsv(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApi.deleteAccount,
    meta: { silent: true },
    onSuccess: () => clearSession(queryClient, '/login?deleted=1'),
  });
}
