import { AlertTriangle, RotateCw, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/errors';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 py-8' : 'gap-3 py-14',
        className,
      )}
    >
      {Icon && (
        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <div className="max-w-sm">
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && <p className="mt-1 text-sm text-base-content/65">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  error,
  title = 'This section did not load',
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        compact ? 'py-6' : 'py-12',
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <div className="max-w-sm">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-base-content/65">{errorMessage(error)}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          <RotateCw className="size-3.5" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center', className)}>
      <span className="loading loading-md loading-spinner text-primary" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton rounded-field', className)} />;
}

export function CardSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('surface space-y-3 p-5', className)} aria-hidden="true">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn('h-3', index % 2 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
