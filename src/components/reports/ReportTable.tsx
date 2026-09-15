import { ReactNode } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import SkeletonLoader from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  loading: boolean;
  rowKey: (row: T, idx: number) => string | number;
  // pagination (optional)
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  footer?: ReactNode; // e.g. totals row
}

const alignClass = (a?: string) =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

export default function ReportTable<T>({
  columns, rows, loading, rowKey,
  page, pageSize, totalRecords, totalPages, onPageChange, onPageSizeChange,
  emptyTitle = 'No data found', emptyDescription = 'No records match your current filters.',
  footer,
}: Props<T>) {
  const hasPagination = page != null && totalPages != null && onPageChange != null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {!loading && rows.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((c) => (
                  <th key={c.key}
                    className={`px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider ${alignClass(c.align)}`}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <SkeletonLoader rows={8} cols={Math.max(1, columns.length - 2)} />
              ) : (
                rows.map((row, idx) => (
                  <tr key={rowKey(row, idx)} className={`transition-colors hover:bg-blue-50/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 text-sm text-gray-800 ${alignClass(c.align)} ${c.className || ''}`}>
                        {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode) ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
            {footer && !loading && <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-semibold">{footer}</tfoot>}
          </table>
        </div>
      )}

      {hasPagination && !loading && (totalRecords || 0) > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{((page as number) - 1) * (pageSize as number) + 1}</span> to{' '}
            <span className="font-medium text-gray-700">{Math.min((page as number) * (pageSize as number), totalRecords as number)}</span> of{' '}
            <span className="font-medium text-gray-700">{totalRecords}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange!(1)} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronsLeft size={14} /></button>
            <button onClick={() => onPageChange!(Math.max(1, (page as number) - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, totalPages as number) }, (_, i) => {
              const startPage = Math.max(1, Math.min((page as number) - 2, (totalPages as number) - 4));
              const p = startPage + i;
              if (p > (totalPages as number)) return null;
              return (
                <button key={p} onClick={() => onPageChange!(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-700'}`}
                >{p}</button>
              );
            })}
            <button onClick={() => onPageChange!(Math.min(totalPages as number, (page as number) + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronRight size={14} /></button>
            <button onClick={() => onPageChange!(totalPages as number)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronsRight size={14} /></button>
            {onPageSizeChange && (
              <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="ml-3 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white cursor-pointer">
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
