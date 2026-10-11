import { api, unwrap } from '@/lib/api';
import type { SessionFilters } from '@/lib/query-keys';

export interface SessionInput {
  started_at: string;
  ended_at: string;
  quality?: number | null;
  mood_on_wake?: number | null;
  sleep_latency_minutes?: number | null;
  awakenings?: number | null;
  notes?: string | null;
  tag_ids?: string[];
  timezone?: string;
}

export const sessionsApi = {
  list: (query: SessionFilters, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/sleep/sessions', { params: { query }, signal })),
  get: (id: string, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/sleep/sessions/{id}', { params: { path: { id } }, signal })),
  create: (body: SessionInput) => unwrap(api.POST('/api/v1/sleep/sessions', { body })),
  update: (id: string, body: Partial<SessionInput>) =>
    unwrap(api.PATCH('/api/v1/sleep/sessions/{id}', { params: { path: { id } }, body })),
  remove: (id: string) =>
    unwrap(api.DELETE('/api/v1/sleep/sessions/{id}', { params: { path: { id } } })),
  bulkRemove: (ids: string[]) =>
    unwrap(api.POST('/api/v1/sleep/sessions/bulk-delete', { body: { ids } })),
};
