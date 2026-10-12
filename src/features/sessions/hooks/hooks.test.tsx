import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenStore } from '@/lib/auth/token-store';
import { db } from '@/mocks/handlers';
import { server } from '@/mocks/node';
import { createTestQueryClient } from '@/test/utils';
import { useDeleteSession, useSessions } from './index';

function setup() {
  db.currentUserId = db.users[0]!.id;
  tokenStore.set('token', 900);
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe('session hooks', () => {
  it('removes a deleted night from cached lists immediately', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ list: useSessions({ page: 1, page_size: 5 }), remove: useDeleteSession() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.data).toBeDefined());
    const first = result.current.list.data!.items[0]!;
    const total = result.current.list.data!.total;

    server.use(
      http.delete('*/api/v1/sleep/sessions/:id', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return new HttpResponse(null, { status: 204 });
      }),
    );
    act(() => result.current.remove.mutate(first.id));
    await waitFor(() =>
      expect(result.current.list.data!.items.some((item) => item.id === first.id)).toBe(false),
    );
    expect(result.current.list.data!.total).toBe(total - 1);
  });

  it('restores the list when the delete fails', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ list: useSessions({ page: 1, page_size: 5 }), remove: useDeleteSession() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.data).toBeDefined());
    const first = result.current.list.data!.items[0]!;
    server.use(
      http.delete('*/api/v1/sleep/sessions/:id', () =>
        HttpResponse.json(
          { title: 'Server error', status: 500, code: 'internal_error' },
          { status: 500 },
        ),
      ),
    );
    act(() => result.current.remove.mutate(first.id));
    await waitFor(() => expect(result.current.remove.isError).toBe(true));
    expect(result.current.list.data!.items[0]!.id).toBe(first.id);
  });
});
