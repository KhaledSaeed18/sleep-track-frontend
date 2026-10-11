import { TZDate } from '@date-fns/tz';
import type {
  Chronotype,
  DailyPoint,
  Distribution,
  Goal,
  Insight,
  Overview,
  SleepSession,
  Tag,
  TagImpact,
  WeekdayStat,
} from '@/types/models';
import { MOCK_TIMEZONE } from './db';

const DAY = 86_400_000;

function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

function fmtDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number): string {
  return fmtDate(new Date(parseDate(value).getTime() + days * DAY));
}

export function todayLocal(): string {
  const now = new TZDate(Date.now(), MOCK_TIMEZONE);
  return `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function resolveRange(from: string | null, to: string | null) {
  const end = to ?? addDays(todayLocal(), -1);
  const start = from ?? addDays(end, -29);
  const days = Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / DAY) + 1;
  return { from: start, to: end, days };
}

function inRange(sessions: SleepSession[], from: string, to: string) {
  return sessions.filter((s) => s.status === 'completed' && s.night_of >= from && s.night_of <= to);
}

function avg(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clockOf(iso: string): number {
  const local = new TZDate(new Date(iso).getTime(), MOCK_TIMEZONE);
  return local.getHours() * 60 + local.getMinutes();
}

function toClock(minutes: number): string {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

function circularMean(minutes: number[]): { mean: number; std: number } | null {
  if (!minutes.length) return null;
  let x = 0;
  let y = 0;
  for (const m of minutes) {
    const angle = (m / 1440) * 2 * Math.PI;
    x += Math.cos(angle);
    y += Math.sin(angle);
  }
  x /= minutes.length;
  y /= minutes.length;
  const mean = ((Math.atan2(y, x) / (2 * Math.PI)) * 1440 + 1440) % 1440;
  const r = Math.min(1, Math.sqrt(x * x + y * y));
  const std = (Math.sqrt(-2 * Math.log(Math.max(r, 1e-9))) / (2 * Math.PI)) * 1440;
  return { mean, std };
}

function round(value: number | null, digits = 0): number | null {
  if (value === null) return null;
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function periodStats(sessions: SleepSession[], goal: Goal, from: string, to: string) {
  const list = inRange(sessions, from, to);
  const bed = circularMean(list.map((s) => clockOf(s.started_at)));
  const wake = circularMean(list.filter((s) => s.ended_at).map((s) => clockOf(s.ended_at!)));
  const consistency =
    bed && wake ? Math.max(0, Math.round(100 - (bed.std + wake.std) / 2 / 1.2)) : null;
  return {
    list,
    bed,
    wake,
    consistency,
    duration: round(avg(list.map((s) => s.duration_minutes))),
    quality: round(avg(list.map((s) => s.quality)), 1),
    score: round(avg(list.map((s) => s.score))),
    goalTarget: goal.target_duration_minutes,
  };
}

export function overview(
  sessions: SleepSession[],
  goal: Goal,
  fromParam: string | null,
  toParam: string | null,
): Overview {
  const range = resolveRange(fromParam, toParam);
  const current = periodStats(sessions, goal, range.from, range.to);
  const prevTo = addDays(range.from, -1);
  const prevFrom = addDays(prevTo, -(range.days - 1));
  const previous = periodStats(sessions, goal, prevFrom, prevTo);
  const list = current.list;

  const met = (s: SleepSession) => (s.duration_minutes ?? 0) >= goal.target_duration_minutes - 15;
  const byNight = new Map(list.map((s) => [s.night_of, s]));
  let currentStreak = 0;
  for (let day = range.to; day >= range.from; day = addDays(day, -1)) {
    const s = byNight.get(day);
    if (s && met(s)) currentStreak += 1;
    else break;
  }
  let longest = 0;
  let run = 0;
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
    const s = byNight.get(day);
    run = s && met(s) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const debt = list.reduce(
    (sum, s) => sum + Math.max(0, goal.target_duration_minutes - (s.duration_minutes ?? 0)),
    0,
  );

  return {
    range,
    nights_tracked: list.length,
    total_sleep_minutes: list.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0),
    averages: {
      duration_minutes: current.duration,
      quality: current.quality,
      score: current.score,
      sleep_latency_minutes: round(avg(list.map((s) => s.sleep_latency_minutes))),
      awakenings: round(avg(list.map((s) => s.awakenings)), 1),
      mood_on_wake: round(avg(list.map((s) => s.mood_on_wake)), 1),
      bedtime: current.bed ? toClock(current.bed.mean) : null,
      wake_time: current.wake ? toClock(current.wake.mean) : null,
    },
    consistency_score: current.consistency,
    goal_attainment_rate: list.length ? round(list.filter(met).length / list.length, 2) : null,
    sleep_debt_minutes: Math.round(debt / Math.max(1, Math.ceil(range.days / 7))),
    current_streak: currentStreak,
    longest_streak: longest,
    previous_period: previous.list.length
      ? {
          duration_minutes: previous.duration,
          quality: previous.quality,
          score: previous.score,
          consistency_score: previous.consistency,
        }
      : null,
  };
}

export function daily(
  sessions: SleepSession[],
  fromParam: string | null,
  toParam: string | null,
): DailyPoint[] {
  const range = resolveRange(fromParam, toParam);
  const list = inRange(sessions, range.from, range.to);
  const points: DailyPoint[] = [];
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
    const nights = list.filter((s) => s.night_of === day);
    const first = nights[0];
    points.push({
      date: day,
      duration_minutes: nights.length
        ? nights.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0)
        : null,
      quality: round(avg(nights.map((s) => s.quality)), 1),
      score: round(avg(nights.map((s) => s.score))),
      bedtime: first ? toClock(clockOf(first.started_at)) : null,
      wake_time: first?.ended_at ? toClock(clockOf(first.ended_at)) : null,
      sessions: nights.length,
    });
  }
  return points;
}

export function weekday(
  sessions: SleepSession[],
  fromParam: string | null,
  toParam: string | null,
): WeekdayStat[] {
  const range = resolveRange(fromParam, toParam);
  const list = inRange(sessions, range.from, range.to);
  return Array.from({ length: 7 }, (_, index) => {
    const nights = list.filter((s) => (parseDate(s.night_of).getUTCDay() + 6) % 7 === index);
    const bed = circularMean(nights.map((s) => clockOf(s.started_at)));
    const wake = circularMean(nights.filter((s) => s.ended_at).map((s) => clockOf(s.ended_at!)));
    return {
      weekday: index,
      nights: nights.length,
      avg_duration_minutes: round(avg(nights.map((s) => s.duration_minutes))),
      avg_quality: round(avg(nights.map((s) => s.quality)), 1),
      avg_bedtime: bed ? toClock(bed.mean) : null,
      avg_wake_time: wake ? toClock(wake.mean) : null,
    };
  });
}

export function tagImpact(
  sessions: SleepSession[],
  tags: Tag[],
  fromParam: string | null,
  toParam: string | null,
): TagImpact[] {
  const range = resolveRange(fromParam, toParam);
  const list = inRange(sessions, range.from, range.to);
  return tags
    .map((tag) => {
      const withTag = list.filter((s) => s.tags.some((t) => t.id === tag.id));
      const without = list.filter((s) => !s.tags.some((t) => t.id === tag.id));
      const qWith = round(avg(withTag.map((s) => s.quality)), 1);
      const qWithout = round(avg(without.map((s) => s.quality)), 1);
      const dWith = round(avg(withTag.map((s) => s.duration_minutes)));
      const dWithout = round(avg(without.map((s) => s.duration_minutes)));
      return {
        tag,
        nights_with: withTag.length,
        avg_quality_with: qWith,
        avg_quality_without: qWithout,
        avg_duration_with: dWith,
        avg_duration_without: dWithout,
        quality_impact: qWith !== null && qWithout !== null ? round(qWith - qWithout, 1) : null,
        duration_impact_minutes:
          dWith !== null && dWithout !== null ? Math.round(dWith - dWithout) : null,
      };
    })
    .filter((item) => item.nights_with > 0)
    .sort((a, b) => Math.abs(b.quality_impact ?? 0) - Math.abs(a.quality_impact ?? 0));
}

export function distribution(
  sessions: SleepSession[],
  fromParam: string | null,
  toParam: string | null,
): Distribution {
  const range = resolveRange(fromParam, toParam);
  const list = inRange(sessions, range.from, range.to);
  const buckets = ['<5h', '5-6h', '6-7h', '7-8h', '8-9h', '9h+'] as const;
  const bucketOf = (minutes: number) =>
    buckets[Math.max(0, Math.min(5, Math.floor(minutes / 60) - 4))]!;
  return {
    duration: buckets.map((bucket) => ({
      bucket,
      count: list.filter((s) => bucketOf(s.duration_minutes ?? 0) === bucket).length,
    })),
    quality: [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: list.filter((s) => s.quality === rating).length,
    })),
    bedtime: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: list.filter((s) => Math.floor(clockOf(s.started_at) / 60) === hour).length,
    })),
  };
}

export function chronotype(
  sessions: SleepSession[],
  fromParam: string | null,
  toParam: string | null,
): Chronotype {
  const range = resolveRange(fromParam, toParam);
  const list = inRange(sessions, range.from, range.to);
  if (list.length < 5)
    return {
      chronotype: 'unknown',
      mid_sleep: null,
      social_jetlag_minutes: null,
      nights_analyzed: list.length,
    };
  const mid = (s: SleepSession) => clockOf(s.started_at) + (s.duration_minutes ?? 0) / 2;
  const free = list.filter((s) => [5, 6].includes(parseDate(s.night_of).getUTCDay()));
  const work = list.filter((s) => ![5, 6].includes(parseDate(s.night_of).getUTCDay()));
  const freeMid = circularMean(free.map(mid));
  const workMid = circularMean(work.map(mid));
  const midValue = freeMid?.mean ?? workMid?.mean ?? 0;
  const hours = midValue / 60;
  const kind =
    hours >= 2 && hours < 3.5
      ? 'early_bird'
      : hours >= 3.5 && hours < 5
        ? 'intermediate'
        : 'night_owl';
  let jetlag = freeMid && workMid ? freeMid.mean - workMid.mean : null;
  if (jetlag !== null && jetlag > 720) jetlag -= 1440;
  return {
    chronotype: kind,
    mid_sleep: toClock(midValue),
    social_jetlag_minutes: jetlag === null ? null : Math.round(Math.abs(jetlag)),
    nights_analyzed: list.length,
  };
}

export function insights(
  sessions: SleepSession[],
  tags: Tag[],
  goal: Goal,
  fromParam: string | null,
  toParam: string | null,
): Insight[] {
  const ov = overview(sessions, goal, fromParam, toParam);
  const impacts = tagImpact(sessions, tags, fromParam, toParam);
  const result: Insight[] = [];
  const worst = impacts.find((i) => (i.quality_impact ?? 0) <= -0.4 && i.nights_with >= 3);
  if (worst) {
    result.push({
      id: `tag-impact-${worst.tag.name.toLowerCase()}`,
      kind: 'warning',
      category: 'tags',
      title: `${worst.tag.name} lowers your sleep quality`,
      message: `On nights tagged ${worst.tag.name} your quality averages ${String(worst.avg_quality_with)} vs ${String(worst.avg_quality_without)} otherwise.`,
      metric: { label: 'Quality impact', value: (worst.quality_impact ?? 0).toFixed(1) },
      priority: 90,
    });
  }
  const best = impacts.find((i) => (i.quality_impact ?? 0) >= 0.3 && i.nights_with >= 3);
  if (best) {
    result.push({
      id: `tag-impact-${best.tag.name.toLowerCase()}`,
      kind: 'positive',
      category: 'tags',
      title: `${best.tag.name} goes with better nights`,
      message: `Quality averages ${String(best.avg_quality_with)} on ${best.tag.name} nights compared with ${String(best.avg_quality_without)} on the rest.`,
      metric: { label: 'Quality impact', value: `+${(best.quality_impact ?? 0).toFixed(1)}` },
      priority: 70,
    });
  }
  if (
    ov.averages.duration_minutes !== null &&
    ov.averages.duration_minutes < goal.target_duration_minutes - 20
  ) {
    const short = goal.target_duration_minutes - ov.averages.duration_minutes;
    result.push({
      id: 'duration-below-goal',
      kind: 'warning',
      category: 'duration',
      title: 'You are sleeping less than your goal',
      message: `You average ${String(Math.floor(ov.averages.duration_minutes / 60))}h ${String(ov.averages.duration_minutes % 60)}m, about ${String(short)} minutes short of your target each night.`,
      metric: { label: 'Short per night', value: `${String(short)}m` },
      priority: 85,
    });
  }
  if ((ov.consistency_score ?? 0) >= 75) {
    result.push({
      id: 'consistency-strong',
      kind: 'positive',
      category: 'consistency',
      title: 'Your schedule is steady',
      message:
        'Your bedtime and wake time vary little from night to night, which supports deeper sleep.',
      metric: { label: 'Consistency', value: String(ov.consistency_score) },
      priority: 60,
    });
  } else {
    result.push({
      id: 'consistency-low',
      kind: 'tip',
      category: 'consistency',
      title: 'Anchor your wake time',
      message:
        'Waking at the same time every day, weekends included, is the fastest way to steady your rhythm.',
      metric: { label: 'Consistency', value: String(ov.consistency_score ?? '—') },
      priority: 65,
    });
  }
  const wk = weekday(sessions, fromParam, toParam);
  const fri = wk[4];
  const tue = wk[1];
  if (fri?.avg_bedtime && tue?.avg_bedtime) {
    result.push({
      id: 'weekend-shift',
      kind: 'info',
      category: 'timing',
      title: 'Weekends shift your clock',
      message: `Friday bedtimes average ${fri.avg_bedtime} compared with ${tue.avg_bedtime} on Tuesdays. Large weekend shifts can leave Mondays feeling like jet lag.`,
      metric: null,
      priority: 50,
    });
  }
  result.push({
    id: 'tip-wind-down',
    kind: 'tip',
    category: 'habit',
    title: 'Try a 30-minute wind-down',
    message:
      'Dim lights and put screens away half an hour before your target bedtime to fall asleep faster.',
    metric: null,
    priority: 30,
  });
  if (ov.current_streak >= 3) {
    result.push({
      id: 'streak',
      kind: 'positive',
      category: 'goal',
      title: `${String(ov.current_streak)} nights on target`,
      message: 'You have met your sleep goal several nights in a row. Keep the routine going.',
      metric: { label: 'Streak', value: String(ov.current_streak) },
      priority: 75,
    });
  }
  return result.sort((a, b) => b.priority - a.priority);
}
