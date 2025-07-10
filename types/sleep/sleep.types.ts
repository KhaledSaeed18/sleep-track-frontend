// Request types
export interface CreateSleepSessionRequest {
    sleep_start: string; // ISO 8601 date string
    sleep_end: string;   // ISO 8601 date string
    quality_rating: number; // 1-5 range
}

export interface GetSleepSessionsParams {
    skip?: number;    // default=0
    limit?: number;   // default=100
}

export interface GetTimelineParams {
    days?: number;    // max: 365, min: 1, default value depends on API
}

// Response types
export interface SleepSession {
    id: number;
    sleep_start: string;
    sleep_end: string;
    quality_rating: number;
    created_at: string;
}

export interface SleepStats {
    total_sessions: number;
    average_sleep_hours: number;
    average_quality_rating: number;
    total_sleep_time_minutes: number;
}

export interface DailyBreakdown {
    [key: string]: any; // Flexible structure for daily data
}

export interface WeeklySummary {
    week_start: string;
    week_end: string;
    total_sessions: number;
    total_sleep_hours: number;
    average_sleep_hours: number;
    average_bedtime: string;
    average_wake_time: string;
    average_quality_rating: number | null;
    daily_breakdown: DailyBreakdown[];
    sleep_consistency_score: number;
    quality_trend: string;
}

export interface GetSleepSessionsResponse {
    count: number;
    sessions: SleepSession[];
}

// Error types (reusing from auth types)
export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ValidationErrorResponse {
    detail: ValidationError[];
}

// Store types for sleep state management
export interface SleepState {
    sessions: SleepSession[];
    count: number;
    stats: SleepStats | null;
    weeklySummary: WeeklySummary | null;
    currentSession: SleepSession | null;
    isLoading: boolean;
    error: string | null;
}

export interface SleepActions {
    createSession: (sessionData: CreateSleepSessionRequest) => Promise<SleepSession>;
    getSessions: (params?: GetSleepSessionsParams) => Promise<GetSleepSessionsResponse>;
    getStats: () => Promise<SleepStats>;
    getTimeline: (params?: GetTimelineParams) => Promise<SleepSession[]>;
    getWeeklySummary: () => Promise<WeeklySummary>;
    deleteSession: (sessionId: number) => Promise<void>;
    setLoading: (loading: boolean) => void;
    clearError: () => void;
    setError: (error: string) => void;
}

// Quality rating validation
export const QUALITY_RATING = {
    MIN: 1,
    MAX: 5
} as const;

// Timeline days validation
export const TIMELINE_DAYS = {
    MIN: 1,
    MAX: 365
} as const;