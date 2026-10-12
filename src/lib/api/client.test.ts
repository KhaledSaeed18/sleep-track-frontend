import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { accountApi } from '@/features/account/api';
import { authApi } from '@/features/auth/api';
import { authEvents } from '@/lib/auth/events';
import { tokenStore } from '@/lib/auth/token-store';
import { db } from '@/mocks/handlers';
import { publicUser } from '@/mocks/db';
import { server } from '@/mocks/node';
import { ApiError } from './errors';

function signedInCookies() {
  document.cookie = 'st_session=1; Path=/';
  document.cookie = 'st_csrf=csrf-123; Path=/';
}

function authBody(token: string) {
  return {
    access_token: token,
    token_type: 'bearer',
    expires_in: 900,
    user: publicUser(db.users[0]!),
  };
}

describe('authFetch', () => {
  it('attaches the bearer token', async () => {
    tokenStore.set('token-a', 900);
    let seen: string | null = null;
    server.use(
      http.get('*/api/v1/users/me', ({ request }) => {
        seen = request.headers.get('Authorization');
        return HttpResponse.json(publicUser(db.users[0]!));
      }),
    );
    await accountApi.me();
    expect(seen).toBe('Bearer token-a');
  });

  it('refreshes once for concurrent 401s and replays each request', async () => {
    signedInCookies();
    tokenStore.set('expired', 900);
    let refreshes = 0;
    let csrf: string | null = null;
    server.use(
      http.post('*/api/v1/auth/refresh', async ({ request }) => {
        refreshes += 1;
        csrf = request.headers.get('X-CSRF-Token');
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json(authBody('fresh'));
      }),
      http.get('*/api/v1/users/me', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh'
          ? HttpResponse.json(publicUser(db.users[0]!))
          : HttpResponse.json(
              { title: 'Not authenticated', status: 401, code: 'not_authenticated' },
              { status: 401 },
            ),
      ),
    );

    const results = await Promise.all([accountApi.me(), accountApi.me(), accountApi.me()]);
    expect(results.every((user) => user.email === db.users[0]!.email)).toBe(true);
    expect(refreshes).toBe(1);
    expect(csrf).toBe('csrf-123');
    expect(tokenStore.get()).toBe('fresh');
  });

  it('refreshes up front when the token is missing but a session hint exists', async () => {
    signedInCookies();
    const refresh = vi.fn(() => HttpResponse.json(authBody('fresh')));
    server.use(
      http.post('*/api/v1/auth/refresh', refresh),
      http.get('*/api/v1/users/me', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh'
          ? HttpResponse.json(publicUser(db.users[0]!))
          : HttpResponse.json(
              { title: 'Nope', status: 401, code: 'not_authenticated' },
              { status: 401 },
            ),
      ),
    );
    await accountApi.me();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('emits expired and surfaces the 401 when the refresh is rejected', async () => {
    signedInCookies();
    tokenStore.set('expired', 900);
    const expired = vi.fn();
    const off = authEvents.on('expired', expired);
    server.use(
      http.post('*/api/v1/auth/refresh', () =>
        HttpResponse.json(
          { title: 'Token invalid', status: 401, code: 'token_invalid' },
          { status: 401 },
        ),
      ),
      http.get('*/api/v1/users/me', () =>
        HttpResponse.json(
          { title: 'Not authenticated', status: 401, code: 'not_authenticated' },
          { status: 401 },
        ),
      ),
    );
    await expect(accountApi.me()).rejects.toMatchObject({ status: 401, code: 'not_authenticated' });
    expect(expired).toHaveBeenCalled();
    expect(tokenStore.get()).toBeNull();
    off();
  });

  it('never refreshes for credential endpoints', async () => {
    signedInCookies();
    const refresh = vi.fn(() => HttpResponse.json(authBody('fresh')));
    server.use(http.post('*/api/v1/auth/refresh', refresh));
    const error = await authApi
      .login({ email: 'demo@sleeptrack.app', password: 'wrong' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('invalid_credentials');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('wraps network failures', async () => {
    tokenStore.set('token', 900);
    server.use(http.get('*/api/v1/users/me', () => HttpResponse.error()));
    await expect(accountApi.me()).rejects.toMatchObject({ code: 'network_error' });
  });
});
