import { api, unwrap } from '@/lib/api';
import type { SessionInput } from '@/features/sessions/api';

export type TimerStopInput = Partial<Omit<SessionInput, 'started_at' | 'timezone'>>;

export const timerApi = {
  get: (signal?: AbortSignal) => unwrap(api.GET('/api/v1/sleep/timer', { signal })),
  start: (body: { timezone?: string; started_at?: string }) =>
    unwrap(api.POST('/api/v1/sleep/timer/start', { body })),
  stop: (body: TimerStopInput) => unwrap(api.POST('/api/v1/sleep/timer/stop', { body })),
  cancel: () => unwrap(api.DELETE('/api/v1/sleep/timer')),
};
