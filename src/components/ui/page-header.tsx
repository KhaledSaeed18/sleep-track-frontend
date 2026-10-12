import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-base-content/65">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: 'section' | 'div' | 'article';
}

/** A titled surface. The primary container for dashboard and settings content. */
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  as: Tag = 'section',
}: SectionCardProps) {
  return (
    <Tag className={cn('surface flex flex-col', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-base-content/60">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
    </Tag>
  );
}
