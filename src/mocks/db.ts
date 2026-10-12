import { TZDate } from '@date-fns/tz';
import type {
  AdminUser,
  AuditLogEntry,
  DeviceSession,
  Goal,
  SleepSession,
  Tag,
  User,
} from '@/types/models';

/**
 * In-memory data store behind the mock API. Seeded deterministically so tests and screenshots
 * are stable. Only used by MSW handlers; never shipped to production unless mocking is enabled.
 */

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let idCounter = 0;
export function uuid(): string {
  idCounter += 1;
  const hex = idCounter.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}

export const MOCK_TIMEZONE = 'Asia/Beirut';

const DEFAULT_TAGS: [string, string, string][] = [
  ['Caffeine', '#f59e0b', 'coffee'],
  ['Alcohol', '#ef4444', 'wine'],
  ['Exercise', '#22c55e', 'dumbbell'],
  ['Late meal', '#f97316', 'utensils'],
  ['Stress', '#ec4899', 'brain'],
  ['Screen time', '#6366f1', 'smartphone'],
  ['Nap', '#06b6d4', 'sofa'],
  ['Travel', '#3b82f6', 'plane'],
  ['Medication', '#a855f7', 'pill'],
  ['Reading', '#14b8a6', 'book-open'],
  ['Meditation', '#84cc16', 'flower-2'],
];

export function nightOf(startedAt: string, zone: string): string {
  const local = new TZDate(new Date(startedAt).getTime(), zone);
  const shifted = local.getHours() < 12 ? new TZDate(local.getTime() - 86_400_000, zone) : local;
  return `${String(shifted.getFullYear())}-${String(shifted.getMonth() + 1).padStart(2, '0')}-${String(shifted.getDate()).padStart(2, '0')}`;
}

export interface MockDb {
  users: (User & { password: string; is_active: boolean })[];
  currentUserId: string | null;
  tags: Tag[];
  sessions: SleepSession[];
  goal: Goal;
  devices: DeviceSession[];
  audit: AuditLogEntry[];
}

function makeUser(
  overrides: Partial<User & { is_active: boolean }> & { password: string },
): User & { password: string; is_active: boolean } {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    email: 'demo@sleeptrack.app',
    first_name: 'Maya',
    last_name: 'Haddad',
    full_name: 'Maya Haddad',
    date_of_birth: '1996-04-18',
    avatar_url: null,
    role: 'user',
    is_email_verified: true,
    has_password: true,
    auth_providers: ['password'],
    is_demo: false,
    created_at: new Date(Date.now() - 120 * 86_400_000).toISOString(),
    last_login_at: now,
    preferences: {
      timezone: MOCK_TIMEZONE,
      time_format: '24h',
      week_starts_on: 'monday',
      theme: 'system',
      email_weekly_report: true,
      email_bedtime_reminder: false,
    },
    is_active: true,
    ...overrides,
  };
}

export function scoreFor(
  session: Pick<
    SleepSession,
    | 'duration_minutes'
    | 'quality'
    | 'sleep_latency_minutes'
    | 'awakenings'
    | 'started_at'
    | 'timezone'
  >,
  goal: Goal,
): number | null {
  if (session.duration_minutes === null) return null;
  const parts: [number, number][] = [];
  const target = goal.target_duration_minutes;
  const durationRatio = 1 - Math.min(1, Math.abs(session.duration_minutes - target) / target);
  parts.push([durationRatio, 40]);
  if (session.quality !== null) parts.push([(session.quality - 1) / 4, 25]);
  if (session.sleep_latency_minutes !== null)
    parts.push([Math.max(0, 1 - session.sleep_latency_minutes / 60), 15]);
  if (session.awakenings !== null) parts.push([Math.max(0, 1 - session.awakenings / 5), 10]);
  const local = new TZDate(new Date(session.started_at).getTime(), session.timezone);
  const [th, tm] = goal.target_bedtime.split(':').map(Number) as [number, number];
  let diff = local.getHours() * 60 + local.getMinutes() - (th * 60 + tm);
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  parts.push([
    Math.max(0, 1 - Math.max(0, Math.abs(diff) - goal.bedtime_window_minutes) / 120),
    10,
  ]);
  const weight = parts.reduce((sum, [, w]) => sum + w, 0);
  return Math.round((parts.reduce((sum, [value, w]) => sum + value * w, 0) / weight) * 100);
}

