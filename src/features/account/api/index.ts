import { api, apiRequest, unwrap, API_PREFIX } from '@/lib/api';
import type { ImportResult, Preferences, User } from '@/types/models';

export type ProfileInput = Partial<
  Pick<User, 'first_name' | 'last_name' | 'date_of_birth' | 'avatar_url'>
>;

function filenameFrom(response: Response, fallback: string): string {
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
}

export const accountApi = {
  me: (signal?: AbortSignal) => unwrap(api.GET('/api/v1/users/me', { signal })),
  updateProfile: (body: ProfileInput) => unwrap(api.PATCH('/api/v1/users/me', { body })),
  updatePreferences: (body: Partial<Preferences>) =>
    unwrap(api.PATCH('/api/v1/users/me/preferences', { body })),
  changePassword: (body: { current_password: string | null; new_password: string }) =>
    unwrap(api.POST('/api/v1/users/me/change-password', { body })),
  devices: (signal?: AbortSignal) => unwrap(api.GET('/api/v1/users/me/sessions', { signal })),
  revokeDevice: (id: string) =>
    unwrap(
      api.DELETE('/api/v1/users/me/sessions/{session_id}', {
        params: { path: { session_id: id } },
      }),
    ),
  auditLog: (page: number, signal?: AbortSignal) =>
    unwrap(
      api.GET('/api/v1/users/me/audit-log', { params: { query: { page, page_size: 15 } }, signal }),
    ),
  deleteAccount: (body: { password?: string | null; confirm: 'DELETE' }) =>
    unwrap(api.DELETE('/api/v1/users/me', { body })),

  async exportData(format: 'json' | 'csv'): Promise<{ blob: Blob; filename: string }> {
    const response = await apiRequest(`${API_PREFIX}/users/me/export?format=${format}`);
    return {
      blob: await response.blob(),
      filename: filenameFrom(response, `sleeptrack-export.${format}`),
    };
  },

  async importCsv(file: File): Promise<ImportResult> {
    const body = new FormData();
    body.append('file', file);
    const response = await apiRequest(`${API_PREFIX}/users/me/import`, { method: 'POST', body });
    return (await response.json()) as ImportResult;
  },
};
