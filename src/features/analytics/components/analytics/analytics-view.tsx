'use client';

import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/states';
import { formatLocalDate } from '@/lib/date';
import { useUiStore } from '@/stores/ui-store';
import { useOverview } from '../../hooks';
import { rangeLength } from '../../lib/ranges';
import { TrendCard } from '../dashboard/trend-card';
import { overviewTiles, StatTiles } from '../stat-tiles';
import { ChronotypeCard } from './chronotype-card';
import { RangePicker, useAnalyticsRange } from './range-picker';
import {
  DistributionSection,
  SleepWindowSection,
  TagImpactSection,
  WeekdaySection,
  YearHeatmapSection,
} from './sections';

export function AnalyticsView() {
  const picker = useAnalyticsRange();
  const { range } = picker;
  const overview = useOverview(range);
  const openEditor = useUiStore((state) => state.openSessionEditor);
  const days = rangeLength(range);
  const label = `${formatLocalDate(range.from, 'MMM d')} – ${formatLocalDate(range.to, 'MMM d, yyyy')}`;
  const empty = overview.data?.nights_tracked === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={`Patterns across ${String(days)} nights, ${label}.`}
        actions={<RangePicker value={picker} />}
      />

      <StatTiles
        tiles={overviewTiles(overview.data, `last ${String(days)} days`)}
        loading={overview.isPending}
      />

      {empty ? (
        <section className="surface">
          <EmptyState
            icon={BarChart3}
            title="No nights in this range"
            description="Pick a wider range, or log a few nights to start seeing patterns."
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => openEditor({ mode: 'create' })}
              >
                Log a night
              </button>
            }
          />
        </section>
      ) : (
        <>
          <TrendCard range={range} title="Nightly trend" />
          <SleepWindowSection range={range} />
          <div className="grid gap-6 lg:grid-cols-2">
            <WeekdaySection range={range} />
            <DistributionSection range={range} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <TagImpactSection range={range} className="lg:col-span-2" />
            <ChronotypeCard range={range} />
          </div>
        </>
      )}

      <YearHeatmapSection />
    </div>
  );
}
