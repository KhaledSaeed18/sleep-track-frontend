'use client';

import { Download, FileSpreadsheet, FileJson, TriangleAlert, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { PasswordField, TextField } from '@/components/ui/field';
import { FormAlert } from '@/components/ui/form-alert';
import { Modal } from '@/components/ui/modal';
import { SectionCard } from '@/components/ui/page-header';
import { useUser } from '@/features/auth';
import { errorMessage, isApiError, normaliseField } from '@/lib/api/errors';
import { fileSize, pluralize } from '@/lib/format';
import { downloadBlob } from '@/lib/utils';
import { useDeleteAccount, useExportData, useImportData } from '../hooks';

const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

function ExportCard() {
  const exporter = useExportData();
  function run(format: 'json' | 'csv') {
    exporter.mutate(format, {
      onSuccess: ({ blob, filename }) => {
        downloadBlob(blob, filename);
        toast.success('Export ready');
      },
    });
  }
  return (
    <SectionCard
      title="Export your data"
      description="Download everything you have logged. Your data is yours."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="btn h-auto justify-start gap-3 py-3 text-left"
          onClick={() => run('csv')}
          disabled={exporter.isPending}
        >
          <FileSpreadsheet className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-semibold">CSV</span>
            <span className="block text-xs font-normal text-base-content/60">
              Nights only, for spreadsheets
            </span>
          </span>
          {exporter.isPending && exporter.variables === 'csv' ? (
            <span className="loading ml-auto loading-xs loading-spinner" />
          ) : (
            <Download className="ml-auto size-4 opacity-60" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="btn h-auto justify-start gap-3 py-3 text-left"
          onClick={() => run('json')}
          disabled={exporter.isPending}
        >
          <FileJson className="size-5 shrink-0 text-secondary" aria-hidden="true" />
          <span>
            <span className="block font-semibold">JSON</span>
            <span className="block text-xs font-normal text-base-content/60">
              Profile, goals, tags and nights
            </span>
          </span>
          {exporter.isPending && exporter.variables === 'json' ? (
            <span className="loading ml-auto loading-xs loading-spinner" />
          ) : (
            <Download className="ml-auto size-4 opacity-60" aria-hidden="true" />
          )}
        </button>
      </div>
    </SectionCard>
  );
}

function ImportCard() {
  const importer = useImportData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const result = importer.data;

  function choose(selected: File | undefined) {
    importer.reset();
    setLocalError(null);
    if (!selected) return setFile(null);
    if (!selected.name.toLowerCase().endsWith('.csv')) return setLocalError('Choose a .csv file.');
    if (selected.size > MAX_IMPORT_BYTES)
      return setLocalError('That file is larger than 2 MB. Split it into smaller files.');
    setFile(selected);
  }

  return (
    <SectionCard
      title="Import from CSV"
      description="Bring nights over from another tracker or a spreadsheet."
    >
      <div className="space-y-4">
        <p className="text-sm text-base-content/70">
          The first row must include{' '}
          <code className="rounded bg-base-200 px-1">started_at,ended_at</code>. Optional columns:{' '}
          <code className="rounded bg-base-200 px-1">quality</code>,{' '}
          <code className="rounded bg-base-200 px-1">notes</code> and{' '}
          <code className="rounded bg-base-200 px-1">tags</code> (separated by semicolons). Times
          without an offset use your time zone.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="file-input w-full max-w-xs file-input-sm"
            aria-label="CSV file to import"
            onChange={(event) => choose(event.target.files?.[0])}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!file || importer.isPending}
            onClick={() =>
              file &&
              importer.mutate(file, {
                onSuccess: () => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                },
              })
            }
          >
            {importer.isPending ? (
              <span className="loading loading-xs loading-spinner" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            Import
          </button>
          {file && <span className="text-xs text-base-content/60">{fileSize(file.size)}</span>}
        </div>
        {localError && <FormAlert tone="error">{localError}</FormAlert>}
        {importer.isError && <FormAlert tone="error">{errorMessage(importer.error)}</FormAlert>}
        {result && (
          <div className="space-y-3" aria-live="polite">
            <div className="stats w-full stats-horizontal bg-base-200/60">
              <div className="stat py-3">
                <div className="stat-title">Imported</div>
                <div className="stat-value text-2xl text-success">{result.imported}</div>
              </div>
              <div className="stat py-3">
                <div className="stat-title">Skipped</div>
                <div className="stat-value text-2xl">{result.skipped}</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="collapse-arrow collapse rounded-field bg-base-200/60">
                <input type="checkbox" aria-label="Show rows that were skipped" />
                <div className="collapse-title text-sm font-medium">
                  {pluralize(result.errors.length, 'row')} could not be imported
                </div>
                <div className="collapse-content">
                  <ul className="max-h-60 space-y-1 overflow-y-auto text-sm">
                    {result.errors.map((item) => (
                      <li key={`${String(item.row)}-${item.message}`}>
                        <span className="tabular text-base-content/55">Row {item.row}:</span>{' '}
                        {item.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function DeleteAccountCard() {
  const user = useUser();
  const remove = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  function submit() {
    setFieldError(null);
    remove.mutate(
      { confirm: 'DELETE', password: user.has_password ? password : null },
      {
        onError: (error) => {
          const passwordError = isApiError(error)
            ? error.fieldErrors.find((item) => normaliseField(item.field) === 'password')
            : undefined;
          setFieldError(passwordError?.message ?? errorMessage(error));
        },
      },
    );
  }

  return (
    <section
      className="rounded-box border border-error/30 bg-error/5 p-5"
      aria-labelledby="danger-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-lg">
          <h2 id="danger-title" className="flex items-center gap-2 font-semibold text-error">
            <TriangleAlert className="size-4" aria-hidden="true" /> Delete account
          </h2>
          <p className="mt-1 text-sm text-base-content/70">
            Permanently delete your account, every night you have logged, your tags and goals. This
            cannot be undone.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-error btn-sm"
          onClick={() => setOpen(true)}
        >
          Delete account
        </button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        dismissible={!remove.isPending}
        title="Delete your account?"
        description="Consider exporting your data first."
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
              disabled={remove.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error"
              onClick={submit}
              disabled={
                confirm !== 'DELETE' || (user.has_password && !password) || remove.isPending
              }
            >
              {remove.isPending && (
                <span className="loading loading-sm loading-spinner" aria-hidden="true" />
              )}
              Delete forever
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {fieldError && <FormAlert tone="error">{fieldError}</FormAlert>}
          <TextField
            label={
              <>
                Type <strong>DELETE</strong> to confirm
              </>
            }
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="off"
          />
          {user.has_password && (
            <PasswordField
              label="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </div>
      </Modal>
    </section>
  );
}

export function DataSection() {
  return (
    <div className="space-y-6">
      <ExportCard />
      <ImportCard />
      <DeleteAccountCard />
    </div>
  );
}