function seedSessions(tags: Tag[], goal: Goal, nights: number): SleepSession[] {
  const rand = mulberry32(42);
  const sessions: SleepSession[] = [];
  const today = new TZDate(Date.now(), MOCK_TIMEZONE);

  for (let offset = nights; offset >= 1; offset -= 1) {
    if (rand() < 0.07) continue;
    const day = new TZDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset,
      0,
      0,
      0,
      MOCK_TIMEZONE,
    );
    const weekday = day.getDay();
    const weekend = weekday === 5 || weekday === 6;
    const sessionTags = tags.filter((tag) => {
      const p =
        {
          Caffeine: 0.35,
          Exercise: 0.3,
          'Screen time': 0.4,
          Stress: 0.2,
          Alcohol: weekend ? 0.3 : 0.06,
          Reading: 0.3,
          Meditation: 0.15,
          'Late meal': 0.15,
        }[tag.name] ?? 0.03;
      return rand() < p;
    });
    const has = (name: string) => sessionTags.some((tag) => tag.name === name);

    let bedMinutes =
      23 * 60 + 5 + (rand() - 0.5) * 80 + (weekend ? 55 : 0) + (has('Screen time') ? 20 : 0);
    let duration =
      445 +
      (rand() - 0.5) * 120 +
      (weekend ? 40 : 0) -
      (has('Stress') ? 35 : 0) +
      (has('Exercise') ? 15 : 0);
    duration = Math.round(Math.max(260, Math.min(620, duration)));
    bedMinutes = Math.round(bedMinutes);

    const start = new TZDate(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      0,
      bedMinutes,
      0,
      MOCK_TIMEZONE,
    );
    const end = new Date(start.getTime() + duration * 60_000);
    let quality =
      3 +
      (duration > 450 ? 1 : 0) +
      (rand() < 0.35 ? 1 : 0) -
      (has('Caffeine') ? 1 : 0) -
      (has('Alcohol') ? 1 : 0) +
      (has('Meditation') ? 1 : 0) -
      (rand() < 0.2 ? 1 : 0);
    quality = Math.max(1, Math.min(5, quality));
    const latency = Math.round(
      Math.max(2, 8 + rand() * 25 + (has('Caffeine') ? 12 : 0) - (has('Reading') ? 5 : 0)),
    );
    const awakenings = Math.max(0, Math.round(rand() * 3 + (has('Alcohol') ? 1.5 : 0) - 0.5));
    const mood = Math.max(1, Math.min(5, quality + (rand() < 0.5 ? 0 : rand() < 0.5 ? 1 : -1)));
    const notes =
      rand() < 0.22
        ? ([
            'Woke up once around 3am.',
            'Felt rested and clear-headed.',
            'Neighbours were loud late.',
            'Room was too warm.',
            'Fell asleep reading.',
            'Vivid dreams.',
          ][Math.floor(rand() * 6)] ?? null)
        : null;

    const startedAt = start.toISOString();
    const base = {
      id: uuid(),
      status: 'completed' as const,
      started_at: startedAt,
      ended_at: end.toISOString(),
      timezone: MOCK_TIMEZONE,
      night_of: nightOf(startedAt, MOCK_TIMEZONE),
      duration_minutes: duration,
      quality,
      mood_on_wake: mood,
      sleep_latency_minutes: latency,
      awakenings,
      notes,
      tags: sessionTags,
      source: rand() < 0.4 ? ('timer' as const) : ('manual' as const),
      created_at: end.toISOString(),
      updated_at: end.toISOString(),
    };
    sessions.push({ ...base, score: scoreFor(base, goal) });
  }

  for (const tag of tags)
    tag.usage_count = sessions.filter((s) => s.tags.some((t) => t.id === tag.id)).length;
  return sessions.reverse();
}

