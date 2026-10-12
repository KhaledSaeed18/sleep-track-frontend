import { cn } from '@/lib/utils';

export function Kbd({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key) => (
        <kbd key={key} className="kbd kbd-sm">
          {key}
        </kbd>
      ))}
    </span>
  );
}
