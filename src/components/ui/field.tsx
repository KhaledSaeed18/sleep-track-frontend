'use client';

import { Eye, EyeOff } from 'lucide-react';
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

interface FieldShellProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  labelAction?: ReactNode;
}

export function FieldShell({
  id,
  label,
  hint,
  error,
  children,
  className,
  labelAction,
}: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {(label || labelAction) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <label htmlFor={id} className="field-label">
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
  labelAction?: ReactNode;
  ref?: React.Ref<HTMLInputElement>;
}

export function TextField({
  label,
  hint,
  error,
  leading,
  trailing,
  containerClassName,
  className,
  id,
  labelAction,
  ref,
  ...props
}: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <FieldShell
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      className={containerClassName}
      labelAction={labelAction}
    >
      <label className={cn('input w-full', error && 'input-error', className)}>
        {leading}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          className="grow"
          {...props}
        />
        {trailing}
      </label>
    </FieldShell>
  );
}

export function PasswordField(props: Omit<TextFieldProps, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="btn -mr-1 btn-circle btn-ghost btn-xs"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  containerClassName?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function TextAreaField({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  ref,
  ...props
}: TextAreaFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} className={containerClassName}>
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        className={cn('textarea w-full', error && 'textarea-error', className)}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  containerClassName?: string;
  ref?: React.Ref<HTMLSelectElement>;
}

export function SelectField({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  children,
  ref,
  ...props
}: SelectFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} className={containerClassName}>
      <select
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        className={cn('select w-full', error && 'select-error', className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
