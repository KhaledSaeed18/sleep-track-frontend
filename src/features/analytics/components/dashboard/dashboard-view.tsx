'use client';

import { useSearchParams } from 'next/navigation';
import { useGoal } from '@/features/goals/hooks';
import { TimerCard } from '@/features/timer/components/timer-card';
import { useFormatters } from '@/hooks/use-preferences';
import { FormAlert } from '@/components/ui/form-alert';
import { useDaily, useOverview } from '../../hooks';
import { lastNDays } from '../../lib/ranges';
import { overviewTiles, StatTiles } from '../stat-tiles';
import { Greeting } from './greeting';
import { InsightsPreview } from './insights-preview';
import { LastNightCard } from './last-night-card';
import { RecentNights } from './recent-nights';
import { ScheduleCard } from './schedule-card';
import { StreakCard } from './streak-card';
import { TrendCard } from './trend-card';

export function DashboardView() {
  const fmt = useFormatters();
  const today = fmt.today();
  const week = lastNDays(7, today);
  const month = lastNDays(30, today);
  const overview = useOverview(week);
  const monthOverview = useOverview(month);
  const weekDaily = useDaily(week);
  const goal = useGoal();
  const welcome = useSearchParams().has('welcome');

  return (
    <div className="space-y-6">
      <Greeting />
      {welcome && (
        <FormAlert tone="success">
          Welcome to SleepTrack. Log last night or start the timer at bedtime. Your dashboard fills
          in as you go.
        </FormAlert>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <LastNightCard className="xl:col-span-2" />
        <TimerCard />
      </div>

      <StatTiles tiles={overviewTiles(overview.data, 'last 7 days')} loading={overview.isPending} />

      <div className="grid gap-6 xl:grid-cols-3">
        <TrendCard range={month} className="xl:col-span-2" />
        <StreakCard
          overview={monthOverview.data}
          lastWeek={weekDaily.data}
          goalMinutes={goal.data?.target_duration_minutes ?? 480}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <InsightsPreview />
        <ScheduleCard overview={monthOverview.data} goal={goal.data} />
        <RecentNights className="lg:col-span-2 xl:col-span-1" />
      </div>
    </div>
  );
}
