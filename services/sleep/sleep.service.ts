import { api } from '@/lib/api/baseAPI';
import {
    CreateSleepSessionRequest,
    SleepSession,
    GetSleepSessionsParams,
    SleepStats,
    GetTimelineParams,
    WeeklySummary
} from '@/types/sleep/sleep.types';

class SleepService {
    private readonly SLEEP_ENDPOINTS = {
        BASE: '/sleep',
        STATS: '/sleep/stats',
        TIMELINE: '/sleep/timeline',
        WEEKLY_SUMMARY: '/sleep/weekly-summary',
    } as const;

    /**
     * Create a new sleep session
     */
    async createSession(sessionData: CreateSleepSessionRequest): Promise<SleepSession> {
        try {
            const response = await api.post<SleepSession>(
                this.SLEEP_ENDPOINTS.BASE,
                sessionData
            );
            return response;
        } catch (error) {
            console.error('Create sleep session error:', error);
            throw error;
        }
    }

    /**
     * Get user's sleep sessions with optional pagination
     */
    async getSessions(params?: GetSleepSessionsParams): Promise<SleepSession[]> {
        try {
            const response = await api.get<SleepSession[]>(
                this.SLEEP_ENDPOINTS.BASE,
                params
            );
            return response;
        } catch (error) {
            console.error('Get sleep sessions error:', error);
            throw error;
        }
    }

    /**
     * Get sleep statistics for the user
     */
    async getStats(): Promise<SleepStats> {
        try {
            const response = await api.get<SleepStats>(
                this.SLEEP_ENDPOINTS.STATS
            );
            return response;
        } catch (error) {
            console.error('Get sleep stats error:', error);
            throw error;
        }
    }

    /**
     * Get user's sleep sessions for timeline visualization
     */
    async getTimeline(params?: GetTimelineParams): Promise<SleepSession[]> {
        try {
            const response = await api.get<SleepSession[]>(
                this.SLEEP_ENDPOINTS.TIMELINE,
                params
            );
            return response;
        } catch (error) {
            console.error('Get sleep timeline error:', error);
            throw error;
        }
    }

    /**
     * Get weekly sleep summary analytics
     */
    async getWeeklySummary(): Promise<WeeklySummary> {
        try {
            const response = await api.get<WeeklySummary>(
                this.SLEEP_ENDPOINTS.WEEKLY_SUMMARY
            );
            return response;
        } catch (error) {
            console.error('Get weekly summary error:', error);
            throw error;
        }
    }

    /**
     * Delete a specific sleep session
     */
    async deleteSession(sessionId: number): Promise<void> {
        try {
            await api.delete(`${this.SLEEP_ENDPOINTS.BASE}/${sessionId}`);
        } catch (error) {
            console.error('Delete sleep session error:', error);
            throw error;
        }
    }

    /**
     * Validate sleep session data before sending to API
     */
    validateSleepSession(sessionData: CreateSleepSessionRequest): string[] {
        const errors: string[] = [];

        // Validate quality rating (1-5)
        if (sessionData.quality_rating < 1 || sessionData.quality_rating > 5) {
            errors.push('Quality rating must be between 1 and 5');
        }

        // Validate dates
        const startDate = new Date(sessionData.sleep_start);
        const endDate = new Date(sessionData.sleep_end);

        if (isNaN(startDate.getTime())) {
            errors.push('Invalid sleep start date');
        }

        if (isNaN(endDate.getTime())) {
            errors.push('Invalid sleep end date');
        }

        if (startDate.getTime() && endDate.getTime()) {
            // End must be after start
            if (endDate <= startDate) {
                errors.push('Sleep end time must be after start time');
            }

            // Minimum 5 minutes
            const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
            if (durationMinutes < 5) {
                errors.push('Sleep session must be at least 5 minutes');
            }

            // Maximum 24 hours
            const durationHours = durationMinutes / 60;
            if (durationHours > 24) {
                errors.push('Sleep session cannot exceed 24 hours');
            }
        }

        return errors;
    }

    /**
     * Calculate sleep duration in minutes
     */
    calculateDurationMinutes(sleepStart: string, sleepEnd: string): number {
        const startDate = new Date(sleepStart);
        const endDate = new Date(sleepEnd);
        return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    }

    /**
     * Calculate sleep duration in hours
     */
    calculateDurationHours(sleepStart: string, sleepEnd: string): number {
        return this.calculateDurationMinutes(sleepStart, sleepEnd) / 60;
    }

    /**
     * Format sleep duration for display
     */
    formatDuration(sleepStart: string, sleepEnd: string): string {
        const hours = this.calculateDurationHours(sleepStart, sleepEnd);
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);

        if (wholeHours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${wholeHours}h`;
        } else {
            return `${wholeHours}h ${minutes}m`;
        }
    }
}

export const sleepService = new SleepService();