'use client';

import { Download, NotebookPen, Plus, SearchX, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useFormatters } from '@/hooks/use-preferences';
import { pluralize } from '@/lib/format';
import { useUiStore } from '@/stores/ui-store';
import type { SleepSession } from '@/types/models';
import { useBulkDeleteSessions, useDeleteSession, useSessions } from '../../hooks';
import { PAGE_SIZES, useJournalFilters } from '../../hooks/use-journal-filters';
import { JournalFilters } from './journal-filters';
import { SessionsTable } from './sessions-table';

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function JournalView() {
  const filters = useJournalFilters();
  const fmt = useFormatters();
  const openEditor = useUiStore((state) => state.openSessionEditor);
  const sessions = useSessions(filters.apiFilters);
  const deleteOne = useDeleteSession();
  const bulkDelete = useBulkDeleteSessions();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<SleepSession | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const items = sessions.data?.items ?? [];
  const visibleSelected = new Set(
    items.filter((item) => selected.has(item.id)).map((item) => item.id),
  );

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const allSelected = items.every((item) => selected.has(item.id));
    setSelected((current) => {
      const next = new Set(current);
      for (const item of items) {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  }

  const hasData = (sessions.data?.total ?? 0) > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sleep journal"
        description="Every night you have logged. Filter, search, edit or clean up."
        actions={
          <>
            <Link href="/settings/data" className="btn btn-ghost">
              <Download className="size-4" aria-hidden="true" /> Export
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openEditor({ mode: 'create' })}
            >
              <Plus className="size-4" aria-hidden="true" /> Log a night
            </button>
          </>
        }
      />

      <JournalFilters filters={filters} />

      <section className="surface overflow-hidden" aria-label="Logged nights">
        {visibleSelected.size > 0 && (
          <div
            className="flex items-center gap-3 border-b border-(--hairline) bg-primary/8 px-4 py-2.5"
            role="region"
            aria-label="Bulk actions"
          >
            <span className="text-sm font-medium">
              {pluralize(visibleSelected.size, 'night')} selected
            </span>
            <button
              type="button"
              className="btn ml-auto btn-soft btn-error btn-sm"
              onClick={() => setBulkOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelected(new Set())}
            >
              <X className="size-4" aria-hidden="true" /> Clear
            </button>
          </div>
        )}

        {sessions.isPending ? (
          <TableSkeleton />
        ) : sessions.isError ? (
          <ErrorState error={sessions.error} onRetry={() => void sessions.refetch()} />
        ) : !hasData && filters.activeCount === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="Your journal is empty"
            description="Log a night by hand or use the sleep timer. Each entry adds to your trends and insights."
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => openEditor({ mode: 'create' })}
              >
                Log your first night
              </button>
            }
          />
        ) : !hasData ? (
          <EmptyState
            icon={SearchX}
            title="No nights match these filters"
            description="Try a wider date range or fewer tags."
            action={
              <button type="button" className="btn btn-sm" onClick={filters.clear}>
                Clear filters
              </button>
            }
          />
        ) : (
          <SessionsTable
            sessions={items}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            onDelete={setPendingDelete}
            busy={sessions.isPlaceholderData}
          />
        )}
      </section>

      {sessions.data && hasData && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <Pagination
            className="w-full sm:w-auto sm:flex-1"
            page={sessions.data.page}
            pages={sessions.data.pages}
            total={sessions.data.total}
            pageSize={sessions.data.page_size}
            onChange={(page) => {
              filters.setPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <label className="flex items-center gap-2 text-sm text-base-content/65">
            Per page
            <select
              className="select w-20 select-sm"
              value={filters.state.size}
              onChange={(event) => filters.setFilters({ size: Number(event.target.value) })}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this night?"
        description={
          pendingDelete
            ? `The night of ${fmt.localDate(pendingDelete.night_of, 'EEEE, MMMM d')} will be removed from your journal and stats.`
            : undefined
        }
        confirmLabel="Delete night"
        tone="error"
        pending={deleteOne.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          const id = pendingDelete.id;
          setPendingDelete(null);
          setSelected((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
          deleteOne.mutate(id);
        }}
      />

      <ConfirmDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title={`Delete ${pluralize(visibleSelected.size, 'night')}?`}
        description="These nights will be removed from your journal and stats. This cannot be undone."
        confirmLabel={`Delete ${pluralize(visibleSelected.size, 'night')}`}
        tone="error"
        pending={bulkDelete.isPending}
        onConfirm={() => {
          const ids = [...visibleSelected];
          setBulkOpen(false);
          setSelected(new Set());
          bulkDelete.mutate(ids, {
            onSuccess: ({ deleted }) => toast.success(`${pluralize(deleted, 'night')} deleted`),
          });
        }}
      />
    </div>
  );
}
