'use client';

import type { ReactNode } from 'react';
import { Modal } from './modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'error' | 'primary' | 'warning';
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
  confirmDisabled?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  pending = false,
  onConfirm,
  onClose,
  children,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const toneClass = { error: 'btn-error', primary: 'btn-primary', warning: 'btn-warning' }[tone];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      dismissible={!pending}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${toneClass}`}
            onClick={onConfirm}
            disabled={pending || confirmDisabled}
          >
            {pending && <span className="loading loading-sm loading-spinner" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
