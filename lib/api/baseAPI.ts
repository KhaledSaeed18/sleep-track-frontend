import axios, { AxiosResponse, Method } from 'axios';

const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT: number = 30000;

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: API_TIMEOUT,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage (where Zustand persists it)
        const persistedState = localStorage.getItem('sleep-track-auth');
        if (persistedState) {
            try {
                const { state } = JSON.parse(persistedState);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (error) {
                console.error('Error parsing persisted auth state:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth state on unauthorized response
            localStorage.removeItem('sleep-track-auth');
            // Optionally redirect to login page
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

type ApiClientResponse<T = any> = T;
type ApiParams = Record<string, any>;

const apiClient = async <T = any>(
    method: Method,
    url: string,
    data?: any,
    params?: ApiParams,
    retryCount: number = 0
): Promise<ApiClientResponse<T>> => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000; // 1 second

    try {
        const response: AxiosResponse<T> = await axiosInstance({
            method,
            url,
            data,
            params,
        });

        return response.data;
    } catch (error: any) {
        if ((error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || !error.response) && retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
            return apiClient<T>(method, url, data, params, retryCount + 1);
        }

        if (error.response) {
            const errorData = {
                status: error.response.status,
                message: error.response.data?.message || error.response.data?.error?.message || 'Server error occurred',
                errors: error.response.data?.errors || null,
                code: error.response.data?.code || null,
            };
            throw errorData;
        } else if (error.request) {
            throw {
                status: 0,
                message: 'No response from server. Please check your internet connection.',
            };
        } else {
            throw {
                message: error.message || 'An error occurred while preparing the request',
            };
        }
    }
};

export const api = {
    get: <T = any>(url: string, params?: ApiParams): Promise<ApiClientResponse<T>> =>
        apiClient<T>('GET', url, undefined, params),
    post: <T = any>(url: string, data?: any, params?: ApiParams): Promise<ApiClientResponse<T>> =>
        apiClient<T>('POST', url, data, params),
    put: <T = any>(url: string, data?: any, params?: ApiParams): Promise<ApiClientResponse<T>> =>
        apiClient<T>('PUT', url, data, params),
    patch: <T = any>(url: string, data?: any, params?: ApiParams): Promise<ApiClientResponse<T>> =>
        apiClient<T>('PATCH', url, data, params),
    delete: <T = any>(url: string, params?: ApiParams): Promise<ApiClientResponse<T>> =>
        apiClient<T>('DELETE', url, undefined, params),
};

export type ApiError = {
    status?: number;
    message: string;
};