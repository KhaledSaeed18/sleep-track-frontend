'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys, type DateRange } from '@/lib/query-keys';
import { insightsApi } from '../api';

export function useInsights(range?: DateRange) {
  return useQuery({
    queryKey: queryKeys.insights(range),
    queryFn: ({ signal }) => insightsApi.list(range ?? {}, signal),
    staleTime: 5 * 60_000,
  });
}
