import type { LocalDate } from '@/types/models';

export interface DateRange {
  from: LocalDate;
  to: LocalDate;
}

export interface SessionFilters {
  from?: LocalDate;
  to?: LocalDate;
  min_quality?: number;
  max_quality?: number;
  tag_ids?: string;
  q?: string;
  sort?: string;
  status?: 'in_progress' | 'completed';
  page?: number;
  page_size?: number;
}

export const queryKeys = {
  meta: ['meta'] as const,
  oauthProviders: ['oauth-providers'] as const,
  me: ['users', 'me'] as const,
  account: {
    all: ['account'] as const,
    devices: () => [...queryKeys.account.all, 'devices'] as const,
    auditLog: (page: number) => [...queryKeys.account.all, 'audit-log', page] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (filters: SessionFilters) => [...queryKeys.sessions.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.sessions.all, 'detail', id] as const,
  },
  timer: ['timer'] as const,
  tags: ['tags'] as const,
  goals: ['goals'] as const,
  analytics: {
    all: ['analytics'] as const,
    overview: (range: DateRange) => [...queryKeys.analytics.all, 'overview', range] as const,
    daily: (range: DateRange) => [...queryKeys.analytics.all, 'daily', range] as const,
    weekday: (range: DateRange) => [...queryKeys.analytics.all, 'weekday', range] as const,
    tags: (range: DateRange) => [...queryKeys.analytics.all, 'tags', range] as const,
    distribution: (range: DateRange) =>
      [...queryKeys.analytics.all, 'distribution', range] as const,
    chronotype: (range: DateRange) => [...queryKeys.analytics.all, 'chronotype', range] as const,
  },
  insights: (range?: DateRange) => ['insights', range ?? 'default'] as const,
  reports: {
    all: ['reports'] as const,
    weekly: (weekStart?: LocalDate) =>
      [...queryKeys.reports.all, 'weekly', weekStart ?? 'last'] as const,
  },
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    users: (params: Record<string, unknown>) => [...queryKeys.admin.all, 'users', params] as const,
  },
};

/** Keys whose data depends on sleep sessions and must be refreshed after any session change. */
export const sessionDependentKeys = [
  queryKeys.sessions.all,
  queryKeys.analytics.all,
  ['insights'],
  queryKeys.reports.all,
  queryKeys.tags,
  queryKeys.timer,
] as const;
