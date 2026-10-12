'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { Tag } from '@/types/models';
import { tagsApi, type TagInput } from '../api';

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: ({ signal }) => tagsApi.list(signal),
    staleTime: 5 * 60_000,
    select: (tags: Tag[]) => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TagInput) => tagsApi.create(input),
    meta: { silent: true, successMessage: 'Tag created' },
    onSuccess: (tag) => {
      queryClient.setQueryData<Tag[]>(queryKeys.tags, (tags) => (tags ? [...tags, tag] : [tag]));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TagInput> }) =>
      tagsApi.update(id, input),
    meta: { silent: true, successMessage: 'Tag updated' },
    onSuccess: (tag) => {
      queryClient.setQueryData<Tag[]>(queryKeys.tags, (tags) =>
        tags?.map((item) => (item.id === tag.id ? tag : item)),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tags });
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    meta: { successMessage: 'Tag deleted' },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tags });
      const previous = queryClient.getQueryData<Tag[]>(queryKeys.tags);
      queryClient.setQueryData<Tag[]>(queryKeys.tags, (tags) =>
        tags?.filter((tag) => tag.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(queryKeys.tags, context?.previous),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tags });
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}
