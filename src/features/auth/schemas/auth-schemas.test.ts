import { describe, expect, it } from 'vitest';
import { passwordStrength } from '../lib/password-strength';
import { loginSchema, registerSchema, resetPasswordSchema } from './index';

describe('auth schemas', () => {
  it('validates login input', () => {
    expect(
      loginSchema.safeParse({ email: 'demo@sleeptrack.app', password: 'x', remember_me: true })
        .success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: 'x', remember_me: false }).success,
    ).toBe(false);
  });

  it('applies the password policy on registration', () => {
    const base = {
      first_name: 'Maya',
      last_name: 'Haddad',
      email: 'maya@example.com',
      accept_terms: true as const,
    };
    expect(registerSchema.safeParse({ ...base, password: 'nightowl42' }).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, password: 'short1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'onlyletters' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'password123' }).success).toBe(false);
    expect(
      registerSchema.safeParse({ ...base, password: 'nightowl42', accept_terms: false }).success,
    ).toBe(false);
  });

  it('requires matching passwords on reset', () => {
    const result = resetPasswordSchema.safeParse({ password: 'nightowl42', confirm: 'nightowl43' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirm']);
  });
});

describe('passwordStrength', () => {
  it('scores weak to strong', () => {
    expect(passwordStrength('').score).toBe(0);
    expect(passwordStrength('abc').label).toBe('Weak');
    expect(passwordStrength('password123').label).toBe('Weak');
    expect(passwordStrength('nightowl42').score).toBeGreaterThanOrEqual(2);
    expect(passwordStrength('Quiet-Moonrise-2026!').label).toBe('Strong');
  });

  it('reports which checks are met', () => {
    const checks = passwordStrength('abcdefgh').checks;
    expect(checks.find((c) => c.id === 'length')?.met).toBe(true);
    expect(checks.find((c) => c.id === 'digit')?.met).toBe(false);
  });
});
