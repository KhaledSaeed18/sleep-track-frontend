/** Where the Next.js server reaches the API. Read at runtime, so one build can run anywhere. */
export function internalApiUrl(): string {
  return (process.env.API_INTERNAL_URL ?? 'http://localhost:8000').replace(/\/$/, '');
}

/** Same-origin in the browser (requests go through the `/api` route handler), direct on the server. */
export function apiBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return internalApiUrl();
}

export const API_PREFIX = '/api/v1';
