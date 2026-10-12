'use client';

import {
  CalendarDays,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Tags as TagsIcon,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTags } from '@/features/tags/hooks';
import { TagIcon } from '@/features/tags/components/tag-icon';
import { lastNDays } from '@/features/analytics/lib/ranges';
import { useFormatters } from '@/hooks/use-preferences';
import { formatLocalDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import {
  QUALITY_FILTERS,
  SORT_OPTIONS,
  type useJournalFilters,
} from '../../hooks/use-journal-filters';

type Filters = ReturnType<typeof useJournalFilters>;

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  useEffect(() => {
    if (draft === value) return;
    const id = window.setTimeout(() => onChange(draft), 300);
    return () => window.clearTimeout(id);
  }, [draft, value, onChange]);

  return (
    <label className="input w-full sm:w-64">
      <Search className="size-4 text-base-content/45" aria-hidden="true" />
      <input
        type="search"
        placeholder="Search notes"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Search notes"
      />
    </label>
  );
}

function rangeLabel(from: string, to: string) {
  if (!from && !to) return 'Any date';
  if (from && to) return `${formatLocalDate(from, 'MMM d')} – ${formatLocalDate(to, 'MMM d')}`;
  return from ? `From ${formatLocalDate(from, 'MMM d')}` : `Until ${formatLocalDate(to, 'MMM d')}`;
}

function closeDropdown() {
  (document.activeElement as HTMLElement | null)?.blur();
}

export function JournalFilters({ filters }: { filters: Filters }) {
  const { state, setFilters, clear, activeCount } = filters;
  const fmt = useFormatters();
  const { data: tags } = useTags();
  const today = fmt.today();

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox value={state.q} onChange={(q) => setFilters({ q })} />

        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={cn(
              'btn h-10 gap-2 font-normal btn-sm',
              (state.from || state.to) && 'btn-active',
            )}
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {rangeLabel(state.from, state.to)}
            <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
          </div>
          <div
            tabIndex={-1}
            className="dropdown-content z-30 mt-2 w-72 rounded-box border border-(--hairline) bg-base-100 p-4 shadow-xl"
          >
            <p className="mb-2 text-xs font-medium text-base-content/60">Quick ranges</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  className="btn btn-xs"
                  onClick={() => {
                    const range = lastNDays(days, today);
                    setFilters({ from: range.from, to: range.to });
                    closeDropdown();
                  }}
                >
                  Last {days} nights
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs">
                <span className="mb-1 block text-base-content/60">From</span>
                <input
                  type="date"
                  className="input w-full input-sm"
                  value={state.from}
                  max={state.to || today}
                  onChange={(event) => setFilters({ from: event.target.value })}
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-base-content/60">To</span>
                <input
                  type="date"
                  className="input w-full input-sm"
                  value={state.to}
                  min={state.from || undefined}
                  max={today}
                  onChange={(event) => setFilters({ to: event.target.value })}
                />
              </label>
            </div>
            {(state.from || state.to) && (
              <button
                type="button"
                className="btn mt-3 btn-ghost btn-xs"
                onClick={() => setFilters({ from: '', to: '' })}
              >
                Clear dates
              </button>
            )}
          </div>
        </div>

        <select
          className="select h-10 w-auto select-sm"
          value={state.quality}
          onChange={(event) => setFilters({ quality: event.target.value as typeof state.quality })}
          aria-label="Filter by quality"
        >
          {QUALITY_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={cn(
              'btn h-10 gap-2 font-normal btn-sm',
              state.tags.length > 0 && 'btn-active',
            )}
          >
            <TagsIcon className="size-4" aria-hidden="true" />
            {state.tags.length
              ? `${String(state.tags.length)} ${state.tags.length === 1 ? 'tag' : 'tags'}`
              : 'Tags'}
            <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
          </div>
          <ul
            tabIndex={-1}
            className="menu dropdown-content z-30 mt-2 max-h-80 w-60 flex-nowrap overflow-y-auto rounded-box border border-(--hairline) bg-base-100 p-1.5 shadow-xl"
          >
            {tags?.map((tag) => {
              const checked = state.tags.includes(tag.id);
              return (
                <li key={tag.id}>
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={checked}
                      onChange={() =>
                        setFilters({
                          tags: checked
                            ? state.tags.filter((id) => id !== tag.id)
                            : [...state.tags, tag.id],
                        })
                      }
                    />
                    <TagIcon icon={tag.icon} className="size-3.5" style={{ color: tag.color }} />
                    <span className="flex-1">{tag.name}</span>
                    <span className="tabular text-xs text-base-content/45">{tag.usage_count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        {activeCount > 0 && (
          <button type="button" className="btn h-10 gap-1.5 btn-ghost btn-sm" onClick={clear}>
            <X className="size-3.5" aria-hidden="true" /> Clear filters
            <span className="badge badge-sm badge-primary">{activeCount}</span>
          </button>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <SlidersHorizontal className="size-4 text-base-content/50" aria-hidden="true" />
        <span className="sr-only">Sort by</span>
        <select
          className="select h-10 w-auto select-sm"
          value={state.sort}
          onChange={(event) => setFilters({ sort: event.target.value as typeof state.sort })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
