'use client';

import { useState } from 'react';
import { formatLocalDate, parseLocalDate, toLocalDate } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import type { DailyPoint, WeekStart } from '@/types/models';

const CELL = 12;
const GAP = 3;
const STEPS = [20, 40, 62, 82, 100];

function level(score: number | null): number {
  if (score === null) return -1;
  if (score < 55) return 0;
  if (score < 65) return 1;
  if (score < 75) return 2;
  if (score < 85) return 3;
  return 4;
}

function fill(lvl: number) {
  if (lvl < 0) return 'color-mix(in oklab, var(--color-base-content) 6%, transparent)';
  return `color-mix(in oklab, var(--chart-1) ${String(STEPS[lvl])}%, var(--color-base-200))`;
}

/** Year-at-a-glance grid of nightly scores, one column per week. */
export function CalendarHeatmap({ data, weekStart }: { data: DailyPoint[]; weekStart: WeekStart }) {
  const [active, setActive] = useState<DailyPoint | null>(null);
  if (!data.length) return null;

  const first = parseLocalDate(data[0]!.date);
  const offset = (first.getDay() - (weekStart === 'sunday' ? 0 : 1) + 7) % 7;
  const cells = data.map((point, index) => {
    const position = index + offset;
    return { point, col: Math.floor(position / 7), row: position % 7 };
  });
  const columns = (cells.at(-1)?.col ?? 0) + 1;
  const months: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (const cell of cells) {
    const month = parseLocalDate(cell.point.date).getMonth();
    if (month !== lastMonth && cell.row === 0) {
      months.push({ col: cell.col, label: formatLocalDate(cell.point.date, 'MMM') });
      lastMonth = month;
    }
  }
  const dayLabels =
    weekStart === 'sunday'
      ? ['Sun', '', 'Tue', '', 'Thu', '', 'Sat']
      : ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
  const width = 32 + columns * (CELL + GAP);
  const height = 18 + 7 * (CELL + GAP);
  const tracked = data.filter((d) => d.score !== null).length;

  return (
    <div>
      <div className="scrollbar-thin overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${String(width)} ${String(height)}`}
          className="h-auto w-full min-w-[640px]"
          role="img"
          aria-label={`Calendar of nightly sleep scores, ${String(tracked)} nights logged`}
          onMouseLeave={() => setActive(null)}
        >
          {months.map((month) => (
            <text
              key={`${month.label}-${String(month.col)}`}
              x={32 + month.col * (CELL + GAP)}
              y={10}
              fontSize={11}
              fill="var(--chart-axis)"
            >
              {month.label}
            </text>
          ))}
          {dayLabels.map((label, row) => (
            <text
              key={row}
              x={0}
              y={18 + row * (CELL + GAP) + CELL - 2}
              fontSize={10}
              fill="var(--chart-axis)"
            >
              {label}
            </text>
          ))}
          {cells.map(({ point, col, row }) => (
            <rect
              key={point.date}
              x={32 + col * (CELL + GAP)}
              y={18 + row * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={3}
              fill={fill(level(point.score))}
              stroke={active?.date === point.date ? 'var(--color-base-content)' : 'none'}
              strokeWidth={1.5}
              onMouseEnter={() => setActive(point)}
            >
              <title>{`${formatLocalDate(point.date, 'EEE, MMM d')}: ${point.score === null ? 'not logged' : `score ${String(point.score)}, ${formatDuration(point.duration_minutes)}`}`}</title>
            </rect>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <p className="min-h-4 text-base-content/70" aria-live="polite">
          {active
            ? `${formatLocalDate(active.date, 'EEEE, MMM d')}: ${active.score === null ? 'not logged' : `score ${String(active.score)}, ${formatDuration(active.duration_minutes)} asleep`}`
            : `${String(tracked)} nights logged since ${formatLocalDate(toLocalDate(first), 'MMMM yyyy')}`}
        </p>
        <div className="flex items-center gap-1.5 text-base-content/60" aria-hidden="true">
          <span>Score</span>
          <span className="mr-1">&lt;55</span>
          {STEPS.map((_, lvl) => (
            <span key={lvl} className="size-3 rounded-[3px]" style={{ background: fill(lvl) }} />
          ))}
          <span className="ml-1">85+</span>
        </div>
      </div>
    </div>
  );
}
