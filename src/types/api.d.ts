/**
 * Provisional path map that mirrors CONTRACT.md in the shape produced by openapi-typescript.
 * Replace it by running `pnpm api:generate` once the backend publishes its schema.
 */
import type * as M from './models';

type Headers = Record<string, unknown>;
type Json<T> = { headers: Headers; content: { 'application/json': T } };
type Empty = { headers: Headers; content?: never };
type Problem = { headers: Headers; content: { 'application/problem+json': M.ProblemDetails } };

type Params<Q = never, P = never> = { query?: Q; header?: never; cookie?: never } & ([P] extends [never]
  ? { path?: never }
  : { path: P });
type NoParams = Params;

type Op<P, Res, Body = never> = { parameters: P; responses: Res & { default: Problem } } & ([
  Body,
] extends [never]
  ? { requestBody?: never }
  : { requestBody: { content: { 'application/json': Body } } });
type Ok<T> = { 200: Json<T> };
type Created<T> = { 201: Json<T> };
type NoContent = { 204: Empty };
type Accepted = { 202: Empty | Json<{ message: string }> };

type Range = { from?: string; to?: string };
type Paging = { page?: number; page_size?: number };
type Id = { id: string };

interface PathItem {
  parameters: { query?: never; header?: never; path?: never; cookie?: never };
  get?: never;
  put?: never;
  post?: never;
  delete?: never;
  patch?: never;
  options?: never;
  head?: never;
  trace?: never;
}

type Path<T> = Omit<PathItem, keyof T> & T;

export interface paths {
  '/api/v1/meta': Path<{ get: Op<NoParams, Ok<M.AppMeta>> }>;

  '/api/v1/auth/register': Path<{
    post: Op<
      NoParams,
      Created<M.AuthResponse>,
      { email: string; password: string; first_name: string; last_name: string; timezone?: string }
    >;
  }>;
  '/api/v1/auth/login': Path<{
    post: Op<NoParams, Ok<M.AuthResponse>, { email: string; password: string; remember_me?: boolean }>;
  }>;
  '/api/v1/auth/refresh': Path<{ post: Op<NoParams, Ok<M.AuthResponse>> }>;
  '/api/v1/auth/logout': Path<{ post: Op<NoParams, NoContent> }>;
  '/api/v1/auth/logout-all': Path<{ post: Op<NoParams, NoContent> }>;
  '/api/v1/auth/demo': Path<{ post: Op<NoParams, Ok<M.AuthResponse> & Created<M.AuthResponse>> }>;
  '/api/v1/auth/verify-email': Path<{
    post: Op<NoParams, Ok<{ message: string }>, { token: string }>;
  }>;
  '/api/v1/auth/verify-email/resend': Path<{ post: Op<NoParams, Accepted> }>;
  '/api/v1/auth/forgot-password': Path<{ post: Op<NoParams, Accepted, { email: string }> }>;
  '/api/v1/auth/reset-password': Path<{
    post: Op<NoParams, Ok<{ message: string }>, { token: string; password: string }>;
  }>;
  '/api/v1/auth/oauth/providers': Path<{ get: Op<NoParams, Ok<M.OAuthProvider[]>> }>;

  '/api/v1/users/me': Path<{
    get: Op<NoParams, Ok<M.User>>;
    patch: Op<
      NoParams,
      Ok<M.User>,
      Partial<Pick<M.User, 'first_name' | 'last_name' | 'date_of_birth' | 'avatar_url'>>
    >;
    delete: Op<NoParams, NoContent, { password?: string | null; confirm: 'DELETE' }>;
  }>;
  '/api/v1/users/me/preferences': Path<{
    patch: Op<NoParams, Ok<M.Preferences>, Partial<M.Preferences>>;
  }>;
  '/api/v1/users/me/change-password': Path<{
    post: Op<NoParams, NoContent, { current_password: string | null; new_password: string }>;
  }>;
  '/api/v1/users/me/sessions': Path<{ get: Op<NoParams, Ok<M.DeviceSession[]>> }>;
  '/api/v1/users/me/sessions/{id}': Path<{ delete: Op<Params<never, Id>, NoContent> }>;
  '/api/v1/users/me/audit-log': Path<{
    get: Op<Params<Paging>, Ok<M.Page<M.AuditLogEntry>>>;
  }>;
  '/api/v1/users/me/export': Path<{
    get: Op<Params<{ format?: 'json' | 'csv' }>, Ok<unknown>>;
  }>;
  '/api/v1/users/me/import': Path<{ post: Op<NoParams, Ok<M.ImportResult>> }>;

