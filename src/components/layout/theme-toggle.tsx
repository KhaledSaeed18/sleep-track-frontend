'use client';

import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { useThemePreference } from '@/features/account/hooks/use-theme-preference';
import { cn } from '@/lib/utils';
import type { ThemePreference } from '@/types/models';

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Laptop },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export function ThemeToggle({
  className,
  align = 'end',
}: {
  className?: string;
  align?: 'end' | 'start' | 'top';
}) {
  const [theme, setTheme] = useThemePreference();
  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[0]!;
  const Icon = current.icon;

  return (
    <div
      className={cn(
        'dropdown',
        align === 'end' && 'dropdown-end',
        align === 'top' && 'dropdown-top',
        className,
      )}
    >
      <div
        tabIndex={0}
        role="button"
        className="btn btn-square btn-ghost btn-sm"
        aria-label={`Theme: ${current.label}`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <ul
        tabIndex={-1}
        className="menu dropdown-content z-50 mt-2 w-40 rounded-box border border-(--hairline) bg-base-100 p-1.5 shadow-lg"
      >
        {OPTIONS.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => {
                setTheme(option.value);
                (document.activeElement as HTMLElement | null)?.blur();
              }}
              aria-pressed={theme === option.value}
            >
              <option.icon className="size-4" aria-hidden="true" />
              {option.label}
              {theme === option.value && (
                <Check className="ml-auto size-3.5 text-primary" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
