import { http, HttpResponse, type JsonBodyType } from 'msw';
import type { AuthResponse, Page, SleepSession, Tag } from '@/types/models';
import * as A from './analytics';
import {
  createDb,
  MOCK_TIMEZONE,
  nightOf,
  publicUser,
  scoreFor,
  toAdminUser,
  uuid,
  type MockDb,
} from './db';

const API = '*/api/v1';

export let db: MockDb = createDb();

export function resetMockDb(options?: Parameters<typeof createDb>[0]): MockDb {
  db = createDb(options);
  return db;
}

function setBrowserCookie(name: string, value: string | null) {
  if (typeof document === 'undefined') return;
  document.cookie =
    value === null ? `${name}=; Path=/; Max-Age=0` : `${name}=${value}; Path=/; SameSite=Lax`;
}

function problem(
  status: number,
  code: string,
  title: string,
  detail?: string,
  errors?: { field: string; message: string }[],
) {
  return HttpResponse.json(
    {
      type: `https://sleeptrack.app/problems/${code}`,
      title,
      status,
      detail: detail ?? title,
      code,
      errors: errors ?? [],
      request_id: uuid(),
    },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

function currentUser() {
  return db.users.find((user) => user.id === db.currentUserId) ?? null;
}

function requireUser(request: Request) {
  const user = currentUser();
  if (!user || !request.headers.get('Authorization')?.startsWith('Bearer ')) return null;
  return user;
}

function authResponse(user: MockDb['users'][number]): AuthResponse {
  db.currentUserId = user.id;
  setBrowserCookie('st_session', '1');
  setBrowserCookie('st_csrf', 'mock-csrf-token');
  return {
    access_token: `mock.${user.id}.${String(Date.now())}`,
    token_type: 'bearer',
    expires_in: 900,
    user: publicUser(user),
  };
}

function paginate<T>(items: T[], url: URL): Page<T> {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('page_size') ?? 20)));
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    page_size: pageSize,
    pages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

interface SessionBody {
  started_at?: string;
  ended_at?: string;
  quality?: number | null;
  mood_on_wake?: number | null;
  sleep_latency_minutes?: number | null;
  awakenings?: number | null;
  notes?: string | null;
  tag_ids?: string[];
  timezone?: string;
}

function validateSession(session: SleepSession, ignoreId?: string) {
  if (!session.ended_at) return null;
  const duration = Math.round(
    (Date.parse(session.ended_at) - Date.parse(session.started_at)) / 60_000,
  );
  if (duration < 10 || duration > 1200) {
    return problem(
      422,
      'validation_error',
      'Validation failed',
      'One or more fields are invalid.',
      [{ field: 'ended_at', message: 'Sleep must last between 10 minutes and 20 hours' }],
    );
  }
  if (Date.parse(session.ended_at) > Date.now() + 60_000) {
    return problem(
      422,
      'validation_error',
      'Validation failed',
      'One or more fields are invalid.',
      [{ field: 'ended_at', message: 'Cannot end in the future' }],
    );
  }
  const overlap = db.sessions.some(
    (other) =>
      other.id !== ignoreId &&
      other.ended_at &&
      Date.parse(other.started_at) < Date.parse(session.ended_at!) &&
      Date.parse(other.ended_at) > Date.parse(session.started_at),
  );
  if (overlap)
    return problem(
      409,
      'session_overlap',
      'Session overlaps',
      'This session overlaps another session.',
    );
  return null;
}

function applyBody(session: SleepSession, body: SessionBody): SleepSession {
  const next: SleepSession = { ...session };
  if (body.started_at) next.started_at = new Date(body.started_at).toISOString();
  if (body.ended_at) next.ended_at = new Date(body.ended_at).toISOString();
  for (const key of [
    'quality',
    'mood_on_wake',
    'sleep_latency_minutes',
    'awakenings',
    'notes',
  ] as const) {
    if (key in body) (next as unknown as Record<string, unknown>)[key] = body[key] ?? null;
  }
  if (body.tag_ids) next.tags = db.tags.filter((tag) => body.tag_ids!.includes(tag.id));
  if (body.timezone) next.timezone = body.timezone;
  next.night_of = nightOf(next.started_at, next.timezone);
  next.duration_minutes = next.ended_at
    ? Math.round((Date.parse(next.ended_at) - Date.parse(next.started_at)) / 60_000)
    : null;
  next.score = next.ended_at ? scoreFor(next, db.goal) : null;
  next.updated_at = new Date().toISOString();
  return next;
}

