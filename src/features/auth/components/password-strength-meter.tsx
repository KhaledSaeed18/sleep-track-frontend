import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { passwordStrength } from '../lib/password-strength';

const TONE = ['bg-base-300', 'bg-error', 'bg-warning', 'bg-info', 'bg-success'] as const;

export function PasswordStrengthMeter({ password, id }: { password: string; id?: string }) {
  const strength = passwordStrength(password);
  return (
    <div id={id} className="mt-2 space-y-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                'h-1.5 rounded-full transition-colors',
                strength.score >= step ? TONE[strength.score] : 'bg-base-300',
              )}
            />
          ))}
        </div>
        <span className="w-14 text-right text-xs font-medium text-base-content/70">
          {strength.label}
        </span>
      </div>
      {password && (
        <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
          {strength.checks.map((check) => (
            <li
              key={check.id}
              className={cn(
                'flex items-center gap-1.5',
                check.met ? 'text-success' : 'text-base-content/55',
              )}
            >
              {check.met ? (
                <Check className="size-3" aria-hidden="true" />
              ) : (
                <Circle className="size-3" aria-hidden="true" />
              )}
              {check.label}
              <span className="sr-only">{check.met ? '(met)' : '(not met)'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
