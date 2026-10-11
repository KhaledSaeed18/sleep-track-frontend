'use client';

import { cn } from '@/lib/utils';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  label: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

/** Single-choice control built on daisyUI `tabs-box` with radio semantics. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'sm',
  className,
}: SegmentedProps<T>) {
  const sizeClass = { xs: 'tabs-xs', sm: 'tabs-sm', md: 'tabs-md' }[size];
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('tabs tabs-box w-fit flex-nowrap bg-base-200', sizeClass, className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={cn('tab whitespace-nowrap', option.value === value && 'tab-active')}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
