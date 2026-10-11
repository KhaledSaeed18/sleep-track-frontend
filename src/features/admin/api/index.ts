import { api, unwrap } from '@/lib/api';
import type { Role } from '@/types/models';

export interface AdminUserQuery {
  page?: number;
  page_size?: number;
  q?: string;
  role?: Role;
  is_active?: boolean;
}

export const adminApi = {
  stats: (signal?: AbortSignal) => unwrap(api.GET('/api/v1/admin/stats', { signal })),
  users: (query: AdminUserQuery, signal?: AbortSignal) =>
    unwrap(api.GET('/api/v1/admin/users', { params: { query }, signal })),
  updateUser: (id: string, body: { is_active?: boolean; role?: Role }) =>
    unwrap(api.PATCH('/api/v1/admin/users/{id}', { params: { path: { id } }, body })),
};
