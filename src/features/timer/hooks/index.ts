'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStatus } from '@/features/auth';
import { invalidateSessionData } from '@/features/sessions/hooks';
import { browserTimezone } from '@/lib/date';
import { queryKeys } from '@/lib/query-keys';
import type { SleepSession, TimerState } from '@/types/models';
import { timerApi, type TimerStopInput } from '../api';

export function useTimer() {
  const status = useAuthStatus();
  return useQuery({
    queryKey: queryKeys.timer,
    queryFn: ({ signal }) => timerApi.get(signal),
    enabled: status === 'authenticated',
    refetchInterval: 60_000,
    staleTime: 15_000,
    meta: { silent: true },
  });
}

export function useStartTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { timezone?: string; started_at?: string } = {}) =>
      timerApi.start({ timezone: input.timezone ?? browserTimezone(), ...input }),
    meta: { successMessage: 'Sleep timer started. Sleep well.' },
    onSuccess: (session: SleepSession) => {
      queryClient.setQueryData<TimerState>(queryKeys.timer, { active: true, session });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.timer }),
  });
}

export function useStopTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TimerStopInput) => timerApi.stop(input),
    meta: { silent: true, successMessage: 'Good morning. Your night is logged.' },
    onSuccess: () => {
      queryClient.setQueryData<TimerState>(queryKeys.timer, { active: false, session: null });
    },
    onSettled: () => invalidateSessionData(queryClient),
  });
}

export function useCancelTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => timerApi.cancel(),
    meta: { successMessage: 'Timer discarded' },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.timer });
      const previous = queryClient.getQueryData<TimerState>(queryKeys.timer);
      queryClient.setQueryData<TimerState>(queryKeys.timer, { active: false, session: null });
      return { previous };
    },
    onError: (_error, _input, context) =>
      queryClient.setQueryData(queryKeys.timer, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.timer }),
  });
}
