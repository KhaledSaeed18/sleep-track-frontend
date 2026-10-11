export const SESSION_HINT_COOKIE = 'st_session';
export const CSRF_COOKIE = 'st_csrf';
export const CSRF_HEADER = 'X-CSRF-Token';

export const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/journal',
  '/analytics',
  '/insights',
  '/reports',
  '/goals',
  '/tags',
  '/settings',
  '/admin',
] as const;

export const DEFAULT_AUTHED_ROUTE = '/dashboard';

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
