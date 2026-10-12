import { AlertTriangle, Info, Lightbulb, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Insight, InsightKind } from '@/types/models';

export const INSIGHT_KIND: Record<InsightKind, { icon: LucideIcon; label: string; tone: string }> =
  {
    positive: { icon: TrendingUp, label: 'Going well', tone: 'text-success bg-success/10' },
    warning: { icon: AlertTriangle, label: 'Worth a look', tone: 'text-warning bg-warning/10' },
    info: { icon: Info, label: 'Pattern', tone: 'text-info bg-info/10' },
    tip: { icon: Lightbulb, label: 'Tip', tone: 'text-secondary bg-secondary/10' },
  };

export const INSIGHT_CATEGORY_LABELS: Record<string, string> = {
  duration: 'Duration',
  consistency: 'Consistency',
  quality: 'Quality',
  timing: 'Timing',
  tags: 'Habits and tags',
  goal: 'Goals',
  habit: 'Routine',
};

export function InsightCard({
  insight,
  compact = false,
  className,
}: {
  insight: Insight;
  compact?: boolean;
  className?: string;
}) {
  const kind = INSIGHT_KIND[insight.kind];
  const Icon = kind.icon;
  return (
    <article className={cn('flex gap-4', compact ? 'py-3.5' : 'surface p-5', className)}>
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full', kind.tone)}>
        <Icon className="size-4" aria-hidden="true" />
        <span className="sr-only">{kind.label}</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>
            {insight.title}
          </h3>
          {insight.metric && (
            <span
              className="tabular badge shrink-0 badge-ghost badge-sm font-medium"
              title={insight.metric.label}
            >
              {insight.metric.value}
            </span>
          )}
        </div>
        <p className={cn('mt-1 text-base-content/70', compact ? 'text-sm' : 'text-[0.95rem]')}>
          {insight.message}
        </p>
        {!compact && (
          <p className="mt-3 text-xs text-base-content/50">
            {kind.label}
            {insight.metric && `, ${insight.metric.label.toLowerCase()} ${insight.metric.value}`}
          </p>
        )}
      </div>
    </article>
  );
}
