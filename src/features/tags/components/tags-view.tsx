'use client';

import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { pluralize } from '@/lib/format';
import type { Tag } from '@/types/models';
import { useDeleteTag, useTags } from '../hooks';
import { TagDialog } from './tag-dialog';
import { TagIcon } from './tag-icon';

export function TagsView() {
  const tags = useTags();
  const remove = useDeleteTag();
  const [editing, setEditing] = useState<Tag | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Tag | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Mark caffeine, workouts, late meals or anything else, then see how they relate to your sleep."
        actions={
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus className="size-4" aria-hidden="true" /> New tag
          </button>
        }
      />

      <section className="surface overflow-hidden">
        {tags.isPending ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : tags.isError ? (
          <ErrorState error={tags.error} onRetry={() => void tags.refetch()} />
        ) : tags.data.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No tags yet"
            description="Create a tag, then add it to nights from the journal or the sleep timer."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
                Create a tag
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-(--hairline)">
            {tags.data.map((tag) => (
              <li key={tag.id} className="flex items-center gap-4 px-5 py-3.5">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${tag.color} 18%, transparent)`,
                    color: tag.color,
                  }}
                >
                  <TagIcon icon={tag.icon} className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {tag.name}
                    {tag.is_system && <span className="badge badge-ghost badge-xs">Default</span>}
                  </p>
                  <p className="text-sm text-base-content/55">
                    {tag.usage_count
                      ? `Used on ${pluralize(tag.usage_count, 'night')}`
                      : 'Not used yet'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="btn btn-square btn-ghost btn-sm"
                    aria-label={`Edit ${tag.name}`}
                    onClick={() => {
                      setEditing(tag);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-square btn-ghost text-error btn-sm"
                    aria-label={`Delete ${tag.name}`}
                    onClick={() => setDeleting(tag)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <TagDialog open={dialogOpen} tag={editing} onClose={() => setDialogOpen(false)} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.name ?? ''}”?`}
        description={
          deleting?.usage_count
            ? `It will be removed from ${pluralize(deleting.usage_count, 'night')}. The nights themselves stay.`
            : 'This tag is not used on any nights.'
        }
        confirmLabel="Delete tag"
        tone="error"
        pending={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