export function createDb(options: { nights?: number; signedIn?: boolean } = {}): MockDb {
  idCounter = 0;
  const demo = makeUser({ password: 'DemoPass123' });
  const admin = makeUser({
    email: 'admin@sleeptrack.app',
    first_name: 'Khaled',
    last_name: 'Saeed',
    full_name: 'Khaled Saeed',
    role: 'admin',
    password: 'AdminPass123',
  });
  const others = [
    'Lina Khoury',
    'Omar Nasser',
    'Sara Mansour',
    'Jad Aoun',
    'Nour Farah',
    'Karim Saliba',
  ].map((name, index) =>
    makeUser({
      email: `${name.split(' ')[0]!.toLowerCase()}@example.com`,
      first_name: name.split(' ')[0]!,
      last_name: name.split(' ')[1]!,
      full_name: name,
      password: 'Password123',
      is_email_verified: index % 3 !== 0,
      created_at: new Date(Date.now() - (index * 4 + 1) * 86_400_000).toISOString(),
      is_active: index !== 4,
    }),
  );

  const created = new Date(Date.now() - 120 * 86_400_000).toISOString();
  const tags: Tag[] = DEFAULT_TAGS.map(([name, color, icon]) => ({
    id: uuid(),
    name,
    color,
    icon,
    is_system: true,
    usage_count: 0,
    created_at: created,
  }));

  const goal: Goal = {
    target_duration_minutes: 480,
    target_bedtime: '23:00',
    target_wake_time: '07:00',
    bedtime_window_minutes: 30,
    recommended: { min_hours: 7, max_hours: 9, age_group: 'adult' },
  };

  const now = Date.now();
  return {
    users: [demo, admin, ...others],
    currentUserId: options.signedIn ? demo.id : null,
    tags,
    sessions: seedSessions(tags, goal, options.nights ?? 120),
    goal,
    devices: [
      {
        id: uuid(),
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        ip_address: '127.0.0.1',
        device_label: 'Safari on macOS',
        created_at: new Date(now - 3 * 86_400_000).toISOString(),
        last_used_at: new Date(now).toISOString(),
        expires_at: new Date(now + 27 * 86_400_000).toISOString(),
        current: true,
      },
      {
        id: uuid(),
        user_agent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        ip_address: '10.0.0.24',
        device_label: 'Safari on iPhone',
        created_at: new Date(now - 12 * 86_400_000).toISOString(),
        last_used_at: new Date(now - 2 * 3_600_000).toISOString(),
        expires_at: new Date(now + 18 * 86_400_000).toISOString(),
        current: false,
      },
    ],
    audit: (
      ['login', 'data_exported', 'password_changed', 'login', 'login_failed', 'register'] as const
    ).map((event, index) => ({
      id: uuid(),
      event,
      ip_address: index % 2 ? '10.0.0.24' : '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      metadata: event === 'data_exported' ? { format: 'csv' } : {},
      created_at: new Date(now - index * 26 * 3_600_000).toISOString(),
    })),
  };
}

export function toAdminUser(user: MockDb['users'][number], db: MockDb): AdminUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip private fields
  const { password, preferences, ...rest } = user;
  return {
    ...rest,
    sessions_count:
      user.email === 'demo@sleeptrack.app'
        ? db.sessions.length
        : Math.floor(rest.created_at.length * 1.7),
  };
}

export function publicUser(user: MockDb['users'][number]): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip private fields
  const { password, is_active, ...rest } = user;
  return rest;
}
