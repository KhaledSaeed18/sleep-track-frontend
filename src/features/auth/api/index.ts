import { api, unwrap } from '@/lib/api';

export interface LoginInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  timezone?: string;
}

export const authApi = {
  login: (body: LoginInput) => unwrap(api.POST('/api/v1/auth/login', { body })),
  register: (body: RegisterInput) => unwrap(api.POST('/api/v1/auth/register', { body })),
  demo: (timezone?: string) =>
    unwrap(api.POST('/api/v1/auth/demo', { body: timezone ? { timezone } : {} })),
  logout: () => unwrap(api.POST('/api/v1/auth/logout')),
  logoutAll: () => unwrap(api.POST('/api/v1/auth/logout-all')),
  verifyEmail: (token: string) =>
    unwrap(api.POST('/api/v1/auth/verify-email', { body: { token } })),
  resendVerification: () => unwrap(api.POST('/api/v1/auth/verify-email/resend')),
  forgotPassword: (email: string) =>
    unwrap(api.POST('/api/v1/auth/forgot-password', { body: { email } })),
  resetPassword: (token: string, password: string) =>
    unwrap(api.POST('/api/v1/auth/reset-password', { body: { token, password } })),
  oauthProviders: () => unwrap(api.GET('/api/v1/auth/oauth/providers')),
  oauthAuthorizeUrl: (provider: string, redirectTo = '/dashboard') =>
    `/api/v1/auth/oauth/${encodeURIComponent(provider)}/authorize?redirect_to=${encodeURIComponent(redirectTo)}`,
};
