'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** `sheet` slides from the bottom on mobile and docks to the right on large screens. */
  variant?: 'dialog' | 'sheet';
  className?: string;
  /** Prevent closing via backdrop or Escape, e.g. while a request is pending. */
  dismissible?: boolean;
}

const SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
} as const;

/** Accessible modal on top of the native `<dialog>` element, styled with daisyUI's `modal`. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'dialog',
  className,
  dismissible = true,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const placement =
    variant === 'sheet' ? 'modal-bottom lg:modal-end' : 'modal-bottom sm:modal-middle';

  return (
    <dialog
      ref={ref}
      className={cn('modal', placement)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => {
        if (open) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
    >
      <div
        className={cn(
          'modal-box flex max-h-[92dvh] flex-col gap-0 border border-(--hairline) bg-base-100 p-0',
          variant === 'sheet'
            ? 'lg:h-dvh lg:max-h-dvh lg:w-full lg:max-w-xl lg:rounded-none'
            : SIZES[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-base-content/70">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn -mt-1 -mr-2 btn-circle shrink-0 btn-ghost btn-sm"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        {children && (
          <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto px-6 pb-6">{children}</div>
        )}
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-(--hairline) bg-base-100 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => dismissible && onClose()}
        >
          close
        </button>
      </form>
    </dialog>
  );
}
