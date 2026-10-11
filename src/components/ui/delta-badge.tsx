import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { Delta } from '@/lib/format';
import { cn } from '@/lib/utils';

interface DeltaBadgeProps {
  delta: Delta | null;
  format: (value: number) => string;
  className?: string;
  suffix?: string;
}

export function DeltaBadge({
  delta,
  format,
  className,
  suffix = 'vs previous period',
}: DeltaBadgeProps) {
  if (!delta) return null;
  const Icon =
    delta.trend === 'flat' ? Minus : delta.trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const tone =
    delta.trend === 'flat'
      ? 'text-base-content/60'
      : delta.positive
        ? 'text-success'
        : 'text-error';
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', tone, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="tabular">{format(delta.value)}</span>
      <span className="sr-only">{suffix}</span>
    </span>
  );
}