function refreshTagUsage() {
  for (const tag of db.tags)
    tag.usage_count = db.sessions.filter((s) => s.tags.some((t) => t.id === tag.id)).length;
}

async function json<T>(request: Request): Promise<T> {
  return (await request.json().catch(() => ({}))) as T;
}

const unauthorized = () => problem(401, 'not_authenticated', 'Not authenticated');

function authed(
  handler: (args: {
    request: Request;
    params: Record<string, string>;
    url: URL;
    user: MockDb['users'][number];
  }) => Response | Promise<Response>,
) {
  return ({
    request,
    params,
  }: {
    request: Request;
    params: Record<string, string | readonly string[] | undefined>;
  }) => {
    const user = requireUser(request);
    if (!user) return unauthorized();
    return handler({
      request,
      params: params as Record<string, string>,
      url: new URL(request.url),
      user,
    });
  };
}

const ok = (body: JsonBodyType, status = 200) => HttpResponse.json(body, { status });

export const handlers = [
  http.get('*/health/live', () => ok({ status: 'ok' })),
  http.get(`${API}/meta`, () =>
    ok({
      name: 'SleepTrack API',
      version: '2.0.0-mock',
      environment: 'mock',
      features: {
        google_oauth: true,
        demo_mode: true,
        email_verification_required: false,
        registration_open: true,
      },
    }),
  ),
  http.get(`${API}/auth/oauth/providers`, () =>
    ok([{ id: 'google', name: 'Google', enabled: true }]),
  ),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await json<{ email?: string; password?: string }>(request);
    const user = db.users.find((u) => u.email.toLowerCase() === body.email?.toLowerCase());
    if (!user || user.password !== body.password)
      return problem(
        401,
        'invalid_credentials',
        'Invalid credentials',
        'Incorrect email or password.',
      );
    if (!user.is_active) return problem(403, 'account_disabled', 'Account disabled');
    return ok(authResponse(user));
  }),
  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = await json<{
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      timezone?: string;
    }>(request);
    if (db.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      return problem(
        409,
        'email_taken',
        'Email already registered',
        'An account with this email already exists.',
        [{ field: 'email', message: 'This email is already registered' }],
      );
    }
    const base = db.users[0]!;
    const user = {
      ...base,
      id: uuid(),
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      full_name: `${body.first_name} ${body.last_name}`,
      password: body.password,
      is_email_verified: false,
      role: 'user' as const,
      created_at: new Date().toISOString(),
      preferences: { ...base.preferences, timezone: body.timezone ?? MOCK_TIMEZONE },
    };
    db.users.push(user);
    db.sessions = [];
    return ok(authResponse(user), 201);
  }),
  http.post(`${API}/auth/demo`, () => {
    const demo = db.users.find((u) => u.email === 'demo@sleeptrack.app')!;
    demo.is_demo = true;
    return ok(authResponse(demo));
  }),
  http.post(`${API}/auth/refresh`, () => {
    const user =
      currentUser() ??
      (typeof document !== 'undefined' && document.cookie.includes('st_session=')
        ? db.users[0]!
        : null);
    if (!user) return problem(401, 'not_authenticated', 'Not authenticated');
    return ok(authResponse(user));
  }),
  http.post(`${API}/auth/logout`, () => {
    db.currentUserId = null;
    setBrowserCookie('st_session', null);
    setBrowserCookie('st_csrf', null);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API}/auth/logout-all`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${API}/auth/verify-email`, async ({ request }) => {
    const body = await json<{ token?: string }>(request);
    if (body.token === 'expired') return problem(400, 'token_expired', 'Token expired');
    if (!body.token || body.token === 'invalid')
      return problem(400, 'token_invalid', 'Token invalid');
    const user = currentUser();
    if (user) user.is_email_verified = true;
    return ok({ message: 'Email verified' });
  }),
  http.post(`${API}/auth/verify-email/resend`, () => new HttpResponse(null, { status: 202 })),
  http.post(`${API}/auth/forgot-password`, () => new HttpResponse(null, { status: 202 })),
  http.post(`${API}/auth/reset-password`, async ({ request }) => {
    const body = await json<{ token?: string }>(request);
    if (body.token === 'expired') return problem(400, 'token_expired', 'Token expired');
    return ok({ message: 'Password updated' });
  }),

  http.get(
    `${API}/users/me`,
    authed(({ user }) => ok(publicUser(user))),
  ),
  http.patch(
    `${API}/users/me`,
    authed(async ({ request, user }) => {
      const body = await json<Record<string, unknown>>(request);
      Object.assign(user, body);
      user.full_name = `${user.first_name} ${user.last_name}`;
      return ok(publicUser(user));
    }),
  ),
  http.patch(
    `${API}/users/me/preferences`,
    authed(async ({ request, user }) => {
      user.preferences = { ...user.preferences, ...(await json<Record<string, unknown>>(request)) };
      return ok(user.preferences);
    }),
  ),
  http.post(
    `${API}/users/me/change-password`,
    authed(async ({ request, user }) => {
      const body = await json<{ current_password: string | null; new_password: string }>(request);
      if (user.has_password && body.current_password !== user.password) {
        return problem(
          400,
          'invalid_credentials',
          'Invalid credentials',
          'Current password is incorrect.',
          [{ field: 'current_password', message: 'Current password is incorrect' }],
        );
      }
      user.password = body.new_password;
      return new HttpResponse(null, { status: 204 });
    }),
  ),
  http.get(
    `${API}/users/me/sessions`,
    authed(() => ok(db.devices)),
  ),
  http.delete(
    `${API}/users/me/sessions/:id`,
    authed(({ params }) => {
      db.devices = db.devices.filter((d) => d.id !== params.id);
      return new HttpResponse(null, { status: 204 });
    }),
  ),
  http.get(
    `${API}/users/me/audit-log`,
    authed(({ url }) => ok(paginate(db.audit, url))),
  ),
  http.get(
    `${API}/users/me/export`,
    authed(({ url }) => {
      const format = url.searchParams.get('format') ?? 'json';
      const body =
        format === 'csv'
          ? `started_at,ended_at,quality,notes,tags\n${db.sessions.map((s) => `${s.started_at},${s.ended_at ?? ''},${String(s.quality ?? '')},"${s.notes ?? ''}","${s.tags.map((t) => t.name).join(';')}"`).join('\n')}`
          : JSON.stringify({ sessions: db.sessions, tags: db.tags });
      return new HttpResponse(body, {
        headers: {
          'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename="sleeptrack-export.${format}"`,
        },
      });
    }),
  ),
  http.post(
    `${API}/users/me/import`,
    authed(() =>
      ok({
        imported: 12,
        skipped: 2,
        errors: [
          { row: 4, message: 'ended_at must be after started_at' },
          { row: 9, message: 'Overlaps an existing session' },
        ],
      }),
    ),
  ),
  http.delete(
    `${API}/users/me`,
    authed(async ({ request, user }) => {
      const body = await json<{ password?: string; confirm?: string }>(request);
      if (body.confirm !== 'DELETE')
        return problem(422, 'validation_error', 'Validation failed', 'Type DELETE to confirm.', [
          { field: 'confirm', message: 'Type DELETE to confirm' },
        ]);
      if (user.has_password && body.password !== user.password)
        return problem(
          400,
          'invalid_credentials',
          'Invalid credentials',
          'Password is incorrect.',
          [{ field: 'password', message: 'Password is incorrect' }],
        );
      db.users = db.users.filter((u) => u.id !== user.id);
      db.currentUserId = null;
      setBrowserCookie('st_session', null);
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    `${API}/sleep/sessions`,
    authed(({ url }) => {
      const p = url.searchParams;
      let items = db.sessions.filter((s) => s.status === 'completed');
      const from = p.get('from');
      const to = p.get('to');
      if (from) items = items.filter((s) => s.night_of >= from);
      if (to) items = items.filter((s) => s.night_of <= to);
      const minQ = p.get('min_quality');
      const maxQ = p.get('max_quality');
      if (minQ) items = items.filter((s) => (s.quality ?? 0) >= Number(minQ));
      if (maxQ) items = items.filter((s) => (s.quality ?? 6) <= Number(maxQ));
      const tagIds = p.get('tag_ids')?.split(',').filter(Boolean);
      if (tagIds?.length) items = items.filter((s) => s.tags.some((t) => tagIds.includes(t.id)));
      const q = p.get('q')?.toLowerCase();
      if (q) items = items.filter((s) => s.notes?.toLowerCase().includes(q));
      const sort = p.get('sort') ?? '-started_at';
      const desc = sort.startsWith('-');
      const field = (desc ? sort.slice(1) : sort) as keyof SleepSession;
      items = [...items].sort((a, b) => {
        const av = a[field] ?? -Infinity;
        const bv = b[field] ?? -Infinity;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return desc ? -cmp : cmp;
      });
      return ok(paginate(items, url));
    }),
  ),
  http.post(
    `${API}/sleep/sessions`,
    authed(async ({ request }) => {
      const body = await json<SessionBody>(request);
      const now = new Date().toISOString();
      const draft: SleepSession = {
        id: uuid(),
        status: 'completed',
        started_at: now,
        ended_at: now,
        timezone: body.timezone ?? MOCK_TIMEZONE,
        night_of: '',
        duration_minutes: null,
        quality: null,
        mood_on_wake: null,
        sleep_latency_minutes: null,
        awakenings: null,
        notes: null,
        tags: [],
        score: null,
        source: 'manual',
        created_at: now,
        updated_at: now,
      };
      const session = applyBody(draft, body);
      const error = validateSession(session);
      if (error) return error;
      db.sessions.unshift(session);
      refreshTagUsage();
      return ok(session, 201);
    }),
  ),
  http.post(
    `${API}/sleep/sessions/bulk-delete`,
    authed(async ({ request }) => {
      const { ids } = await json<{ ids: string[] }>(request);
      const before = db.sessions.length;
      db.sessions = db.sessions.filter((s) => !ids.includes(s.id));
      refreshTagUsage();
      return ok({ deleted: before - db.sessions.length });
    }),
  ),
  http.get(
    `${API}/sleep/sessions/:id`,
    authed(({ params }) => {
      const session = db.sessions.find((s) => s.id === params.id);
      return session
        ? ok(session)
        : problem(404, 'not_found', 'Not found', 'Sleep session not found.');
    }),
  ),
  http.patch(
    `${API}/sleep/sessions/:id`,
    authed(async ({ request, params }) => {
      const index = db.sessions.findIndex((s) => s.id === params.id);
      if (index < 0) return problem(404, 'not_found', 'Not found');
      const session = applyBody(db.sessions[index]!, await json<SessionBody>(request));
      const error = validateSession(session, session.id);
      if (error) return error;
      db.sessions[index] = session;
      refreshTagUsage();
      return ok(session);
    }),
  ),
  http.delete(
    `${API}/sleep/sessions/:id`,
    authed(({ params }) => {
      db.sessions = db.sessions.filter((s) => s.id !== params.id);
      refreshTagUsage();
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    `${API}/sleep/timer`,
    authed(() => {
      const session = db.sessions.find((s) => s.status === 'in_progress') ?? null;
      return ok({ active: !!session, session });
    }),
  ),
  http.post(
    `${API}/sleep/timer/start`,
    authed(async ({ request }) => {
      if (db.sessions.some((s) => s.status === 'in_progress'))
        return problem(409, 'timer_already_running', 'Timer already running');
      const body = await json<{ timezone?: string; started_at?: string }>(request);
      const startedAt = body.started_at ?? new Date().toISOString();
      const zone = body.timezone ?? MOCK_TIMEZONE;
      const session: SleepSession = {
        id: uuid(),
        status: 'in_progress',
        started_at: startedAt,
        ended_at: null,
        timezone: zone,
        night_of: nightOf(startedAt, zone),
        duration_minutes: null,
        quality: null,
        mood_on_wake: null,
        sleep_latency_minutes: null,
        awakenings: null,
        notes: null,
        tags: [],
        score: null,
        source: 'timer',
        created_at: startedAt,
        updated_at: startedAt,
      };
      db.sessions.unshift(session);
      return ok(session, 201);
    }),
  ),
  http.post(
    `${API}/sleep/timer/stop`,
    authed(async ({ request }) => {
      const index = db.sessions.findIndex((s) => s.status === 'in_progress');
      if (index < 0) return problem(409, 'no_active_timer', 'No active timer');
      const body = await json<SessionBody>(request);
      const session = applyBody(
        { ...db.sessions[index]!, status: 'completed' },
        { ...body, ended_at: body.ended_at ?? new Date().toISOString() },
      );
      const error = validateSession(session, session.id);
      if (error) return error;
      db.sessions[index] = session;
      return ok(session);
    }),
  ),
  http.delete(
    `${API}/sleep/timer`,
    authed(() => {
      const before = db.sessions.length;
      db.sessions = db.sessions.filter((s) => s.status !== 'in_progress');
      return before === db.sessions.length
        ? problem(409, 'no_active_timer', 'No active timer')
        : new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    `${API}/tags`,
    authed(() => ok(db.tags)),
  ),
  http.post(
    `${API}/tags`,
    authed(async ({ request }) => {
      const body = await json<Pick<Tag, 'name' | 'color' | 'icon'>>(request);
      if (db.tags.some((t) => t.name.toLowerCase() === body.name.toLowerCase())) {
        return problem(409, 'conflict', 'Conflict', 'A tag with this name already exists.', [
          { field: 'name', message: 'A tag with this name already exists' },
        ]);
      }
      const tag: Tag = {
        id: uuid(),
        name: body.name,
        color: body.color,
        icon: body.icon ?? null,
        is_system: false,
        usage_count: 0,
        created_at: new Date().toISOString(),
      };
      db.tags.push(tag);
      return ok(tag, 201);
    }),
  ),
  http.patch(
    `${API}/tags/:id`,
    authed(async ({ request, params }) => {
      const tag = db.tags.find((t) => t.id === params.id);
      if (!tag) return problem(404, 'not_found', 'Not found');
      Object.assign(tag, await json<Partial<Tag>>(request));
      return ok(tag);
    }),
  ),
  http.delete(
    `${API}/tags/:id`,
    authed(({ params }) => {
      db.tags = db.tags.filter((t) => t.id !== params.id);
      for (const s of db.sessions) s.tags = s.tags.filter((t) => t.id !== params.id);
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    `${API}/goals`,
    authed(() => ok(db.goal)),
  ),
  http.put(
    `${API}/goals`,
    authed(async ({ request }) => {
      db.goal = { ...db.goal, ...(await json<Partial<MockDb['goal']>>(request)) };
      return ok(db.goal);
    }),
  ),

  http.get(
    `${API}/analytics/overview`,
    authed(({ url }) =>
      ok(
        A.overview(db.sessions, db.goal, url.searchParams.get('from'), url.searchParams.get('to')),
      ),
    ),
  ),
  http.get(
    `${API}/analytics/daily`,
    authed(({ url }) =>
      ok(A.daily(db.sessions, url.searchParams.get('from'), url.searchParams.get('to'))),
    ),
  ),
  http.get(
    `${API}/analytics/weekday`,
    authed(({ url }) =>
      ok(A.weekday(db.sessions, url.searchParams.get('from'), url.searchParams.get('to'))),
    ),
  ),
  http.get(
    `${API}/analytics/tags`,
    authed(({ url }) =>
      ok(
        A.tagImpact(db.sessions, db.tags, url.searchParams.get('from'), url.searchParams.get('to')),
      ),
    ),
  ),
  http.get(
    `${API}/analytics/distribution`,
    authed(({ url }) =>
      ok(A.distribution(db.sessions, url.searchParams.get('from'), url.searchParams.get('to'))),
    ),
  ),
  http.get(
    `${API}/analytics/chronotype`,
    authed(({ url }) =>
      ok(A.chronotype(db.sessions, url.searchParams.get('from'), url.searchParams.get('to'))),
    ),
  ),
  http.get(
    `${API}/insights`,
    authed(({ url }) =>
      ok(
        A.insights(
          db.sessions,
          db.tags,
          db.goal,
          url.searchParams.get('from'),
          url.searchParams.get('to'),
        ),
      ),
    ),
  ),

  http.get(
    `${API}/reports/weekly`,
    authed(({ url }) => {
      const today = A.todayLocal();
      const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
      const weekStart = url.searchParams.get('week_start') ?? A.addDays(today, -dow - 7);
      const weekEnd = A.addDays(weekStart, 6);
      const nights = db.sessions.filter(
        (s) => s.status === 'completed' && s.night_of >= weekStart && s.night_of <= weekEnd,
      );
      const sorted = [...nights].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      return ok({
        week_start: weekStart,
        week_end: weekEnd,
        overview: A.overview(db.sessions, db.goal, weekStart, weekEnd),
        daily: A.daily(db.sessions, weekStart, weekEnd),
        insights: A.insights(db.sessions, db.tags, db.goal, weekStart, weekEnd).slice(0, 4),
        best_night: sorted[0] ?? null,
        worst_night: sorted.length > 1 ? sorted[sorted.length - 1]! : null,
      });
    }),
  ),
  http.post(
    `${API}/reports/weekly/email`,
    authed(() => new HttpResponse(null, { status: 202 })),
  ),

  http.get(
    `${API}/admin/stats`,
    authed(({ user }) => {
      if (user.role !== 'admin') return problem(403, 'forbidden', 'Forbidden');
      const today = A.todayLocal();
      return ok({
        users_total: 1284,
        users_active_7d: 342,
        users_new_7d: 57,
        sessions_total: 48210,
        sessions_7d: 2104,
        signups_daily: Array.from({ length: 30 }, (_, i) => ({
          date: A.addDays(today, i - 29),
          count: Math.round(5 + 4 * Math.sin(i / 3) + (i % 7 === 1 ? 6 : 0) + i / 6),
        })),
      });
    }),
  ),
  http.get(
    `${API}/admin/users`,
    authed(({ user, url }) => {
      if (user.role !== 'admin') return problem(403, 'forbidden', 'Forbidden');
      const q = url.searchParams.get('q')?.toLowerCase();
      const role = url.searchParams.get('role');
      const active = url.searchParams.get('is_active');
      let users = db.users.map((u) => toAdminUser(u, db));
      if (q)
        users = users.filter((u) => u.email.includes(q) || u.full_name.toLowerCase().includes(q));
      if (role) users = users.filter((u) => u.role === role);
      if (active !== null) users = users.filter((u) => String(u.is_active) === active);
      return ok(paginate(users, url));
    }),
  ),
  http.patch(
    `${API}/admin/users/:id`,
    authed(async ({ request, params, user }) => {
      if (user.role !== 'admin') return problem(403, 'forbidden', 'Forbidden');
      const target = db.users.find((u) => u.id === params.id);
      if (!target) return problem(404, 'not_found', 'Not found');
      const body = await json<{ is_active?: boolean; role?: 'user' | 'admin' }>(request);
      if (target.id === user.id)
        return problem(409, 'conflict', 'Conflict', 'You cannot change your own role or status.');
      Object.assign(target, body);
      return ok(toAdminUser(target, db));
    }),
  ),
];
