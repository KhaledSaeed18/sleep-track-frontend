'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { accountApi } from '@/features/account/api';
import { queryKeys } from '@/lib/query-keys';
import { isSafeRedirect } from '@/lib/utils';
import { DEFAULT_AUTHED_ROUTE } from '@/lib/auth/constants';
import { browserTimezone } from '@/lib/date';
import type { User } from '@/types/models';
import { authApi, type LoginInput, type RegisterInput } from '../api';
import { useAuthStore } from '../lib/auth-store';
import { clearSession, establishSession } from '../lib/session';

export function useAuthStatus() {
  return useAuthStore((state) => state.status);
}

/** The signed-in user. Only enabled once the session is established. */
export function useCurrentUser() {
  const status = useAuthStatus();
  return useQuery<User>({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => accountApi.me(signal),
    enabled: status === 'authenticated',
    staleTime: 60_000,
  });
}

/** Non-null user for components rendered inside the authenticated shell. */
export function useUser(): User {
  const { data } = useCurrentUser();
  if (!data) throw new Error('useUser must be used inside the authenticated app shell');
  return data;
}

function useAfterAuth() {
  const router = useRouter();
  return (next?: string | null) => {
    router.replace(isSafeRedirect(next) ? next : DEFAULT_AUTHED_ROUTE);
  };
}

export function useLogin(next?: string | null) {
  const queryClient = useQueryClient();
  const redirect = useAfterAuth();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    meta: { silent: true },
    onSuccess: (auth) => {
      establishSession(queryClient, auth);
      redirect(next);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const redirect = useAfterAuth();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    meta: { silent: true },
    onSuccess: (auth) => {
      establishSession(queryClient, auth);
      redirect('/dashboard?welcome=1');
    },
  });
}

export function useDemoLogin() {
  const queryClient = useQueryClient();
  const redirect = useAfterAuth();
  return useMutation({
    mutationFn: () => authApi.demo(browserTimezone()),
    onSuccess: (auth) => {
      establishSession(queryClient, auth);
      redirect('/dashboard');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      await authApi.logout().catch(() => undefined);
    },
    meta: { silent: true },
    onSettled: () => {
      clearSession(queryClient);
      router.replace('/login');
    },
  });
}

export function useLogoutEverywhere() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      await authApi.logoutAll();
      await authApi.logout().catch(() => undefined);
    },
    onSuccess: () => {
      clearSession(queryClient);
      router.replace('/login?signed_out=all');
    },
  });
}

export function useOAuthProviders() {
  return useQuery({
    queryKey: queryKeys.oauthProviders,
    queryFn: authApi.oauthProviders,
    staleTime: 10 * 60_000,
    meta: { silent: true },
  });
}
