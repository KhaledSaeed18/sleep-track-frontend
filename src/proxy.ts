import { NextResponse, type NextRequest } from 'next/server';
import {
  DEFAULT_AUTHED_ROUTE,
  SESSION_HINT_COOKIE,
  isAuthPath,
  isProtectedPath,
} from '@/lib/auth/constants';

/**
 * Optimistic route gating based on the `st_session` hint cookie. The cookie is not a credential;
 * the API still authorises every request and the client guard handles expired sessions.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_HINT_COOKIE);

  if (!hasSession && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  // `expired` is set by the client when the hint cookie outlived the refresh token; skipping the
  // redirect here prevents a loop between /login and the app.
  const expired = request.nextUrl.searchParams.has('expired');
  if (hasSession && !expired && isAuthPath(pathname)) {
    const next = request.nextUrl.searchParams.get('next');
    const target = next?.startsWith('/') && !next.startsWith('//') ? next : DEFAULT_AUTHED_ROUTE;
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/journal/:path*',
    '/analytics/:path*',
    '/insights/:path*',
    '/reports/:path*',
    '/goals/:path*',
    '/tags/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
