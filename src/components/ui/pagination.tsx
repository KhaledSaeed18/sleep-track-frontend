'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  className?: string;
}

function windowed(page: number, pages: number): (number | 'gap')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const result: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) result.push('gap');
  for (let i = start; i <= end; i += 1) result.push(i);
  if (end < pages - 1) result.push('gap');
  result.push(pages);
  return result;
}

export function Pagination({ page, pages, total, pageSize, onChange, className }: PaginationProps) {
  if (total === 0) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  return (
    <nav
      className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}
      aria-label="Pagination"
    >
      <p className="tabular text-sm text-base-content/65">
        Showing {first}–{last} of {total.toLocaleString('en-US')}
      </p>
      {pages > 1 && (
        <div className="join">
          <button
            type="button"
            className="btn join-item btn-sm"
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          {windowed(page, pages).map((item, index) =>
            item === 'gap' ? (
              <span
                key={`gap-${String(index)}`}
                className="btn btn-disabled join-item btn-sm"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={cn('tabular btn join-item btn-sm', item === page && 'btn-primary')}
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${String(item)}`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            className="btn join-item btn-sm"
            onClick={() => onChange(page + 1)}
            disabled={page >= pages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
