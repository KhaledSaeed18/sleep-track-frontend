'use client';

import { BarChart3, Table2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Accessible summary of what the chart shows. */
  summary: string;
  chart: ReactNode;
  table?: ReactNode;
  className?: string;
  footer?: ReactNode;
}

/** Card wrapper for charts with an accessible table view toggle. */
export function ChartCard({
  title,
  description,
  action,
  summary,
  chart,
  table,
  className,
  footer,
}: ChartCardProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  return (
    <section className={cn('surface flex flex-col', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-base-content/60">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {table && (
            <button
              type="button"
              className="tooltip btn tooltip-left btn-square btn-ghost btn-xs"
              data-tip={view === 'chart' ? 'Show as table' : 'Show as chart'}
              aria-label={view === 'chart' ? 'Show as table' : 'Show as chart'}
              aria-pressed={view === 'table'}
              onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
            >
              {view === 'chart' ? (
                <Table2 className="size-3.5" aria-hidden="true" />
              ) : (
                <BarChart3 className="size-3.5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
      <figure className="flex-1 px-3 pt-4 pb-4 sm:px-4">
        {view === 'table' && table ? (
          <div className="max-h-80 scrollbar-thin overflow-auto px-2">{table}</div>
        ) : (
          <div role="img" aria-label={summary}>
            {chart}
          </div>
        )}
        <figcaption className="sr-only">{summary}</figcaption>
      </figure>
      {footer && <div className="border-t border-(--hairline) px-5 py-3">{footer}</div>}
    </section>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: (string | number)[][] }) {
  return (
    <table className="table table-zebra table-sm">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="tabular">
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
