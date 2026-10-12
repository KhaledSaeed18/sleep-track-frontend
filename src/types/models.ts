/**
 * Domain models used across features. They alias the schemas generated from the backend OpenAPI
 * document (`pnpm api:generate`), narrowed where the contract is stricter than the schema.
 */
import type { components } from './api';

type Schemas = components['schemas'];

export type UUID = string;
/** ISO-8601 timestamp in UTC. */
export type ISODateTime = string;
/** Local calendar date, `YYYY-MM-DD`. */
export type LocalDate = string;
/** Local clock time, `HH:MM` (24h). */
export type ClockTime = string;

export type Role = Schemas['UserRole'];
export type ThemePreference = Schemas['Theme'];
export type TimeFormat = Schemas['TimeFormat'];
export type WeekStart = Schemas['WeekStart'];

export type Preferences = Schemas['Preferences'];
export type User = Schemas['UserRead'];
export type AuthResponse = Schemas['AuthResponse'];
export type Tag = Schemas['TagRead'];
export type SessionStatus = Schemas['SleepStatus'];
export type SessionSource = Schemas['SleepSource'];
export type SleepSession = Schemas['SleepSessionRead'];
export type TimerState = Schemas['TimerState'];
export type Goal = Schemas['GoalRead'];

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export type AnalyticsRange = Schemas['DateRange'];
export type Overview = Schemas['AnalyticsOverview'];
export type DailyPoint = Schemas['DailyPoint'];
export type WeekdayStat = Schemas['WeekdayStat'];
export type TagImpact = Schemas['TagImpactRead'];
export type Distribution = Schemas['Distribution'];
export type DurationBucket = Schemas['DurationBucket']['bucket'];
export type Chronotype = Schemas['Chronotype'];
export type ChronotypeKind = Chronotype['chronotype'];
export type Insight = Schemas['Insight'];
export type InsightKind = Insight['kind'];
export type InsightCategory = Insight['category'];
export type WeeklyReport = Schemas['WeeklyReport'];

export type DeviceSession = Schemas['DeviceSession'];
export type AuditLogEntry = Schemas['AuditLogEntry'];
export type ImportResult = Schemas['ImportResult'];
export type OAuthProvider = Schemas['OAuthProviderInfo'];
export type AppMeta = Schemas['MetaResponse'];
export type AdminStats = Schemas['AdminStats'];
export type AdminUser = Schemas['AdminUser'];

export type ProblemFieldError = Schemas['FieldError'];
/** Problem details as parsed from any error body; every field is optional until validated. */
export type ProblemDetails = Partial<Schemas['ProblemDetail']> & {
  status: number;
  errors?: ProblemFieldError[] | null;
};
