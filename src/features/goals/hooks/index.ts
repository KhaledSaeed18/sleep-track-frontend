'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { goalsApi, type GoalInput } from '../api';

export function useGoal() {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: ({ signal }) => goalsApi.get(signal),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GoalInput) => goalsApi.update(input),
    meta: { silent: true, successMessage: 'Goals saved' },
    onSuccess: (goal) => queryClient.setQueryData(queryKeys.goals, goal),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      await queryClient.invalidateQueries({ queryKey: ['insights'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}
