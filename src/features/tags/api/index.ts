import { api, unwrap } from '@/lib/api';

export interface TagInput {
  name: string;
  color: string;
  icon?: string | null;
}

export const tagsApi = {
  list: (signal?: AbortSignal) => unwrap(api.GET('/api/v1/tags', { signal })),
  create: (body: TagInput) => unwrap(api.POST('/api/v1/tags', { body })),
  update: (id: string, body: Partial<TagInput>) =>
    unwrap(api.PATCH('/api/v1/tags/{id}', { params: { path: { id } }, body })),
  remove: (id: string) => unwrap(api.DELETE('/api/v1/tags/{id}', { params: { path: { id } } })),
};
