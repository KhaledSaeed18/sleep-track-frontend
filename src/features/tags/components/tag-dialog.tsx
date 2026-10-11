'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { TextField } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Modal } from '@/components/ui/modal';
import { applyServerErrors } from '@/lib/forms';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types/models';
import { useCreateTag, useUpdateTag } from '../hooks';
import { TAG_COLORS, TAG_ICONS } from '../lib/icons';
import { tagSchema, type TagValues } from '../schemas';
import { TagChip } from './tag-chip';
import { TagIcon } from './tag-icon';

const FORM_ID = 'tag-form';

function TagForm({ tag, onDone }: { tag: Tag | null; onDone: () => void }) {
  const create = useCreateTag();
  const update = useUpdateTag();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TagValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name ?? '',
      color: tag?.color ?? TAG_COLORS[4],
      icon: tag?.icon ?? 'tag',
    },
  });
  const preview = useWatch({ control });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (tag) await update.mutateAsync({ id: tag.id, input: values });
      else await create.mutateAsync(values);
      onDone();
    } catch (error) {
      const message = applyServerErrors(error, setError, ['name', 'color', 'icon']);
      if (message) setError('root.server', { message });
    }
  });

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
      {errors.root?.server && <FormAlert tone="error">{errors.root.server.message}</FormAlert>}
      <TextField
        label="Name"
        placeholder="Late workout"
        maxLength={40}
        error={errors.name?.message}
        autoFocus
        {...register('name')}
      />
      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <fieldset>
            <legend className="field-label">Colour</legend>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-(--color-base-100) transition',
                    field.value === color && 'ring-2 ring-base-content',
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => field.onChange(color)}
                  aria-label={`Colour ${color}`}
                  aria-pressed={field.value === color}
                >
                  {field.value === color && (
                    <Check className="size-4 text-white" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      />
      <Controller
        control={control}
        name="icon"
        render={({ field }) => (
          <fieldset>
            <legend className="field-label">Icon</legend>
            <div className="grid grid-cols-8 gap-1.5">
              {Object.keys(TAG_ICONS).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={cn(
                    'btn btn-square btn-ghost btn-sm',
                    field.value === name && 'btn-active ring-1 ring-primary',
                  )}
                  onClick={() => field.onChange(name)}
                  aria-label={name.replace(/-\d$/, '').replace('-', ' ')}
                  aria-pressed={field.value === name}
                >
                  <TagIcon icon={name} className="size-4" />
                </button>
              ))}
            </div>
          </fieldset>
        )}
      />
      <div className="flex items-center gap-3 rounded-field bg-base-200/60 p-3 text-sm">
        <span className="text-base-content/60">Preview</span>
        <TagChip
          tag={{
            name: preview.name?.trim() || 'Tag name',
            color: preview.color ?? TAG_COLORS[4],
            icon: preview.icon ?? null,
          }}
          size="md"
        />
      </div>
    </form>
  );
}

export function TagDialog({
  open,
  tag,
  onClose,
}: {
  open: boolean;
  tag: Tag | null;
  onClose: () => void;
}) {
  const create = useCreateTag();
  const update = useUpdateTag();
  const pending = create.isPending || update.isPending;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tag ? 'Edit tag' : 'New tag'}
      description="Tags mark things that might affect your sleep, so insights can compare nights with and without them."
      dismissible={!pending}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={pending}>
            {pending && <span className="loading loading-sm loading-spinner" aria-hidden="true" />}
            {tag ? 'Save tag' : 'Create tag'}
          </button>
        </>
      }
    >
      {open && <TagForm key={tag?.id ?? 'new'} tag={tag} onDone={onClose} />}
    </Modal>
  );
}
