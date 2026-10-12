import { api, unwrap } from '@/lib/api';

export const reportsApi = {
  weekly: (weekStart?: string, signal?: AbortSignal) =>
    unwrap(
      api.GET('/api/v1/reports/weekly', {
        params: { query: weekStart ? { week_start: weekStart } : {} },
        signal,
      }),
    ),
  email: (weekStart?: string) =>
    unwrap(
      api.POST('/api/v1/reports/weekly/email', {
        body: weekStart ? { week_start: weekStart } : {},
      }),
    ),
};
