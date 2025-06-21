import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { LoginRequest, SignupRequest } from '@/types/auth/auth.types';

export const useAuth = () => {
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        isHydrated,
        error,
        login: storeLogin,
        signup: storeSignup,
        logout: storeLogout,
        clearError,
        setLoading,
        setHydrated,
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
    }, [token]); const isTokenExpired = useCallback(() => {
        if (!token) return true;

        try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            // Add 30 seconds buffer to account for request time
            return payload.exp < (currentTime + 30);
        } catch {
            return true;
        }
    }, [token]);

    // Auto-logout when token expires
    const checkTokenExpiration = useCallback(() => {
        if (token && isTokenExpired()) {
            console.log('Token expired, logging out...');
            storeLogout();
        }
    }, [token, isTokenExpired, storeLogout]);

    // Check token expiration on mount and periodically
    useEffect(() => {
        if (isHydrated && token) {
            checkTokenExpiration();

            // Check every 5 minutes
            const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isHydrated, token, checkTokenExpiration]); return {
        // State
        user,
        token,
        isAuthenticated: isAuthenticated && !isTokenExpired(),
        isLoading,
        isHydrated,
        error,

        // Actions
        login,
        signup,
        logout,
        clearError,
        setLoading,
        setHydrated,

        // Utilities
        getAuthHeaders,
        isTokenExpired,

        // Computed values
        userFullName: user ? `${user.first_name} ${user.last_name}` : null,
        userInitials: user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : null,
    };
};