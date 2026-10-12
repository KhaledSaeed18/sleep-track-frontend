'use client';

import { Search, ShieldCheck, Users } from 'lucide-react';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { ChartCard, DataTable } from '@/components/charts/chart-card';
import { ChartSkeleton, TrendChart } from '@/components/charts';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { StatTiles } from '@/features/analytics/components/stat-tiles';
import { useUser } from '@/features/auth';
import { useFormatters } from '@/hooks/use-preferences';
import { formatLocalDate, relativeTime } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAdminStats, useAdminUsers, useUpdateAdminUser } from '../hooks';

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function StatsSection() {
  const stats = useAdminStats();
  const s = stats.data;
  return (
    <div className="space-y-6">
      <StatTiles
        loading={stats.isPending}
        tiles={[
          {
            label: 'Users',
            value: formatNumber(s?.users_total),
            hint: `${formatNumber(s?.users_new_7d)} new this week`,
          },
          {
            label: 'Active this week',
            value: formatNumber(s?.users_active_7d),
            hint: s
              ? `${String(Math.round((s.users_active_7d / Math.max(1, s.users_total)) * 100))}% of users`
              : undefined,
          },
          {
            label: 'Nights logged',
            value: formatNumber(s?.sessions_total),
            hint: `${formatNumber(s?.sessions_7d)} this week`,
          },
        ]}
      />
      <ChartCard
        title="Sign-ups"
        description="New accounts per day, last 30 days"
        summary={`${String(s?.signups_daily.reduce((sum, d) => sum + d.count, 0) ?? 0)} sign-ups in the last 30 days.`}
        chart={
          stats.isPending ? (
            <ChartSkeleton height={220} />
          ) : stats.isError ? (
            <ErrorState compact error={stats.error} />
          ) : (
            <TrendChart
              kind="bar"
              series={1}
              height={220}
              data={s?.signups_daily.map((d) => ({ date: d.date, value: d.count })) ?? []}
              format={(v) => String(v)}
              valueLabel="Sign-ups"
            />
          )
        }
        table={
          <DataTable
            columns={['Day', 'Sign-ups']}
            rows={(s?.signups_daily ?? []).map((d) => [
              formatLocalDate(d.date, 'EEE, MMM d'),
              d.count,
            ])}
          />
        }
      />
    </div>
  );
}

function UsersSection() {
  const me = useUser();
  const fmt = useFormatters();
  const update = useUpdateAdminUser();
  const [state, setState] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      role: parseAsStringLiteral(['all', 'user', 'admin']).withDefault('all'),
      status: parseAsStringLiteral(['all', 'active', 'inactive']).withDefault('all'),
      page: parseAsInteger.withDefault(1),
    },
    { history: 'replace', clearOnDefault: true },
  );
  const [search, setSearch] = useState(state.q);
  const debounced = useDebounced(search);
  useEffect(() => {
    if (debounced !== state.q) void setState({ q: debounced, page: 1 });
  }, [debounced, state.q, setState]);

  const users = useAdminUsers({
    page: state.page,
    page_size: 20,
    ...(state.q ? { q: state.q } : {}),
    ...(state.role !== 'all' ? { role: state.role } : {}),
    ...(state.status !== 'all' ? { is_active: state.status === 'active' } : {}),
  });

  return (
    <section className="surface overflow-hidden" aria-labelledby="users-title">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="users-title" className="text-base font-semibold">
          Users
        </h2>
        <div className="flex flex-wrap gap-2">
          <label className="input w-full input-sm sm:w-56">
            <Search className="size-4 text-base-content/45" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search users"
            />
          </label>
          <select
            className="select w-auto select-sm"
            value={state.role}
            onChange={(event) =>
              void setState({ role: event.target.value as typeof state.role, page: 1 })
            }
            aria-label="Role"
          >
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            className="select w-auto select-sm"
            value={state.status}
            onChange={(event) =>
              void setState({ status: event.target.value as typeof state.status, page: 1 })
            }
            aria-label="Status"
          >
            <option value="all">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>
      </div>
      {users.isPending ? (
        <div className="space-y-2 px-5 pb-5">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : users.isError ? (
        <ErrorState error={users.error} onRetry={() => void users.refetch()} />
      ) : users.data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match"
          description="Try a different search or filter."
        />
      ) : (
        <>
          <div
            className={cn(
              'overflow-x-auto transition-opacity',
              users.isPlaceholderData && 'opacity-60',
            )}
          >
            <table className="table">
              <thead>
                <tr className="text-base-content/60">
                  <th scope="col">User</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Last sign-in</th>
                  <th scope="col">Nights</th>
                  <th scope="col">Role</th>
                  <th scope="col">Active</th>
                </tr>
              </thead>
              <tbody>
                {users.data.items.map((user) => {
                  const self = user.id === me.id;
                  return (
                    <tr key={user.id} className={cn(!user.is_active && 'opacity-60')}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            firstName={user.first_name}
                            lastName={user.last_name}
                            src={user.avatar_url}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-medium">
                              {user.full_name}
                              {self && <span className="badge badge-ghost badge-xs">You</span>}
                              {user.is_demo && (
                                <span className="badge badge-soft badge-xs badge-secondary">
                                  Demo
                                </span>
                              )}
                            </p>
                            <p className="truncate text-sm text-base-content/55">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-base-content/70">
                        {fmt.pattern(user.created_at, 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap text-base-content/70">
                        {user.last_login_at ? relativeTime(user.last_login_at) : 'Never'}
                      </td>
                      <td className="tabular">{formatNumber(user.sessions_count)}</td>
                      <td>
                        <select
                          className="select w-24 select-xs"
                          value={user.role}
                          disabled={self}
                          aria-label={`Role for ${user.full_name}`}
                          onChange={(event) =>
                            update.mutate({
                              id: user.id,
                              input: { role: event.target.value as 'user' | 'admin' },
                            })
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-success"
                          checked={user.is_active}
                          disabled={self}
                          aria-label={`${user.is_active ? 'Deactivate' : 'Activate'} ${user.full_name}`}
                          onChange={(event) =>
                            update.mutate({
                              id: user.id,
                              input: { is_active: event.target.checked },
                            })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-(--hairline) px-5 py-3">
            <Pagination
              page={users.data.page}
              pages={users.data.pages}
              total={users.data.total}
              pageSize={users.data.page_size}
              onChange={(page) => void setState({ page })}
            />
          </div>
        </>
      )}
    </section>
  );
}

export function AdminView() {
  const user = useUser();
  if (user.role !== 'admin') {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Admins only"
        description="You do not have access to this area."
      />
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Admin" description="Usage across SleepTrack and account management." />
      <StatsSection />
      <UsersSection />
    </div>
  );
}
