// @vitest-environment node
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { http, passthrough } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/node';
import { proxyToApi } from './upstream-proxy';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('API_INTERNAL_URL', 'http://api.internal:8000/');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function lastCall() {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  return { url: String(url), init: init!, headers: new Headers(init!.headers) };
}

describe('proxyToApi', () => {
  it('forwards path, query, method and the client address', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    const request = new Request('http://localhost:3000/api/v1/sleep-sessions?page=2', {
      headers: {
        host: 'localhost:3000',
        'x-forwarded-for': '203.0.113.7',
        connection: 'keep-alive',
        authorization: 'Bearer token',
      },
    });

    await proxyToApi(request);

    const { url, init, headers } = lastCall();
    expect(url).toBe('http://api.internal:8000/api/v1/sleep-sessions?page=2');
    expect(init.method).toBe('GET');
    expect(init.redirect).toBe('manual');
    expect(init.body).toBeUndefined();
    expect(headers.get('x-forwarded-for')).toBe('203.0.113.7');
    expect(headers.get('x-forwarded-host')).toBe('localhost:3000');
    expect(headers.get('x-forwarded-proto')).toBe('http');
    expect(headers.get('authorization')).toBe('Bearer token');
    expect(headers.get('connection')).toBeNull();
    expect(headers.get('accept-encoding')).toBe('identity');
  });

  it('streams request bodies for unsafe methods', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    const request = new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.co' }),
    });

    await proxyToApi(request);

    const { init } = lastCall();
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(ReadableStream);
    expect((init as RequestInit & { duplex?: string }).duplex).toBe('half');
  });

  it('keeps every Set-Cookie header separate and passes redirects through', async () => {
    const upstreamHeaders = new Headers({ location: 'https://accounts.example.com/o/auth' });
    upstreamHeaders.append('set-cookie', 'st_refresh=abc; Path=/api/v1/auth; HttpOnly');
    upstreamHeaders.append('set-cookie', 'st_csrf=def; Path=/');
    upstreamHeaders.append('set-cookie', 'st_session=1; Path=/');
    fetchMock.mockResolvedValue(new Response(null, { status: 302, headers: upstreamHeaders }));

    const response = await proxyToApi(
      new Request('http://localhost:3000/api/v1/auth/oauth/google'),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://accounts.example.com/o/auth');
    expect(response.headers.getSetCookie()).toEqual([
      'st_refresh=abc; Path=/api/v1/auth; HttpOnly',
      'st_csrf=def; Path=/',
      'st_session=1; Path=/',
    ]);
  });

  it('drops encoding headers the runtime has already handled', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-encoding': 'gzip', 'content-type': 'application/json' },
      }),
    );

    const response = await proxyToApi(new Request('http://localhost:3000/api/v1/meta'));

    expect(response.headers.get('content-encoding')).toBeNull();
    expect(response.headers.get('content-type')).toBe('application/json');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('answers with a problem response when the API is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const response = await proxyToApi(new Request('http://localhost:3000/api/v1/meta'));

    expect(response.status).toBe(502);
    expect(response.headers.get('content-type')).toBe('application/problem+json');
    await expect(response.json()).resolves.toMatchObject({ code: 'upstream_unavailable' });
  });

  it('passes a 401 to a streamed POST through against a real server', async () => {
    const upstream = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk: Buffer) => (body += chunk.toString()));
      req.on('end', () => {
        res.writeHead(401, { 'content-type': 'application/problem+json' });
        res.end(JSON.stringify({ status: 401, cookie: req.headers.cookie ?? null, body }));
      });
    });
    await new Promise<void>((resolve) => upstream.listen(0, '127.0.0.1', resolve));
    const { port } = upstream.address() as AddressInfo;
    const origin = `http://127.0.0.1:${String(port)}`;
    // Use the real fetch, which is where the 401 handling lives, and let it reach the server.
    vi.unstubAllGlobals();
    server.use(http.all(`${origin}/*`, () => passthrough()));
    vi.stubEnv('API_INTERNAL_URL', origin);

    try {
      const response = await proxyToApi(
        new Request('http://localhost:3000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: 'st_csrf=abc' },
          body: JSON.stringify({ email: 'a@b.co', password: 'wrong' }),
        }),
      );

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        status: 401,
        cookie: 'st_csrf=abc',
        body: JSON.stringify({ email: 'a@b.co', password: 'wrong' }),
      });
    } finally {
      await new Promise((resolve) => upstream.close(resolve));
    }
  });
});
