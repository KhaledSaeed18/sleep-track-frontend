import { api, unwrap } from '@/lib/api';
import type { Goal } from '@/types/models';

export type GoalInput = Omit<Goal, 'recommended'>;

export const goalsApi = {
  get: (signal?: AbortSignal) => unwrap(api.GET('/api/v1/goals', { signal })),
  update: (body: GoalInput) => unwrap(api.PUT('/api/v1/goals', { body })),
};
