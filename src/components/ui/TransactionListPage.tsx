import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  Plus, Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ChevronsUpDown, RefreshCw, X, Trash2, CheckSquare, Filter, Edit2,
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import SkeletonLoader from './SkeletonLoader';
import ExportMenu from './ExportMenu';
import { useDebounce } from '../../lib/useDebounce';
import { usePermission } from '../../lib/usePermission';
import api from '../../lib/api';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: any, index: number) => React.ReactNode;
}

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface StatCard {
  label: string;
  value: number | string;
  color: string;
  bg: string;
  iconColor?: string;
}

interface ExportActions {
  onPreview: () => void;
  onDownload: () => void;
  onExcel?: () => void;
}

interface TransactionListPageProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  apiEndpoint: string;
  columns: Column[];
  statCards?: StatCard[];
  filterOptions?: FilterOption[];
  defaultFilters?: Record<string, string>;
  addButtonLabel?: string;
  onAdd?: () => void;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (id: number) => Promise<void>;
  deleteTitle?: string;
  deleteMessage?: string;
  enableBulkDelete?: boolean;
  searchPlaceholder?: string;
  rowActions?: (row: any) => React.ReactNode;
  formatRow?: (row: any, col: Column, index: number) => React.ReactNode;
  isRowActionDisabled?: (row: any) => boolean;
  exportActions?: ExportActions;
}

