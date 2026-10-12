'use client';

import { Check, Settings2 } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Skeleton } from '@/components/ui/states';
import { cn } from '@/lib/utils';
import { useTags } from '../hooks';
import { TagIcon } from './tag-icon';

interface TagPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  showManageLink?: boolean;
}

export function TagPicker({
  value,
  onChange,
  label = 'Tags',
  showManageLink = true,
}: TagPickerProps) {
  const { data: tags, isPending } = useTags();
  const selected = new Set(value);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  }

  return (
    <fieldset>
      <div className="mb-2 flex items-baseline justify-between">
        <legend className="field-label mb-0">{label}</legend>
        {showManageLink && (
          <Link
            href="/tags"
            className="inline-flex link items-center gap-1 text-xs text-base-content/60 link-hover"
          >
            <Settings2 className="size-3" aria-hidden="true" /> Manage
          </Link>
        )}
      </div>
      {isPending ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => {
            const active = selected.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(tag.id)}
                className={cn(
                  'btn h-8 min-h-8 gap-1.5 rounded-full px-3 font-medium transition-colors btn-sm',
                  active
                    ? 'border-transparent'
                    : 'border-(--hairline) btn-ghost text-base-content/75',
                )}
                style={
                  active
                    ? ({
                        backgroundColor: `color-mix(in oklab, ${tag.color} 22%, transparent)`,
                        color: `color-mix(in oklab, ${tag.color} 60%, var(--color-base-content))`,
                        borderColor: `color-mix(in oklab, ${tag.color} 45%, transparent)`,
                      } as CSSProperties)
                    : undefined
                }
              >
                {active ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <TagIcon icon={tag.icon} className="size-3.5" />
                )}
                {tag.name}
              </button>
            );
          })}
          {tags?.length === 0 && (
            <p className="text-sm text-base-content/60">
              No tags yet. Create some on the Tags page.
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
