/* eslint-disable @next/next/no-img-element -- avatars come from arbitrary user-supplied hosts */
import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl' } as const;

export function Avatar({ firstName, lastName, src, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('avatar', !src && 'avatar-placeholder', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          SIZE[size],
          !src && 'bg-linear-to-br from-primary/35 to-secondary/35 font-semibold text-base-content',
        )}
      >
        {src ? (
          <img src={src} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span aria-hidden="true">{initials(firstName, lastName)}</span>
        )}
      </div>
    </div>
  );
}
