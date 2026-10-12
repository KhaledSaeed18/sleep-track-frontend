import { internalApiUrl } from './base-url';

/** Headers that describe a single connection and must not be forwarded by a proxy (RFC 9110 §7.6.1). */
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

const UPSTREAM_TIMEOUT_MS = 30_000;

function forwardedRequestHeaders(request: Request, clientAddress: string | null): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key)) headers.set(key, value);
  });
  const url = new URL(request.url);
  headers.set('x-forwarded-host', request.headers.get('host') ?? url.host);
  headers.set('x-forwarded-proto', url.protocol.replace(':', ''));
  if (clientAddress) headers.set('x-forwarded-for', clientAddress);
  // The hop to the API is internal; skip compression so bodies stream through untouched.
  headers.set('accept-encoding', 'identity');
  return headers;
}

function forwardedResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key) || key === 'content-encoding' || key === 'set-cookie') return;
    headers.set(key, value);
  });
  // Each cookie must stay a separate header; joining them would corrupt the auth cookies.
  for (const cookie of upstream.headers.getSetCookie()) headers.append('set-cookie', cookie);
  return headers;
}

function badGateway(): Response {
  return Response.json(
    {
      type: 'about:blank',
      title: 'Bad Gateway',
      status: 502,
      detail: 'The SleepTrack API is unreachable. Please try again shortly.',
      code: 'upstream_unavailable',
    },
    { status: 502, headers: { 'content-type': 'application/problem+json' } },
  );
}

/**
 * Streams a same-origin `/api/*` request to the API and its response back.
 *
 * A route handler is used instead of a `rewrites()` entry because Next.js does not add
 * `X-Forwarded-For` to rewritten requests, which would make every user share the API's per-IP
 * rate limits and record the proxy's address in the security log. It also lets the API address be
 * configured at runtime rather than baked into the build.
 */
export async function proxyToApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const target = `${internalApiUrl()}${url.pathname}${url.search}`;
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: forwardedRequestHeaders(request, request.headers.get('x-forwarded-for')),
      body: hasBody ? request.body : undefined,
      redirect: 'manual',
      cache: 'no-store',
      // Cookies are forwarded explicitly. With credentials enabled, Node's fetch applies the
      // browser's 401 re-authentication step and fails any 401 to a streamed body.
      credentials: 'omit',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]),
      // Required by Node's fetch to stream a request body.
      ...(hasBody ? { duplex: 'half' } : {}),
    } as RequestInit);
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error('API proxy request failed', { target, error });
    return badGateway();
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: forwardedResponseHeaders(upstream),
  });
}
