import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/models';
import { TagIcon } from './tag-icon';

interface TagChipProps {
  tag: Pick<Tag, 'name' | 'color' | 'icon'>;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function TagChip({ tag, size = 'sm', className }: TagChipProps) {
  const sizeClass = { xs: 'badge-xs', sm: 'badge-sm', md: 'badge-md' }[size];
  return (
    <span
      className={cn(
        'badge gap-1 rounded-full border font-medium whitespace-nowrap',
        sizeClass,
        className,
      )}
      style={
        {
          backgroundColor: `color-mix(in oklab, ${tag.color} 16%, transparent)`,
          borderColor: `color-mix(in oklab, ${tag.color} 35%, transparent)`,
          color: `color-mix(in oklab, ${tag.color} 70%, var(--color-base-content))`,
        } as CSSProperties
      }
    >
      <TagIcon icon={tag.icon} className={size === 'xs' ? 'size-2.5' : 'size-3'} />
      {tag.name}
    </span>
  );
}
