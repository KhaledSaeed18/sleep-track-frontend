'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useUiStore } from '@/stores/ui-store';

function blur() {
  (document.activeElement as HTMLElement | null)?.blur();
}

export function SessionActions({
  id,
  label,
  onDelete,
}: {
  id: string;
  label: string;
  onDelete: () => void;
}) {
  const openEditor = useUiStore((state) => state.openSessionEditor);
  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-square btn-ghost btn-sm"
        aria-label={`Actions for ${label}`}
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </div>
      <ul
        tabIndex={-1}
        className="menu dropdown-content z-30 mt-1 w-40 rounded-box border border-(--hairline) bg-base-100 p-1.5 shadow-xl"
      >
        <li>
          <Link href={`/journal/${id}`} onClick={blur}>
            <Eye className="size-4" aria-hidden="true" /> View
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              blur();
              openEditor({ mode: 'edit', sessionId: id });
            }}
          >
            <Pencil className="size-4" aria-hidden="true" /> Edit
          </button>
        </li>
        <li>
          <button
            type="button"
            className="text-error"
            onClick={() => {
              blur();
              onDelete();
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Delete
          </button>
        </li>
      </ul>
    </div>
  );
}