export default function TransactionListPage({
  title,
  subtitle,
  icon,
  iconColor,
  apiEndpoint,
  columns,
  statCards = [],
  filterOptions = [],
  addButtonLabel = 'Add New',
  onAdd,
  onRowClick,
  onEdit,
  onDelete,
  deleteTitle = 'Delete Record',
  deleteMessage = 'Are you sure? This action cannot be undone.',
  enableBulkDelete = true,
  searchPlaceholder = 'Search...',
  rowActions,
  formatRow,
  isRowActionDisabled,
  exportActions,
  defaultFilters = {},
}: TransactionListPageProps) {
  const { canWrite, isReadOnly } = usePermission();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; bulk?: boolean }>({ open: false, id: null });
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const tableRef = useRef<HTMLTableElement>(null);

  const debouncedSearchInput = useDebounce(searchInput, 350);
  useEffect(() => { setDebouncedSearch(debouncedSearchInput); }, [debouncedSearchInput]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      for (const [k, v] of Object.entries(activeFilters)) {
        if (v) params.set(k, v);
      }
      const res = await api<{ data: any[]; total: number; totalPages: number }>(`${apiEndpoint}?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch { setData([]); setTotalRecords(0); setTotalPages(0); } finally { setLoading(false); }
  }, [apiEndpoint, debouncedSearch, currentPage, pageSize, sortBy, sortOrder, JSON.stringify(activeFilters)]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, sortBy, sortOrder, pageSize, JSON.stringify(activeFilters)]);

  // Ctrl+N keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && onAdd) {
        e.preventDefault();
        onAdd();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onAdd]);

  // Keyboard navigation in table
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedRowIndex(i => Math.min(data.length - 1, i + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedRowIndex(i => Math.max(0, i - 1)); }
    if (e.key === 'Enter' && focusedRowIndex >= 0 && data[focusedRowIndex]) {
      e.preventDefault();
      if (onRowClick) onRowClick(data[focusedRowIndex]);
      else if (onEdit) onEdit(data[focusedRowIndex]);
    }
  };

  // Close bulk actions on outside click
  useEffect(() => {
    if (!showBulkActions) return;
    const handler = () => setShowBulkActions(false);
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showBulkActions]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const handleRefresh = () => { fetchData(); toast.info('Refreshed'); };

  const toggleRow = (id: number) => {
    setSelectedIds(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(r => r.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) { toast.error('No rows selected'); return; }
    setDeleteConfirm({ open: true, id: null, bulk: true });
  };

  const confirmDelete = async () => {
    const { id, bulk } = deleteConfirm;
    setDeleteConfirm({ open: false, id: null });
    if (bulk) {
      try {
        const ids = Array.from(selectedIds);
        await api(`${apiEndpoint}/bulk-delete`, { method: 'POST', body: JSON.stringify({ ids }) });
        toast.success(`${ids.length} record(s) deleted`);
        setSelectedIds(new Set());
        fetchData();
      } catch (err) { toast.error('Bulk delete failed: ' + (err as Error).message); }
    } else if (id && onDelete) {
      try { await onDelete(id); fetchData(); } catch {}
    }
  };

  const applyFilter = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };
  const removeFilter = (key: string) => {
    setActiveFilters(prev => { const n = { ...prev }; delete n[key]; return n; });
  };
  const clearAllFilters = () => { setActiveFilters({}); setShowFilters(false); };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-400 group-hover:text-gray-600" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconColor} shadow-lg`}>
            {icon}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
          {exportActions && (
            <ExportMenu
              onPreview={exportActions.onPreview}
              onDownload={exportActions.onDownload}
              onExcel={exportActions.onExcel}
            />
          )}
          {onAdd && (
            <button
              onClick={canWrite ? onAdd : undefined}
              disabled={isReadOnly}
              title={isReadOnly ? 'You have read-only access. Contact admin for write permissions.' : undefined}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r ${iconColor} rounded-xl shadow-lg transition-all active:scale-95 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'}`}
              aria-label={addButtonLabel}
            >
              <Plus size={14} /> {addButtonLabel}
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      {statCards.length > 0 && (
        <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(statCards.length, 4)} gap-3`}>
          {statCards.map(c => (
            <div key={c.label} className={`relative overflow-hidden p-4 rounded-2xl border ${c.bg} shadow-sm`}>
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{c.label}</p>
              <p className={`text-2xl font-black mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <CheckSquare size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-800">{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-blue-600 hover:underline ml-2">Clear</button>
          <div className="ml-auto flex items-center gap-2">
            {enableBulkDelete && (
              <button
                onClick={canWrite ? handleBulkDelete : undefined}
                disabled={isReadOnly}
                title={isReadOnly ? 'You have read-only access' : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-500 rounded-lg transition-all ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-600'}`}
              >
                <Trash2 size={13} /> Delete Selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                aria-label="Search"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400" aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
              {searchInput !== debouncedSearch && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {filterOptions.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all" aria-label="Toggle filters">
                  <Filter size={14} /> Filters
                  {activeFilterCount > 0 && !activeFilters.status && <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">{activeFilterCount}</span>}
                </button>
                {showFilters && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-3 space-y-2">
                    {filterOptions.filter(f => f.key !== 'status').map(f => (
                      <div key={f.key}>
                        <label className="text-[11px] font-medium text-gray-600">{f.label}</label>
                        <select value={activeFilters[f.key] || ''} onChange={(e) => applyFilter(f.key, e.target.value)} className="w-full mt-0.5 px-2 py-1.5 text-xs border border-gray-200 rounded-lg">
                          <option value="">All</option>
                          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    ))}
                    <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline">Clear All</button>
                  </div>
                )}
              </div>
            )}

            {/* Active/Inactive checkbox */}
            {filterOptions.some(f => f.key === 'status') && (
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeFilters.status === 'Active'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      applyFilter('status', 'Active');
                    } else {
                      removeFilter('status');
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Active Only
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Total: <span className="font-bold text-gray-700">{totalRecords}</span>
          </p>
        </div>

        {/* Filter Chips */}
        {Object.entries(activeFilters).filter(([k, v]) => v && k !== 'status').length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-gray-100 bg-blue-50/30">
            {Object.entries(activeFilters).filter(([k, v]) => v && k !== 'status').map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white border border-blue-200 rounded-full text-blue-700">
                {key}: {value}
                <button onClick={() => removeFilter(key)} className="ml-0.5 p-0.5 rounded-full hover:bg-blue-100"><X size={10} /></button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline">Clear All</button>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table ref={tableRef} className="w-full text-sm" onKeyDown={handleTableKeyDown} tabIndex={0} aria-label={`${title} table`}>
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                {enableBulkDelete && (
                  <th className="py-3 px-3 w-10">
                    <input type="checkbox" checked={data.length > 0 && selectedIds.size === data.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" aria-label="Select all" />
                  </th>
                )}
                {columns.map(col => (
                  <th key={col.key} onClick={col.sortable !== false ? () => handleSort(col.key) : undefined} className={`text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer select-none group' : ''}`}>
                    <span className="inline-flex items-center gap-1">{col.header} {col.sortable !== false && <SortIcon field={col.key} />}</span>
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>

            {loading ? (
              <SkeletonLoader rows={5} cols={columns.length} />
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={columns.length + (enableBulkDelete ? 2 : 1)}>
                    <EmptyState title={`No ${title.toLowerCase()} found`} message="Try adjusting your search or filters" actionLabel={onAdd ? addButtonLabel : undefined} onAction={onAdd} />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-50">
                {data.map((row, i) => (
                  <tr
                    key={row.id || i}
                    className={`hover:bg-blue-50/40 transition-all cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} ${focusedRowIndex === i ? 'ring-2 ring-inset ring-blue-300' : ''}`}
                    onClick={() => onRowClick ? onRowClick(row) : onEdit?.(row)}
                    tabIndex={-1}
                  >
                    {enableBulkDelete && (
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleRow(row.id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" aria-label={`Select row ${i + 1}`} />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className="py-3 px-4 text-sm text-gray-700">
                        {col.render ? col.render(row, i) : (formatRow ? formatRow(row, col, i) : (row[col.key] ?? '—'))}
                      </td>
                    ))}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      {rowActions ? rowActions(row) : (
                        <div className="flex items-center gap-1">
                          {onEdit && (
                            <button
                              onClick={canWrite && !(isRowActionDisabled?.(row)) ? () => onEdit(row) : undefined}
                              disabled={isReadOnly || !!isRowActionDisabled?.(row)}
                              title={isRowActionDisabled?.(row) ? 'Posted - cannot edit' : isReadOnly ? 'Read-only access' : 'Edit'}
                              className={`p-1.5 rounded-lg transition-all ${isReadOnly || isRowActionDisabled?.(row) ? 'text-gray-300 cursor-not-allowed' : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'}`}
                              aria-label="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={canWrite && !(isRowActionDisabled?.(row)) ? () => setDeleteConfirm({ open: true, id: row.id }) : undefined}
                              disabled={isReadOnly || !!isRowActionDisabled?.(row)}
                              title={isRowActionDisabled?.(row) ? 'Posted - cannot delete' : isReadOnly ? 'Read-only access' : 'Delete'}
                              className={`p-1.5 rounded-lg transition-all ${isReadOnly || isRowActionDisabled?.(row) ? 'text-gray-300 cursor-not-allowed' : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'}`}
                              aria-label="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-6"><SkeletonLoader rows={4} /></div>
          ) : data.length === 0 ? (
            <EmptyState title={`No ${title.toLowerCase()} found`} message="Try adjusting your search or filters" actionLabel={onAdd ? addButtonLabel : undefined} onAction={onAdd} />
          ) : (
            data.map((row, i) => (
              <div
                key={row.id || i}
                onClick={() => onRowClick ? onRowClick(row) : onEdit?.(row)}
                className="p-4 active:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    {columns[0]?.render ? (
                      <div className="text-sm font-semibold text-gray-900 truncate">{columns[0].render(row, i)}</div>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 truncate">{row[columns[0]?.key] || '—'}</p>
                    )}
                    {columns[1] && (
                      <div className="text-xs text-gray-500 mt-0.5">{columns[1].render ? columns[1].render(row, i) : (row[columns[1]?.key] || '—')}</div>
                    )}
                  </div>
                  {/* Show last column (usually status) as badge */}
                  {columns[columns.length - 1] && (
                    <div className="shrink-0 ml-2">
                      {columns[columns.length - 1].render ? columns[columns.length - 1].render(row, i) : (
                        <span className="text-xs text-gray-600">{row[columns[columns.length - 1].key] || '—'}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                  {columns.slice(2, -1).map(col => (
                    <div key={col.key}>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{col.header}</p>
                      <div className="text-xs text-gray-700 font-medium truncate">
                        {col.render ? col.render(row, i) : (row[col.key] || '—')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 font-medium">
              Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
            </p>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600" aria-label="Page size">
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40" aria-label="Next page">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        title={deleteConfirm.bulk ? `Delete ${selectedIds.size} records` : deleteTitle}
        message={deleteConfirm.bulk ? `Are you sure you want to delete ${selectedIds.size} selected records?` : deleteMessage}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
