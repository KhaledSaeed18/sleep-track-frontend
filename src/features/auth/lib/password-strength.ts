export interface PasswordStrength {
  /** 0 (empty) to 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  checks: { id: string; label: string; met: boolean }[];
}

const COMMON = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'iloveyou1',
  'sleeptrack1',
  'letmein123',
  'welcome123',
  'abc12345',
]);

export function isCommonPassword(password: string): boolean {
  return COMMON.has(password.toLowerCase());
}

export function passwordStrength(password: string): PasswordStrength {
  const checks = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'letter', label: 'Contains a letter', met: /[A-Za-z]/.test(password) },
    { id: 'digit', label: 'Contains a number', met: /\d/.test(password) },
    {
      id: 'mixed',
      label: 'Upper and lower case, or a symbol',
      met: (/[a-z]/.test(password) && /[A-Z]/.test(password)) || /[^A-Za-z0-9]/.test(password),
    },
  ];
  if (!password) return { score: 0, label: '', checks };

  let points = checks.filter((check) => check.met).length;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  if (isCommonPassword(password) || /^(.)\1+$/.test(password)) points = 1;
  if (!checks[0]!.met) points = Math.min(points, 1);

  const score = Math.max(1, Math.min(4, points - 1)) as PasswordStrength['score'];
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]!;
  return { score, label, checks };
}
