'use client';

import { Modal } from '@/components/ui/modal';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { useGoal } from '@/features/goals/hooks';
import { useFormatters } from '@/hooks/use-preferences';
import { useUiStore } from '@/stores/ui-store';
import { useCreateSession, useSession, useUpdateSession } from '../hooks';
import { defaultSessionValues, formValuesToInput, sessionToFormValues } from '../lib/defaults';
import { SessionForm } from './session-form';

const FORM_ID = 'session-editor-form';

function FormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

/** Global create/edit sheet for sleep sessions, opened from anywhere through the UI store. */
export function SessionEditor() {
  const editor = useUiStore((state) => state.sessionEditor);
  const close = useUiStore((state) => state.closeSessionEditor);
  const fmt = useFormatters();
  const goal = useGoal();
  const editingId = editor?.mode === 'edit' ? editor.sessionId : null;
  const session = useSession(editingId);
  const create = useCreateSession();
  const update = useUpdateSession();
  const pending = create.isPending || update.isPending;

  const open = editor !== null;
  const ready = editor?.mode === 'create' ? !goal.isPending : !!session.data;
  const formKey =
    editor?.mode === 'edit'
      ? `edit-${editor.sessionId}-${session.data?.updated_at ?? ''}`
      : `create-${String(open)}`;

  return (
    <Modal
      open={open}
      onClose={close}
      variant="sheet"
      dismissible={!pending}
      title={editor?.mode === 'edit' ? 'Edit night' : 'Log a night'}
      description={
        editor?.mode === 'edit'
          ? 'Adjust the details of this night.'
          : `Times are in ${fmt.zone.replace(/_/g, ' ')}.`
      }
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={close} disabled={pending}>
            Cancel
          </button>
          <button
            type="submit"
            form={FORM_ID}
            className="btn min-w-28 btn-primary"
            disabled={pending || !ready}
          >
            {pending && <span className="loading loading-sm loading-spinner" aria-hidden="true" />}
            {editor?.mode === 'edit' ? 'Save changes' : 'Save night'}
          </button>
        </>
      }
    >
      {open &&
        (editor.mode === 'edit' && session.isError ? (
          <ErrorState error={session.error} onRetry={() => void session.refetch()} />
        ) : !ready ? (
          <FormSkeleton />
        ) : (
          <SessionForm
            key={formKey}
            id={FORM_ID}
            zone={fmt.zone}
            timeFormat={fmt.timeFormat}
            defaultValues={
              editor.mode === 'edit' && session.data
                ? sessionToFormValues(session.data, fmt.zone)
                : defaultSessionValues(fmt.zone, goal.data)
            }
            onSubmit={async (values) => {
              const input = formValuesToInput(values, fmt.zone);
              if (editor.mode === 'edit') {
                const { timezone: _timezone, ...changes } = input;
                await update.mutateAsync({ id: editor.sessionId, input: changes });
              } else {
                await create.mutateAsync(input);
              }
              close();
            }}
          />
        ))}
    </Modal>
  );
}
