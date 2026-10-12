import { api, unwrap } from '@/lib/api';
import type { DateRange } from '@/lib/query-keys';

export const insightsApi = {
  list: (query: Partial<DateRange> = {}, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/insights', { params: { query }, signal })),
};
