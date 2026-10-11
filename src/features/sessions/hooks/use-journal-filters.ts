'use client';

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useMemo } from 'react';
import type { SessionFilters } from '@/lib/query-keys';

export const SORT_OPTIONS = [
  { value: '-started_at', label: 'Newest first' },
  { value: 'started_at', label: 'Oldest first' },
  { value: '-duration_minutes', label: 'Longest' },
  { value: 'duration_minutes', label: 'Shortest' },
  { value: '-score', label: 'Best score' },
  { value: 'score', label: 'Lowest score' },
  { value: '-quality', label: 'Best quality' },
] as const;

export const QUALITY_FILTERS = [
  { value: 'any', label: 'Any quality' },
  { value: 'great', label: '4 stars and up' },
  { value: 'ok', label: '3 stars and up' },
  { value: 'poor', label: '2 stars or less' },
] as const;

const sortValues = SORT_OPTIONS.map((option) => option.value);
const qualityValues = QUALITY_FILTERS.map((option) => option.value);

export const PAGE_SIZES = [10, 20, 50, 100] as const;

export function useJournalFilters() {
  const [state, setState] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      from: parseAsString.withDefault(''),
      to: parseAsString.withDefault(''),
      quality: parseAsStringLiteral(qualityValues).withDefault('any'),
      tags: parseAsArrayOf(parseAsString).withDefault([]),
      sort: parseAsStringLiteral(sortValues).withDefault('-started_at'),
      page: parseAsInteger.withDefault(1),
      size: parseAsInteger.withDefault(20),
    },
    { history: 'replace', clearOnDefault: true },
  );

  const apiFilters = useMemo<SessionFilters>(() => {
    const filters: SessionFilters = {
      page: state.page,
      page_size: PAGE_SIZES.includes(state.size as (typeof PAGE_SIZES)[number]) ? state.size : 20,
      sort: state.sort,
    };
    if (state.q.trim()) filters.q = state.q.trim();
    if (state.from) filters.from = state.from;
    if (state.to) filters.to = state.to;
    if (state.tags.length) filters.tag_ids = state.tags.join(',');
    if (state.quality === 'great') filters.min_quality = 4;
    if (state.quality === 'ok') filters.min_quality = 3;
    if (state.quality === 'poor') filters.max_quality = 2;
    return filters;
  }, [state]);

  const activeCount = [
    state.q.trim(),
    state.from || state.to,
    state.quality !== 'any',
    state.tags.length > 0,
  ].filter(Boolean).length;

  return {
    state,
    apiFilters,
    activeCount,
    /** Updates filters and returns to the first page. */
    setFilters: (patch: Partial<Omit<typeof state, 'page'>>) =>
      void setState({ ...patch, page: 1 }),
    setPage: (page: number) => void setState({ page }),
    clear: () =>
      void setState({ q: null, from: null, to: null, quality: null, tags: null, page: null }),
  };
}
