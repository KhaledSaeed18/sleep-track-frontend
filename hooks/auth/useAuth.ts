import { useCallback } from 'react';
import { useAuthStore } from '@/store';
import { LoginRequest, SignupRequest } from '@/types/auth/auth.types';

export const useAuth = () => {
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login: storeLogin,
        signup: storeSignup,
        logout: storeLogout,
        clearError,
        setLoading,
    } = useAuthStore();

    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                await storeLogin(credentials);
                return { success: true };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message || 'Login failed'
                };
            }
        },
        [storeLogin]
    );

    const signup = useCallback(
        async (userData: SignupRequest) => {
            try {
                await storeSignup(userData);
                return { success: true };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message || 'Signup failed'
                };
            }
        },
        [storeSignup]
    );

    const logout = useCallback(() => {
        storeLogout();
    }, [storeLogout]);

    const getAuthHeaders = useCallback(() => {
        if (!token) return {};
        return {
            Authorization: `Bearer ${token}`,
        };
    }, [token]);

    const isTokenExpired = useCallback(() => {
        if (!token) return true;

        try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch {
            return true;
        }
    }, [token]);

    return {
        // State
        user,
        token,
        isAuthenticated: isAuthenticated && !isTokenExpired(),
        isLoading,
        error,

        // Actions
        login,
        signup,
        logout,
        clearError,
        setLoading,

        // Utilities
        getAuthHeaders,
        isTokenExpired,

        // Computed values
        userFullName: user ? `${user.first_name} ${user.last_name}` : null,
        userInitials: user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : null,
    };
};