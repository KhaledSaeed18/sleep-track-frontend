/** Same-origin in the browser (requests go through the Next.js rewrite), direct to the API on the server. */
export function apiBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return (process.env.API_INTERNAL_URL ?? 'http://localhost:8000').replace(/\/$/, '');
}

export const API_PREFIX = '/api/v1';
