# Architecture

This document explains how the SleepTrack web app is put together and why. For setup and scripts,
see the [README](../README.md).

## Overview

```text
 Browser ──────────────► Next.js server (this app) ──────────────► SleepTrack API (FastAPI)
   │  same origin only      │  /api/* streamed to API_INTERNAL_URL      │  PostgreSQL, Redis, worker
   │                        │  proxy.ts: optimistic route gating        │
   │  React 19 client       │  static and server-rendered shells        │
   │  TanStack Query cache  │  security headers                         │
   └── access token in memory, refresh token in an HttpOnly cookie scoped to /api/v1/auth
```

The app is a client-rendered product behind statically rendered shells. Marketing, legal and auth
pages are server components with metadata. The signed-in area renders a server shell and hands off
to client features, because all of its data is private, per user and interactive. Putting the API
behind a same-origin proxy keeps cookies first-party, avoids CORS entirely and lets the API live
on a private network.

## The API gateway

`app/api/[...path]/route.ts` hands every `/api/*` request to `proxyToApi()` in
`lib/api/upstream-proxy.ts`, which streams it to `API_INTERNAL_URL` and the response back. It
drops hop-by-hop headers, keeps each `Set-Cookie` separate, passes redirects through untouched (the
OAuth flow relies on them), times out after 30 seconds and answers `502` with a problem document
when the API is down.

A route handler is used instead of a `rewrites()` entry for two reasons. Next.js does not add
`X-Forwarded-For` to rewritten requests, so the API would see every user as the web server: one
shared bucket for per-IP rate limits and the wrong address in the device list and security log. And
rewrites are fixed at build time, while the handler reads the API address per request, so the same
Docker image runs in every environment.

## Code organisation

```text
src/
├── app/            routes only: layouts, pages, metadata, error and loading boundaries
├── features/<x>/   one folder per domain, each with the same shape:
│   ├── api/        typed calls through the shared client
│   ├── hooks/      TanStack Query hooks (queries, mutations, invalidation)
│   ├── schemas/    zod schemas for forms
│   ├── components/ feature UI
│   └── lib/        pure helpers, unit tested
├── components/     shared UI: design primitives, layout, charts, brand, providers
├── lib/            framework-free infrastructure: API client, auth, dates, formatting
├── hooks/          cross-feature React hooks
├── stores/         small Zustand stores for UI state
├── mocks/          MSW handlers backed by a small in-memory database
└── types/          generated API types (api.d.ts) and domain models derived from them
```

Rules that keep this healthy:

- Pages import from features; features import from `components/`, `lib/` and `hooks/`; features
  import each other only through their public `index.ts`.
- Nothing outside `lib/api` calls `fetch` for API data.
- Domain types are derived from the generated schema (`components['schemas']['SleepSessionRead']`),
  so a backend change surfaces as a type error rather than a runtime bug.

## API client

`lib/api/client.ts` wraps [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) with middleware
that:

1. adds `Authorization: Bearer <token>` from the in-memory token store;
2. adds the `X-CSRF-Token` header (copied from the `st_csrf` cookie) to unsafe methods;
3. on a `401` from a protected endpoint, refreshes once and retries the request;
4. turns RFC 9457 problem responses, FastAPI validation arrays and network failures into one
   `ApiError` type with a friendly message, an error code and per-field errors.

Forms map `ApiError.fieldErrors` onto react-hook-form fields, so server-side validation (an
overlapping night, a taken email) appears next to the right input.

Types come from `pnpm api:generate`, which runs openapi-typescript over the backend's exported
schema. CI type-checks against the committed types, so drift is caught in review.

## Authentication

| Piece                     | Where it lives                                                               | Why                                                                 |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Access token (15 min JWT) | Module memory (`lib/auth/token-store.ts`)                                    | Not readable by injected scripts through storage; gone on tab close |
| Refresh token             | `HttpOnly`, `SameSite=Lax` cookie on `/api/v1/auth` (`Secure` in production) | Only sent to the refresh and logout endpoints                       |
| CSRF token                | `st_csrf` cookie, echoed in a header                                         | Double-submit protection for cookie-authenticated calls             |
| Session hint              | `st_session` cookie (no secret)                                              | Lets `proxy.ts` gate routes before any JavaScript runs              |

**Startup.** `AuthProvider` calls `/auth/refresh` once. Success stores the access token and loads
the user; a `401` or `403` marks the visitor as a guest.

