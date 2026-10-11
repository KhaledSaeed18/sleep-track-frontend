'use client';

import { Sparkles } from 'lucide-react';
import { useAppMeta } from '@/features/meta/api';
import { cn } from '@/lib/utils';
import { useDemoLogin } from '../hooks/use-auth';

export function DemoButton({
  className,
  label = 'Try the live demo',
  variant = 'ghost',
}: {
  className?: string;
  label?: string;
  variant?: 'ghost' | 'outline' | 'primary' | 'soft';
}) {
  const { data: meta } = useAppMeta();
  const demo = useDemoLogin();
  if (meta && !meta.features.demo_mode) return null;
  const variantClass = {
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    primary: 'btn-primary',
    soft: 'btn-soft btn-secondary',
  }[variant];
  return (
    <button
      type="button"
      className={cn('btn gap-2', variantClass, className)}
      onClick={() => demo.mutate()}
      disabled={demo.isPending || demo.isSuccess}
    >
      {demo.isPending || demo.isSuccess ? (
        <span className="loading loading-sm loading-spinner" aria-hidden="true" />
      ) : (
        <Sparkles className="size-4" aria-hidden="true" />
      )}
      {demo.isPending ? 'Preparing demo…' : label}
    </button>
  );
}
