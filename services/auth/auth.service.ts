import { api } from '@/lib/api/baseAPI';
import {
    SignupRequest,
    LoginRequest,
    SignupResponse,
    LoginResponse
} from '@/types/auth/auth.types';

class AuthService {
    private readonly AUTH_ENDPOINTS = {
        SIGNUP: '/auth/signup',
        LOGIN: '/auth/login',
    } as const;

    /**
     * Register a new user
     */
    async signup(userData: SignupRequest): Promise<SignupResponse> {
        try {
            const response = await api.post<SignupResponse>(
                this.AUTH_ENDPOINTS.SIGNUP,
                userData
            );
            return response;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    /**
     * Login user with email and password
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await api.post<LoginResponse>(
                this.AUTH_ENDPOINTS.LOGIN,
                credentials
            );
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();