  '/api/v1/sleep/sessions': Path<{
    get: Op<
      Params<
        Range &
          Paging & {
            min_quality?: number;
            max_quality?: number;
            tag_ids?: string;
            q?: string;
            sort?: string;
          }
      >,
      Ok<M.Page<M.SleepSession>>
    >;
    post: Op<NoParams, Created<M.SleepSession>, SessionInput>;
  }>;
  '/api/v1/sleep/sessions/{id}': Path<{
    get: Op<Params<never, Id>, Ok<M.SleepSession>>;
    patch: Op<Params<never, Id>, Ok<M.SleepSession>, Partial<SessionInput>>;
    delete: Op<Params<never, Id>, NoContent>;
  }>;
  '/api/v1/sleep/sessions/bulk-delete': Path<{
    post: Op<NoParams, Ok<{ deleted: number }>, { ids: string[] }>;
  }>;
  '/api/v1/sleep/timer': Path<{
    get: Op<NoParams, Ok<M.TimerState>>;
    delete: Op<NoParams, NoContent>;
  }>;
  '/api/v1/sleep/timer/start': Path<{
    post: Op<NoParams, Created<M.SleepSession>, { timezone?: string; started_at?: string }>;
  }>;
  '/api/v1/sleep/timer/stop': Path<{
    post: Op<NoParams, Ok<M.SleepSession>, Partial<Omit<SessionInput, 'started_at' | 'timezone'>>>;
  }>;

  '/api/v1/tags': Path<{
    get: Op<NoParams, Ok<M.Tag[]>>;
    post: Op<NoParams, Created<M.Tag>, TagInput>;
  }>;
  '/api/v1/tags/{id}': Path<{
    patch: Op<Params<never, Id>, Ok<M.Tag>, Partial<TagInput>>;
    delete: Op<Params<never, Id>, NoContent>;
  }>;

  '/api/v1/goals': Path<{
    get: Op<NoParams, Ok<M.Goal>>;
    put: Op<NoParams, Ok<M.Goal>, Omit<M.Goal, 'recommended'>>;
  }>;

  '/api/v1/analytics/overview': Path<{ get: Op<Params<Range>, Ok<M.Overview>> }>;
  '/api/v1/analytics/daily': Path<{ get: Op<Params<Range>, Ok<M.DailyPoint[]>> }>;
  '/api/v1/analytics/weekday': Path<{ get: Op<Params<Range>, Ok<M.WeekdayStat[]>> }>;
  '/api/v1/analytics/tags': Path<{ get: Op<Params<Range>, Ok<M.TagImpact[]>> }>;
  '/api/v1/analytics/distribution': Path<{ get: Op<Params<Range>, Ok<M.Distribution>> }>;
  '/api/v1/analytics/chronotype': Path<{ get: Op<Params<Range>, Ok<M.Chronotype>> }>;

  '/api/v1/insights': Path<{ get: Op<Params<Range>, Ok<M.Insight[]>> }>;

  '/api/v1/reports/weekly': Path<{
    get: Op<Params<{ week_start?: string }>, Ok<M.WeeklyReport>>;
  }>;
  '/api/v1/reports/weekly/email': Path<{
    post: Op<Params<{ week_start?: string }>, Accepted, { week_start?: string }>;
  }>;

  '/api/v1/admin/stats': Path<{ get: Op<NoParams, Ok<M.AdminStats>> }>;
  '/api/v1/admin/users': Path<{
    get: Op<
      Params<Paging & { q?: string; role?: M.Role; is_active?: boolean }>,
      Ok<M.Page<M.AdminUser>>
    >;
  }>;
  '/api/v1/admin/users/{id}': Path<{
    patch: Op<Params<never, Id>, Ok<M.AdminUser>, { is_active?: boolean; role?: M.Role }>;
  }>;
}

interface SessionInput {
  started_at: string;
  ended_at: string;
  quality?: number | null;
  mood_on_wake?: number | null;
  sleep_latency_minutes?: number | null;
  awakenings?: number | null;
  notes?: string | null;
  tag_ids?: string[];
  timezone?: string;
}

interface TagInput {
  name: string;
  color: string;
  icon?: string | null;
}

export type webhooks = Record<string, never>;
export type components = Record<string, never>;
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