**Refreshing.** The backend rotates refresh tokens and treats reuse as theft, so concurrent refreshes
must never race. `refreshAccessToken()` is single-flight: every caller shares one in-flight request.
Tokens are refreshed shortly before expiry and on demand after a `401`.

**Route gating** happens in two layers. `proxy.ts` (Next.js middleware) redirects based on the hint
cookie, which handles the common case with no flash. `AuthGate` on the client handles everything the
cookie cannot know: an expired session, a deactivated account, admin-only pages, or the API being
unreachable (an offline screen with a retry, not a sign-out). The hint cookie is never trusted for
authorisation; the API checks every request.

**Other flows.** Email verification and password reset links land on `/auth/verify-email` and
`/auth/reset-password`, which redirect to the real pages. Google sign-in goes through the API's
authorize endpoint and returns to `/auth/callback`, which completes the session with a refresh. All
auth forms stay disabled until hydration, so an early click can never submit a native form.

## Server state

TanStack Query owns all server data.

- **Query keys** are centralised in `lib/query-keys.ts` as factories (`queryKeys.sessions.list(filters)`).
- **Invalidation** is declarative: any change to a night invalidates `sessionDependentKeys`
  (sessions, timer, analytics, insights, reports, tags), so the dashboard, charts and counts stay
  consistent after every edit.
- **Errors** are handled once, in the query and mutation caches: background failures show a single
  toast, mutations can opt into a success message through `meta`, and `meta.silent` lets forms
  render errors inline instead. Client errors (4xx except 429) are never retried.
- **Lists** keep previous data while new filters load, so tables never collapse to a spinner.

## Client and URL state

- Filters that a user might share or bookmark (journal filters, analytics range, report week,
  insight period, admin search) live in the URL through **nuqs**.
- Ephemeral UI (sheets, command menu, sidebar collapse) and the auth status live in two small
  **Zustand** stores (`stores/ui-store.ts`, `features/auth/lib/auth-store.ts`). The running timer is
  server state like everything else.
- Preferences such as theme and clock format are read from the user's profile, with the theme also
  mirrored to `localStorage` so the first paint is correct.

## Dates and time zones

Every night belongs to the user's time zone, not the browser's. The `night_of` date comes from the
API, and all rendering goes through `useFormatters()`, which formats in the profile time zone with
`@date-fns/tz` and respects the 12/24-hour preference. Date and time inputs are converted to UTC ISO
strings in that same zone before they are sent. Unit tests pin these helpers in zones other than
the test runner's.

## Design system

- Tailwind CSS 4 with daisyUI 5. Two custom themes, `midnight` (dark, default) and `dawn` (light),
  are defined in `app/globals.css` with OKLCH colours chosen for contrast in both modes.
- A tiny inline script in the root layout applies the stored or system theme before first paint.
- Shared primitives in `components/ui` (fields, modal, confirm dialog, segmented control, rating,
  score ring, empty, loading and error states) keep pages consistent and accessible.
- The signature visual, the **night arc** (`components/brand/night-arc.tsx`), is a dependency-free
  SVG used on the dashboard, the timer, night detail and the landing page.
- Charts wrap Recharts in a `ChartCard` that offers a table view of the same data, for screen
  readers and for anyone who wants exact numbers.
- Animation is CSS-only, subtle, and switched off under `prefers-reduced-motion`.

## Mock API

With `NEXT_PUBLIC_API_MOCKING=true`, `MockGate` starts an MSW service worker before the app renders.
The handlers in `src/mocks` implement the API contract on top of an in-memory database seeded with
realistic nights, including auth, CRUD, the timer and analytics. The same handlers back the Vitest
component tests through `msw/node`.

## Security headers and hardening

- `next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options: DENY`, a strict
  `Referrer-Policy` and a restrictive `Permissions-Policy`, and hides `X-Powered-By`.
- Redirect targets after sign-in (`?next=`) must be same-origin relative paths.
- No tokens are ever written to `localStorage` or `sessionStorage`.
- The production image runs as a non-root user and contains only the standalone server output.

## Testing strategy

| Layer                | Tool                            | Focus                                                                            |
| -------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| Pure helpers         | Vitest                          | dates and time zones, durations, formatting, error parsing, schemas              |
| Components and hooks | Vitest, Testing Library, MSW    | forms, validation, API client refresh and retry, hotkeys, UI primitives          |
| Whole product        | Playwright against the real API | sign-up with email confirmation, demo, journal CRUD and filters, timer, settings |

End-to-end specs fail on any browser console error. `pnpm screenshots` visits every page in both
themes and on a phone viewport, and fails on console errors too, so it doubles as a smoke test.
