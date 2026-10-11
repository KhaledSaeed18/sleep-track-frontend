import { api, unwrap } from '@/lib/api';
import type { DateRange } from '@/lib/query-keys';

export const analyticsApi = {
  overview: (query: DateRange, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/analytics/overview', { params: { query }, signal })),
  daily: (query: DateRange, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/analytics/daily', { params: { query }, signal })),
  weekday: (query: DateRange, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/analytics/weekday', { params: { query }, signal })),
  tags: (query: DateRange, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/analytics/tags', { params: { query }, signal })),
  distribution: (query: DateRange, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/analytics/distribution', { params: { query }, signal })),
  chronotype: (query: DateRange, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/analytics/chronotype', { params: { query }, signal })),
};
