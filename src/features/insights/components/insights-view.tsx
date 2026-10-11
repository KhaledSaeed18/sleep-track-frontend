'use client';

import { Lightbulb } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { lastNDays } from '@/features/analytics/lib/ranges';
import { useFormatters } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import type { InsightKind } from '@/types/models';
import { useInsights } from '../hooks';
import { INSIGHT_CATEGORY_LABELS, INSIGHT_KIND, InsightCard } from './insight-card';

const RANGES = [
  { value: '14', label: '2 weeks' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
] as const;

const KIND_ORDER: InsightKind[] = ['warning', 'positive', 'tip', 'info'];

const SUMMARY_LABELS: Record<InsightKind, (count: number) => string> = {
  warning: () => 'worth a look',
  positive: () => 'going well',
  tip: (count) => (count === 1 ? 'tip' : 'tips'),
  info: (count) => (count === 1 ? 'pattern' : 'patterns'),
};

export function InsightsView() {
  const fmt = useFormatters();
  const [days, setDays] = useQueryState(
    'days',
    parseAsStringLiteral(RANGES.map((r) => r.value))
      .withDefault('30')
      .withOptions({ history: 'replace', clearOnDefault: true }),
  );
  const [category, setCategory] = useState<string>('all');
  const range = lastNDays(Number(days), fmt.today());
  const { data, isPending, isError, error, refetch } = useInsights(range);

  const categories = [...new Set((data ?? []).map((insight) => insight.category))];
  const visible = (data ?? []).filter(
    (insight) => category === 'all' || insight.category === category,
  );
  const counts = KIND_ORDER.map((kind) => ({
    kind,
    count: (data ?? []).filter((insight) => insight.kind === kind).length,
  })).filter((item) => item.count > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Patterns found in your nights, ordered by how much they matter."
        actions={
          <Segmented
            label="Period"
            value={days}
            onChange={(value) => void setDays(value)}
            options={RANGES}
          />
        }
      />

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState className="surface" error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <section className="surface">
          <EmptyState
            icon={Lightbulb}
            title="No insights for this period"
            description="Insights appear once you have logged at least five nights. Tags and quality ratings make them sharper."
          />
        </section>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" aria-label="Summary">
            {counts.map(({ kind, count }) => {
              const meta = INSIGHT_KIND[kind];
              return (
                <span key={kind} className={cn('badge gap-2 border-0 badge-lg', meta.tone)}>
                  <meta.icon className="size-3.5" aria-hidden="true" />
                  <span className="text-base-content">
                    {count} {SUMMARY_LABELS[kind](count)}
                  </span>
                </span>
              );
            })}
          </div>

          <div role="tablist" aria-label="Filter by topic" className="tabs tabs-border">
            {['all', ...categories].map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={category === value}
                className={cn('tab', category === value && 'tab-active')}
                onClick={() => setCategory(value)}
              >
                {value === 'all' ? 'All topics' : (INSIGHT_CATEGORY_LABELS[value] ?? value)}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
