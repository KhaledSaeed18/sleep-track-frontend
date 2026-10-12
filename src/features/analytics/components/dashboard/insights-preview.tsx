'use client';

import { Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { SectionCard } from '@/components/ui/page-header';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { InsightCard } from '@/features/insights/components/insight-card';
import { useInsights } from '@/features/insights/hooks';

export function InsightsPreview({ className }: { className?: string }) {
  const { data, isPending, isError, error, refetch } = useInsights();
  return (
    <SectionCard
      title="Top insights"
      description="What your recent nights suggest"
      className={className}
      bodyClassName="pt-2"
      action={
        <Link href="/insights" className="link text-sm text-base-content/60 link-hover">
          See all
        </Link>
      }
    >
      {isPending ? (
        <div className="space-y-4 pt-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState compact error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          compact
          icon={Lightbulb}
          title="Insights unlock after a few nights"
          description="Log at least five nights to see patterns."
        />
      ) : (
        <div className="divide-y divide-(--hairline)">
          {data.slice(0, 3).map((insight) => (
            <InsightCard key={insight.id} insight={insight} compact />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
