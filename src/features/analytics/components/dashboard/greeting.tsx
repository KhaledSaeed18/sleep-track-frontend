'use client';

import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useUser } from '@/features/auth';
import { useFormatters } from '@/hooks/use-preferences';
import { useMounted } from '@/hooks/use-mounted';
import { inZone } from '@/lib/date';
import { useUiStore } from '@/stores/ui-store';

function partOfDay(hour: number) {
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Greeting() {
  const user = useUser();
  const fmt = useFormatters();
  const mounted = useMounted();
  const openEditor = useUiStore((state) => state.openSessionEditor);
  const local = inZone(new Date(), fmt.zone);
  const greeting = mounted ? partOfDay(local.getHours()) : 'Hello';

  return (
    <PageHeader
      title={`${greeting}, ${user.first_name}`}
      description={mounted ? fmt.pattern(new Date(), 'EEEE, MMMM d') : ' '}
      actions={
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openEditor({ mode: 'create' })}
        >
          <Plus className="size-4" aria-hidden="true" /> Log a night
        </button>
      }
    />
  );
}
