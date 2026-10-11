import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  error: { cls: 'alert-error', icon: AlertCircle },
  success: { cls: 'alert-success', icon: CheckCircle2 },
  info: { cls: 'alert-info', icon: Info },
} as const;

export function FormAlert({
  tone,
  children,
  className,
}: {
  tone: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) {
  const { cls, icon: Icon } = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('alert alert-soft text-sm', cls, className)}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
