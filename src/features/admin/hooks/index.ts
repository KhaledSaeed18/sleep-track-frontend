'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { AdminUser, Page } from '@/types/models';
import { adminApi, type AdminUserQuery } from '../api';

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: ({ signal }) => adminApi.stats(signal),
  });
}

export function useAdminUsers(query: AdminUserQuery) {
  return useQuery({
    queryKey: queryKeys.admin.users({ ...query }),
    queryFn: ({ signal }) => adminApi.users(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { is_active?: boolean; role?: 'user' | 'admin' };
    }) => adminApi.updateUser(id, input),
    meta: { successMessage: 'User updated' },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: [...queryKeys.admin.all, 'users'] });
      const snapshot = queryClient.getQueriesData<Page<AdminUser>>({
        queryKey: [...queryKeys.admin.all, 'users'],
      });
      for (const [key, page] of snapshot) {
        if (page)
          queryClient.setQueryData(key, {
            ...page,
            items: page.items.map((user) => (user.id === id ? { ...user, ...input } : user)),
          });
      }
      return { snapshot };
    },
    onError: (_error, _vars, context) => {
      for (const [key, page] of context?.snapshot ?? []) queryClient.setQueryData(key, page);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
  });
}
