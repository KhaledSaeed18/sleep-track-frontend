import { create } from 'zustand';

export type AuthStatus = 'loading' | 'authenticated' | 'guest' | 'offline';

interface AuthState {
  status: AuthStatus;
  /** Where to send the user after an intentional sign-out, instead of the session-expired page. */
  signedOutRedirect: string | null;
  setStatus: (status: AuthStatus) => void;
  setSignedOutRedirect: (path: string | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  signedOutRedirect: null,
  setStatus: (status) => set({ status }),
  setSignedOutRedirect: (signedOutRedirect) => set({ signedOutRedirect }),
}));
