import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/auth/auth.service';
import { AuthState, AuthActions, LoginRequest, SignupRequest } from '@/types/auth/auth.types';

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isHydrated: false,
            error: null,

            login: async (credentials: LoginRequest) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.login(credentials);

                    set({
                        user: response.user,
                        token: response.access_token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message || 'Login failed',
                    });
                    throw error;
                }
            },

            signup: async (userData: SignupRequest) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.signup(userData);

                    await get().login({
                        email: userData.email,
                        password: userData.password,
                    });
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.message || 'Signup failed',
                    });
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
            },

            clearError: () => {
                set({ error: null });
            }, setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            setHydrated: (hydrated: boolean) => {
                set({ isHydrated: hydrated });
            },
        }),
        {
            name: 'sleep-track-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state, error) => {
                if (!error && state) {
                    state.setHydrated(true);
                } else {
                    const store = useAuthStore.getState();
                    store.setHydrated(true);
                }
            },
        }
    )
);