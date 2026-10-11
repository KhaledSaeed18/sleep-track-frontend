/**
 * Domain models shared across features. These mirror the API contract; the request/response
 * shapes used by the HTTP client live in `api.d.ts`, generated from the backend OpenAPI schema.
 */

export type UUID = string;
/** ISO-8601 timestamp in UTC. */
export type ISODateTime = string;
/** Local calendar date, `YYYY-MM-DD`. */
export type LocalDate = string;
/** Local clock time, `HH:MM` (24h). */
export type ClockTime = string;

export type Role = 'user' | 'admin';
export type ThemePreference = 'system' | 'light' | 'dark';
export type TimeFormat = '24h' | '12h';
export type WeekStart = 'monday' | 'sunday';

export interface Preferences {
  timezone: string;
  time_format: TimeFormat;
  week_starts_on: WeekStart;
  theme: ThemePreference;
  email_weekly_report: boolean;
  email_bedtime_reminder: boolean;
}

export interface User {
  id: UUID;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: LocalDate | null;
  avatar_url: string | null;
  role: Role;
  is_email_verified: boolean;
  has_password: boolean;
  auth_providers: string[];
  is_demo: boolean;
  created_at: ISODateTime;
  last_login_at: ISODateTime | null;
  preferences: Preferences;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: User;
}

export interface Tag {
  id: UUID;
  name: string;
  color: string;
  icon: string | null;
  is_system: boolean;
  usage_count: number;
  created_at: ISODateTime;
}

export type SessionStatus = 'in_progress' | 'completed';
export type SessionSource = 'manual' | 'timer' | 'import';

export interface SleepSession {
  id: UUID;
  status: SessionStatus;
  started_at: ISODateTime;
  ended_at: ISODateTime | null;
  timezone: string;
  night_of: LocalDate;
  duration_minutes: number | null;
  quality: number | null;
  mood_on_wake: number | null;
  sleep_latency_minutes: number | null;
  awakenings: number | null;
  notes: string | null;
  tags: Tag[];
  score: number | null;
  source: SessionSource;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface TimerState {
  active: boolean;
  session: SleepSession | null;
}

export type AgeGroup =
  | 'newborn'
  | 'infant'
  | 'toddler'
  | 'preschool'
  | 'school_age'
  | 'teen'
  | 'young_adult'
  | 'adult'
  | 'older_adult';

export interface Goal {
  target_duration_minutes: number;
  target_bedtime: ClockTime;
  target_wake_time: ClockTime;
  bedtime_window_minutes: number;
  recommended: { min_hours: number; max_hours: number; age_group: string | null };
}

export interface AnalyticsRange {
  from: LocalDate;
  to: LocalDate;
  days: number;
}

export interface Overview {
  range: AnalyticsRange;
  nights_tracked: number;
  total_sleep_minutes: number;
  averages: {
    duration_minutes: number | null;
    quality: number | null;
    score: number | null;
    sleep_latency_minutes: number | null;
    awakenings: number | null;
    mood_on_wake: number | null;
    bedtime: ClockTime | null;
    wake_time: ClockTime | null;
  };
  consistency_score: number | null;
  goal_attainment_rate: number | null;
  sleep_debt_minutes: number;
  current_streak: number;
  longest_streak: number;
  previous_period: {
    duration_minutes: number | null;
    quality: number | null;
    score: number | null;
    consistency_score: number | null;
  } | null;
}

export interface DailyPoint {
  date: LocalDate;
  duration_minutes: number | null;
  quality: number | null;
  score: number | null;
  bedtime: ClockTime | null;
  wake_time: ClockTime | null;
  sessions: number;
}

export interface WeekdayStat {
  weekday: number;
  nights: number;
  avg_duration_minutes: number | null;
  avg_quality: number | null;
  avg_bedtime: ClockTime | null;
  avg_wake_time: ClockTime | null;
}

export interface TagImpact {
  tag: Tag;
  nights_with: number;
  avg_quality_with: number | null;
  avg_quality_without: number | null;
  avg_duration_with: number | null;
  avg_duration_without: number | null;
  quality_impact: number | null;
  duration_impact_minutes: number | null;
}

export type DurationBucket = '<5h' | '5-6h' | '6-7h' | '7-8h' | '8-9h' | '9h+';

export interface Distribution {
  duration: { bucket: DurationBucket; count: number }[];
  quality: { rating: number; count: number }[];
  bedtime: { hour: number; count: number }[];
}

export type ChronotypeKind = 'early_bird' | 'intermediate' | 'night_owl' | 'unknown';

export interface Chronotype {
  chronotype: ChronotypeKind;
  mid_sleep: ClockTime | null;
  social_jetlag_minutes: number | null;
  nights_analyzed: number;
}

export type InsightKind = 'positive' | 'warning' | 'info' | 'tip';
export type InsightCategory =
  'duration' | 'consistency' | 'quality' | 'timing' | 'tags' | 'goal' | 'habit';

export interface Insight {
  id: string;
  kind: InsightKind;
  category: InsightCategory;
  title: string;
  message: string;
  metric: { label: string; value: string } | null;
  priority: number;
}

export interface WeeklyReport {
  week_start: LocalDate;
  week_end: LocalDate;
  overview: Overview;
  daily: DailyPoint[];
  insights: Insight[];
  best_night: SleepSession | null;
  worst_night: SleepSession | null;
}

export interface DeviceSession {
  id: UUID;
  user_agent: string | null;
  ip_address: string | null;
  device_label: string | null;
  created_at: ISODateTime;
  last_used_at: ISODateTime | null;
  expires_at: ISODateTime;
  current: boolean;
}

export type AuditEvent =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'register'
  | 'password_changed'
  | 'password_reset'
  | 'email_verified'
  | 'session_revoked'
  | 'data_exported'
  | 'data_imported';

export interface AuditLogEntry {
  id: UUID;
  event: AuditEvent | (string & {});
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: ISODateTime;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
}

export interface AppMeta {
  name: string;
  version: string;
  environment: string;
  features: {
    google_oauth: boolean;
    demo_mode: boolean;
    email_verification_required: boolean;
    registration_open: boolean;
  };
}

export interface AdminStats {
  users_total: number;
  users_active_7d: number;
  users_new_7d: number;
  sessions_total: number;
  sessions_7d: number;
  signups_daily: { date: LocalDate; count: number }[];
}

export type AdminUser = Omit<User, 'preferences'> & { is_active: boolean; sessions_count: number };

export interface ProblemFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string | null;
  instance?: string | null;
  code?: string;
  request_id?: string | null;
  errors?: ProblemFieldError[] | null;
}
