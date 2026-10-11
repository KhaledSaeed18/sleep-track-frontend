'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { queryKeys, sessionDependentKeys, type SessionFilters } from '@/lib/query-keys';
import type { Page, SleepSession } from '@/types/models';
import { sessionsApi, type SessionInput } from '../api';

export function invalidateSessionData(queryClient: QueryClient) {
  return Promise.all(
    sessionDependentKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

export function useSessions(filters: SessionFilters) {
  return useQuery({
    queryKey: queryKeys.sessions.list(filters),
    queryFn: ({ signal }) => sessionsApi.list(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useSession(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(id ?? ''),
    queryFn: ({ signal }) => sessionsApi.get(id!, signal),
    enabled: !!id,
  });
}

export function useRecentSessions(pageSize = 5) {
  return useSessions({ page: 1, page_size: pageSize, sort: '-started_at' });
}

type ListSnapshot = [readonly unknown[], Page<SleepSession> | undefined][];

function removeFromLists(queryClient: QueryClient, ids: Set<string>): ListSnapshot {
  const snapshot = queryClient.getQueriesData<Page<SleepSession>>({
    queryKey: queryKeys.sessions.lists(),
  });
  for (const [key, page] of snapshot) {
    if (!page) continue;
    const items = page.items.filter((item) => !ids.has(item.id));
    const removed = page.items.length - items.length;
    queryClient.setQueryData<Page<SleepSession>>(key, {
      ...page,
      items,
      total: Math.max(0, page.total - removed),
    });
  }
  return snapshot;
}

function restoreLists(queryClient: QueryClient, snapshot: ListSnapshot | undefined) {
  for (const [key, page] of snapshot ?? []) queryClient.setQueryData(key, page);
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SessionInput) => sessionsApi.create(input),
    meta: { silent: true, successMessage: 'Night logged' },
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.sessions.detail(session.id), session);
    },
    onSettled: () => invalidateSessionData(queryClient),
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SessionInput> }) =>
      sessionsApi.update(id, input),
    meta: { silent: true, successMessage: 'Changes saved' },
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.sessions.detail(session.id), session);
      for (const [key, page] of queryClient.getQueriesData<Page<SleepSession>>({
        queryKey: queryKeys.sessions.lists(),
      })) {
        if (!page) continue;
        queryClient.setQueryData<Page<SleepSession>>(key, {
          ...page,
          items: page.items.map((item) => (item.id === session.id ? session : item)),
        });
      }
    },
    onSettled: () => invalidateSessionData(queryClient),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    meta: { successMessage: 'Night deleted' },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.lists() });
      return { snapshot: removeFromLists(queryClient, new Set([id])) };
    },
    onError: (_error, _id, context) => restoreLists(queryClient, context?.snapshot),
    onSuccess: (_data, id) =>
      queryClient.removeQueries({ queryKey: queryKeys.sessions.detail(id) }),
    onSettled: () => invalidateSessionData(queryClient),
  });
}

export function useBulkDeleteSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => sessionsApi.bulkRemove(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.lists() });
      return { snapshot: removeFromLists(queryClient, new Set(ids)) };
    },
    onError: (_error, _ids, context) => restoreLists(queryClient, context?.snapshot),
    onSettled: () => invalidateSessionData(queryClient),
  });
}
