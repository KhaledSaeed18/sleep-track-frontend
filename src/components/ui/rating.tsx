'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number | null | undefined;
  onChange?: (value: number | null) => void;
  max?: number;
  label: string;
  /** Labels per value, announced to screen readers and shown beside the control. */
  valueLabels?: Record<number, string>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'star' | 'circle';
  className?: string;
  showValueLabel?: boolean;
}

const SIZE = { xs: 'rating-xs', sm: 'rating-sm', md: 'rating-md', lg: 'rating-lg' } as const;

/** daisyUI rating built on radio inputs, so it is keyboard and screen-reader friendly. */
export function Rating({
  value,
  onChange,
  max = 5,
  label,
  valueLabels,
  size = 'md',
  shape = 'star',
  className,
  showValueLabel = false,
}: RatingProps) {
  const name = useId();
  const mask = shape === 'star' ? 'mask-star-2' : 'mask-circle';
  const readOnly = !onChange;
  const current = value ?? 0;

  if (readOnly) {
    return (
      <span
        className={cn('rating', SIZE[size], className)}
        role="img"
        aria-label={value ? `${label}: ${String(value)} of ${String(max)}` : `${label}: not rated`}
      >
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={cn('mask bg-accent', mask, index < current ? 'opacity-100' : 'opacity-20')}
          />
        ))}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('rating', SIZE[size])} role="radiogroup" aria-label={label}>
        <input
          type="radio"
          name={name}
          className="rating-hidden"
          aria-label={`${label}: clear`}
          checked={!value}
          onChange={() => onChange(null)}
        />
        {Array.from({ length: max }, (_, index) => {
          const rating = index + 1;
          return (
            <input
              key={rating}
              type="radio"
              name={name}
              className={cn('mask bg-accent', mask)}
              aria-label={
                valueLabels?.[rating] ? `${String(rating)}, ${valueLabels[rating]}` : String(rating)
              }
              checked={current === rating}
              onChange={() => onChange(rating)}
            />
          );
        })}
      </div>
      {showValueLabel && (
        <span className="min-w-20 text-sm text-base-content/70" aria-hidden="true">
          {value ? (valueLabels?.[value] ?? value) : 'Not set'}
        </span>
      )}
    </div>
  );
}
