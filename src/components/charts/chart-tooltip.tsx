import type { ReactNode } from 'react';

export interface TooltipRow {
  label: string;
  value: ReactNode;
  color?: string;
}

/** Tooltip body shared by all charts. Text uses text tokens; colour lives only in the key swatch. */
export function TooltipCard({ title, rows }: { title: ReactNode; rows: TooltipRow[] }) {
  return (
    <div className="min-w-36 rounded-field border border-(--hairline) bg-base-100 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-base-content">{title}</p>
      <ul className="space-y-0.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-4 text-base-content/70"
          >
            <span className="flex items-center gap-1.5">
              {row.color && (
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: row.color }}
                  aria-hidden="true"
                />
              )}
              {row.label}
            </span>
            <span className="tabular font-medium text-base-content">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
