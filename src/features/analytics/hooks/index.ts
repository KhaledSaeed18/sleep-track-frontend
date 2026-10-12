'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys, type DateRange } from '@/lib/query-keys';
import { analyticsApi } from '../api';

const shared = { placeholderData: keepPreviousData, staleTime: 60_000 } as const;

export function useOverview(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.analytics.overview(range),
    queryFn: ({ signal }) => analyticsApi.overview(range, signal),
    ...shared,
  });
}

export function useDaily(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.analytics.daily(range),
    queryFn: ({ signal }) => analyticsApi.daily(range, signal),
    ...shared,
  });
}

export function useWeekday(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.analytics.weekday(range),
    queryFn: ({ signal }) => analyticsApi.weekday(range, signal),
    ...shared,
  });
}

export function useTagImpact(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.analytics.tags(range),
    queryFn: ({ signal }) => analyticsApi.tags(range, signal),
    ...shared,
  });
}

export function useDistribution(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.analytics.distribution(range),
    queryFn: ({ signal }) => analyticsApi.distribution(range, signal),
    ...shared,
  });
}

export function useChronotype(range: DateRange) {
  return useQuery({
    queryKey: queryKeys.analytics.chronotype(range),
    queryFn: ({ signal }) => analyticsApi.chronotype(range, signal),
    ...shared,
  });
}
