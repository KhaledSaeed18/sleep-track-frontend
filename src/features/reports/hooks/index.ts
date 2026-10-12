'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { reportsApi } from '../api';

export function useWeeklyReport(weekStart?: string) {
  return useQuery({
    queryKey: queryKeys.reports.weekly(weekStart),
    queryFn: ({ signal }) => reportsApi.weekly(weekStart, signal),
    placeholderData: keepPreviousData,
  });
}

export function useEmailReport() {
  return useMutation({
    mutationFn: (weekStart?: string) => reportsApi.email(weekStart),
    meta: { successMessage: 'Report on its way. Check your inbox in a minute.' },
  });
}
