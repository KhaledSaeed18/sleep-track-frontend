import { create } from 'zustand';

export type AuthStatus = 'loading' | 'authenticated' | 'guest' | 'offline';

interface AuthState {
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  setStatus: (status) => set({ status }),
}));
