'use client';

import { Bird, CloudMoon, Sunrise } from 'lucide-react';
import { createElement } from 'react';
import { SectionCard } from '@/components/ui/page-header';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { useFormatters } from '@/hooks/use-preferences';
import { formatDuration } from '@/lib/format';
import type { DateRange } from '@/lib/query-keys';
import type { ChronotypeKind } from '@/types/models';
import { useChronotype } from '../../hooks';

const KINDS: Record<ChronotypeKind, { label: string; icon: typeof Bird; text: string }> = {
  early_bird: {
    label: 'Early bird',
    icon: Sunrise,
    text: 'Your body clock runs early. Mornings are likely your sharpest hours; protect an early bedtime.',
  },
  intermediate: {
    label: 'In between',
    icon: Bird,
    text: 'Your rhythm sits in the middle, the most common pattern. A steady schedule keeps it that way.',
  },
  night_owl: {
    label: 'Night owl',
    icon: CloudMoon,
    text: 'Your body clock runs late. Bright morning light and a fixed wake time can pull it earlier.',
  },
  unknown: {
    label: 'Not enough data',
    icon: Bird,
    text: 'Log a couple of weeks, including weekends, to see your chronotype.',
  },
};

export function ChronotypeCard({ range, className }: { range: DateRange; className?: string }) {
  const fmt = useFormatters();
  const { data, isPending, isError, error, refetch } = useChronotype(range);

  return (
    <SectionCard
      title="Chronotype"
      description="Based on the midpoint of your sleep on free days"
      className={className}
    >
      {isPending ? (
        <Skeleton className="h-36" />
      ) : isError ? (
        <ErrorState compact error={error} onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-secondary/12 text-secondary">
              {createElement(KINDS[data.chronotype].icon, {
                className: 'size-7',
                'aria-hidden': true,
              })}
            </span>
            <div>
              <p className="text-2xl font-semibold">{KINDS[data.chronotype].label}</p>
              <p className="text-sm text-base-content/60">{data.nights_analyzed} nights analysed</p>
            </div>
          </div>
          <p className="text-sm text-base-content/75">{KINDS[data.chronotype].text}</p>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-field bg-base-200/60 p-3">
              <dt className="text-xs text-base-content/55">Mid-sleep</dt>
              <dd className="mt-0.5 text-lg font-semibold">{fmt.clock(data.mid_sleep)}</dd>
            </div>
            <div className="rounded-field bg-base-200/60 p-3">
              <dt className="text-xs text-base-content/55">Social jet lag</dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {data.social_jetlag_minutes === null
                  ? '—'
                  : formatDuration(data.social_jetlag_minutes)}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-base-content/55">
            Social jet lag is the shift between your sleep on work nights and free nights. Under an
            hour is comfortable.
          </p>
        </div>
      )}
    </SectionCard>
  );
}
