import type { ReactNode } from 'react';

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full max-w-[25rem]">
      <h1 className="font-display text-[2rem] leading-tight font-semibold tracking-tight">
        {title}
      </h1>
      {description && <p className="mt-2 text-base-content/65">{description}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 text-sm text-base-content/70">{footer}</div>}
    </div>
  );
}
