import { useState, useCallback } from 'react';
import { sleepService } from '@/services/sleep/sleep.service';
import {
    CreateSleepSessionRequest,
    SleepSession,
    GetSleepSessionsParams,
    SleepStats,
    GetTimelineParams,
    WeeklySummary
} from '@/types/sleep/sleep.types';

// Create Sleep Session
export function useCreateSleepSession() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SleepSession | null>(null);

    const createSession = useCallback(async (sessionData: CreateSleepSessionRequest) => {
        setLoading(true);
        setError(null);
        try {
            const result = await sleepService.createSession(sessionData);
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to create sleep session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createSession, loading, error, data };
}

// Get Sleep Sessions
export function useGetSleepSessions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SleepSession[]>([]);

    const getSessions = useCallback(async (params?: GetSleepSessionsParams) => {
        setLoading(true);
        setError(null);
        try {
            const result = await sleepService.getSessions(params);
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch sleep sessions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getSessions, loading, error, data };
}

// Get Sleep Stats
export function useGetSleepStats() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SleepStats | null>(null);

    const getStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await sleepService.getStats();
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch sleep stats');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getStats, loading, error, data };
}

// Get Sleep Timeline
export function useGetSleepTimeline() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SleepSession[]>([]);

    const getTimeline = useCallback(async (params?: GetTimelineParams) => {
        setLoading(true);
        setError(null);
        try {
            const result = await sleepService.getTimeline(params);
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch sleep timeline');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getTimeline, loading, error, data };
}

// Get Weekly Summary
export function useGetWeeklySummary() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<WeeklySummary | null>(null);

    const getWeeklySummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await sleepService.getWeeklySummary();
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch weekly summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { getWeeklySummary, loading, error, data };
}

// Delete Sleep Session
export function useDeleteSleepSession() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteSession = useCallback(async (sessionId: number) => {
        setLoading(true);
        setError(null);
        try {
            await sleepService.deleteSession(sessionId);
        } catch (err: any) {
            setError(err.message || 'Failed to delete sleep session');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteSession, loading, error };
}