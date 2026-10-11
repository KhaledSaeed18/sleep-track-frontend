'use client';

import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Segmented } from '@/components/ui/segmented';
import { useFormatters } from '@/hooks/use-preferences';
import type { DateRange } from '@/lib/query-keys';
import {
  MAX_RANGE_DAYS,
  RANGE_PRESETS,
  isValidRange,
  lastNight,
  presetRange,
  type RangePreset,
} from '../../lib/ranges';

const OPTIONS = [
  ...RANGE_PRESETS.map(({ value, label }) => ({ value, label })),
  { value: 'custom', label: 'Custom' },
] as const;
type Option = (typeof OPTIONS)[number]['value'];

/** Analytics range synced to the URL (`?range=30d` or `?range=custom&from=…&to=…`). */
export function useAnalyticsRange() {
  const fmt = useFormatters();
  const today = fmt.today();
  const [state, setState] = useQueryStates(
    {
      range: parseAsStringLiteral(OPTIONS.map((o) => o.value)).withDefault('30d'),
      from: parseAsString.withDefault(''),
      to: parseAsString.withDefault(''),
    },
    { history: 'replace', clearOnDefault: true },
  );
  const custom = { from: state.from, to: state.to };
  const range: DateRange =
    state.range === 'custom' && isValidRange(custom)
      ? custom
      : presetRange(state.range === 'custom' ? '30d' : (state.range as RangePreset), today);
  return { option: state.range as Option, range, today, custom, setState };
}

export function RangePicker({ value }: { value: ReturnType<typeof useAnalyticsRange> }) {
  const { option, range, today, setState } = value;
  const maxDate = lastNight(today);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented
        label="Date range"
        value={option}
        options={OPTIONS}
        onChange={(next) =>
          void setState(
            next === 'custom'
              ? { range: next, from: range.from, to: range.to }
              : { range: next, from: null, to: null },
          )
        }
      />
      {option === 'custom' && (
        <div className="join">
          <input
            type="date"
            className="input join-item w-40 input-sm"
            aria-label="From"
            value={range.from}
            max={range.to}
            onChange={(event) => void setState({ from: event.target.value })}
          />
          <input
            type="date"
            className="input join-item w-40 input-sm"
            aria-label="To"
            value={range.to}
            min={range.from}
            max={maxDate}
            onChange={(event) => void setState({ to: event.target.value })}
          />
        </div>
      )}
      {option === 'custom' && (
        <span className="text-xs text-base-content/50">Up to {MAX_RANGE_DAYS} days</span>
      )}
    </div>
  );
}
