import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight,
  RotateCcw, Save, X, ArrowUp, ArrowDown, ChevronsUpDown,
  FileSpreadsheet, Download, Eye, RefreshCw, Copy, Archive, ArchiveRestore,
  CheckSquare, AlertTriangle, SlidersHorizontal, Trash,
  User, Calendar, History, ChevronDown,
} from 'lucide-react';
import Input from './Input';
import Select from './Select';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import SkeletonLoader from './SkeletonLoader';
import { exportToExcel } from '../../lib/excelExport';
import { previewPDF, downloadPDF } from '../../lib/pdfExport';
import { useDebounce } from '../../lib/useDebounce';
import { validateField } from '../../lib/validators';
import { usePermission } from '../../lib/usePermission';
import api from '../../lib/api';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: any, index: number) => React.ReactNode;
}

interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'date';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  gridCol?: boolean;
  validate?: 'gstin' | 'pan' | 'email' | 'phone';
}

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface MasterPageProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  apiEndpoint: string;
  columns: Column[];
  formFields: FormField[];
  emptyData?: Record<string, any>;
  onBeforeDelete?: (id: number) => Promise<boolean | string>;
  exportColumns?: { key: string; header: string }[];
  pdfAccentColor?: [number, number, number];
  filterOptions?: FilterOption[];
  uniqueFields?: string[];
  enableArchive?: boolean;
  modalSize?: string;
  formRoute?: string;
  renderForm?: (props: { formData: any; setFormData: (d: any) => void; formErrors: Record<string, string>; selectedItem: any; statusToggle: boolean; setStatusToggle: (v: boolean) => void; setFormDirty: (v: boolean) => void }) => React.ReactNode;
}

type SortField = string;
type SortOrder = 'asc' | 'desc';

export default function MasterPage({
  title,
  subtitle,
  icon,
  iconColor,
  apiEndpoint,
  columns,
  formFields,
  emptyData = {},
  onBeforeDelete,
  exportColumns,
  pdfAccentColor = [79, 70, 229],
  filterOptions = [],
  enableArchive = true,
  modalSize,
  formRoute,
  renderForm,
}: MasterPageProps) {
  const { canWrite, isReadOnly } = usePermission();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>(emptyData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [statusToggle, setStatusToggle] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [bulkConfirm, setBulkConfirm] = useState<{ open: boolean; action: string; ids: number[] }>({ open: false, action: '', ids: [] });
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedWarn, setShowUnsavedWarn] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [auditInfo, setAuditInfo] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Row selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Archive view
  const [showArchived, setShowArchived] = useState(false);

  // Bulk action dropdown
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Keyboard nav
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Debounce search (350ms)
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
      if (showArchived) params.set('includeArchived', 'true');
      if (showArchived && !debouncedSearch) params.set('status', 'Inactive');
      for (const [k, v] of Object.entries(activeFilters)) {
        if (v) params.set(k, v);
      }
      const res = await api<{ data: any[]; total: number; page: number; totalPages: number }>(`${apiEndpoint}?${params.toString()}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, debouncedSearch, currentPage, pageSize, sortBy, sortOrder, showArchived, JSON.stringify(activeFilters)]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number; inactive?: number; archived?: number } }>(`${apiEndpoint}/stats`);
      setStats({ total: res.data.total, active: res.data.active, inactive: res.data.inactive || 0, archived: res.data.archived || 0 });
    } catch {}
  }, [apiEndpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Reset pagination on new search or filter change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, sortBy, sortOrder, pageSize, showArchived, JSON.stringify(activeFilters)]);

  // Ctrl+N keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !showPanel) {
        e.preventDefault();
        openPanel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showPanel]);

  // Focus trap inside panel
  useEffect(() => {
    if (!showPanel) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    // Focus first input
    setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('input, textarea, select');
      first?.focus();
    }, 100);
    return () => document.removeEventListener('keydown', handleTab);
  }, [showPanel]);

  // Close bulk actions on outside click
  useEffect(() => {
    if (!showBulkActions) return;
    const handler = () => setShowBulkActions(false);
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showBulkActions]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-400 group-hover:text-gray-600" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="text-blue-600" />
      : <ArrowDown size={12} className="text-blue-600" />;
  };

  const openPanel = (item?: any) => {
    if (formRoute) {
      if (item) {
        navigate(`${formRoute}/${item.id}`);
      } else {
        navigate(`${formRoute}/new`);
      }
      return;
    }
    if (item) {
      setSelectedItem(item);
      setFormData({ ...emptyData, ...item });
      setStatusToggle(item.status === 'Active');
      setAuditInfo(null);
      setShowAudit(false);
    } else {
      setSelectedItem(null);
      setFormData(emptyData);
      setStatusToggle(true);
      setAuditInfo(null);
      setShowAudit(false);
    }
    setFormErrors({});
    setFormDirty(false);
    setShowPanel(true);
  };

  const closePanel = (force = false) => {
    if (formDirty && !force) {
      setShowUnsavedWarn(true);
      return;
    }
    setShowPanel(false);
    setFormDirty(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of formFields) {
      const err = validateField(field, formData[field.key]);
      if (err) errors[field.key] = err;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'Active' : 'Inactive' };

      // Duplicate check
      try {
        const dupCheck = await api<{ isDuplicate: boolean; message?: string }>(`${apiEndpoint}/check-duplicate`, {
          method: 'POST',
          body: JSON.stringify({ ...payload, excludeId: selectedItem?.id }),
        });
        if (dupCheck.isDuplicate) {
          toast.error(dupCheck.message || `A ${title} with these details already exists`);
          setSaving(false);
          return;
        }
      } catch {
        // If duplicate check endpoint not available, proceed
      }

      if (selectedItem?.id) {
        const res = await api<{ message?: string }>(`${apiEndpoint}/${selectedItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || `${title} updated successfully!`);
      } else {
        const res = await api<{ message?: string }>(apiEndpoint, { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || `${title} created successfully!`);
      }
      setShowPanel(false);
      setFormDirty(false);
      setSearchInput('');
      setDebouncedSearch('');
      setCurrentPage(1);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;

    try {
      if (onBeforeDelete) {
        const canDelete = await onBeforeDelete(id);
        if (canDelete !== true && canDelete !== undefined) {
          toast.error(typeof canDelete === 'string' ? canDelete : `Cannot delete this ${title}. It is being referenced.`);
          return;
        }
      }
      const res = await api<{ message?: string }>(`${apiEndpoint}/${id}`, { method: 'DELETE' });
      toast.success(res.message || `${title} archived successfully!`);
      setShowPanel(false);
      fetchData();
      fetchStats();
    } catch (err) {
      const errorMsg = (err as Error).message;
      if (errorMsg.includes('referenced') || errorMsg.includes('Cannot delete')) {
        toast.error(errorMsg);
      } else {
        toast.error('Failed to delete: ' + errorMsg);
      }
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const res = await api<{ message?: string }>(`${apiEndpoint}/${id}/duplicate`, { method: 'POST' });
      toast.success(res.message || `${title} duplicated successfully!`);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error('Failed to duplicate: ' + (err as Error).message);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await api<{ message?: string }>(`${apiEndpoint}/${id}/restore`, { method: 'POST' });
      toast.success(res.message || `${title} restored successfully!`);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error('Failed to restore: ' + (err as Error).message);
    }
  };

  const handlePermanentDelete = async (id: number | null) => {
    setPermanentDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api<{ message?: string }>(`${apiEndpoint}/${id}/permanent`, { method: 'DELETE' });
      toast.success(res.message || `${title} permanently deleted!`);
      setShowPanel(false);
      fetchData();
      fetchStats();
    } catch (err) {
      const errorMsg = (err as Error).message;
      if (errorMsg.includes('referenced') || errorMsg.includes('Cannot')) {
        toast.error(errorMsg);
      } else {
        toast.error('Failed to delete permanently: ' + errorMsg);
      }
    }
  };

  const handleQuickStatusToggle = async (row: any) => {
    const newStatus = row.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api(`${apiEndpoint}/${row.id}`, { method: 'PUT', body: JSON.stringify({ ...row, status: newStatus }) });
      toast.success(`${title} status changed to ${newStatus}`);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error('Failed to update status: ' + (err as Error).message);
    }
  };

  // Row selection
  const toggleRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(r => r.id).filter(Boolean)));
    }
  };
  const clearSelection = () => setSelectedIds(new Set());

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedIds.size === 0) { toast.error('No rows selected'); return; }
    setBulkConfirm({ open: true, action, ids: Array.from(selectedIds) });
    setShowBulkActions(false);
  };

  const confirmBulkAction = async () => {
    const { action, ids } = bulkConfirm;
    setBulkConfirm({ open: false, action: '', ids: [] });
    try {
      if (action === 'delete') {
        const res = await api<{ message?: string }>(`${apiEndpoint}/bulk-delete`, { method: 'POST', body: JSON.stringify({ ids }) });
        toast.success(res.message || `${ids.length} record(s) archived`);
      } else if (action === 'activate') {
        const res = await api<{ message?: string }>(`${apiEndpoint}/bulk-status`, { method: 'POST', body: JSON.stringify({ ids, status: 'Active' }) });
        toast.success(res.message || `${ids.length} record(s) activated`);
      } else if (action === 'deactivate') {
        const res = await api<{ message?: string }>(`${apiEndpoint}/bulk-status`, { method: 'POST', body: JSON.stringify({ ids, status: 'Inactive' }) });
        toast.success(res.message || `${ids.length} record(s) deactivated`);
      } else if (action === 'archive') {
        const res = await api<{ message?: string }>(`${apiEndpoint}/bulk-archive`, { method: 'POST', body: JSON.stringify({ ids }) });
        toast.success(res.message || `${ids.length} record(s) archived`);
      }
      clearSelection();
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error('Bulk action failed: ' + (err as Error).message);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    setFormDirty(true);
    // Clear error for this field
    if (formErrors[key]) {
      setFormErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const resetForm = () => {
    setFormData(selectedItem ? { ...emptyData, ...selectedItem } : emptyData);
    setFormErrors({});
    setFormDirty(false);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchData();
    fetchStats();
    toast.info('Data refreshed', { autoClose: 1500 });
  };

  const applyFilter = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key: string) => {
    setActiveFilters(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setShowFilters(false);
  };

  const fetchAuditInfo = async (id: number) => {
    try {
      const res = await api<{ data: any }>(`${apiEndpoint}/${id}/audit`);
      setAuditInfo(res.data);
    } catch {
      setAuditInfo(null);
    }
  };

  // Export functions
  const handleExportExcel = () => {
    if (exportColumns) {
      exportToExcel({ data, columns: exportColumns, fileName: title.replace(/\s+/g, '_') });
    }
  };
  const handleExportPDF = (preview: boolean) => {
    if (!exportColumns) return;
    const rows = data.map(item => exportColumns.map(col => item[col.key] || ''));
    if (preview) {
      previewPDF({ title, subtitle: `Total: ${data.length} records`, columns: exportColumns.map(c => c.header), rows, accentColor: pdfAccentColor });
    } else {
      downloadPDF({ title, subtitle: `Total: ${data.length} records`, columns: exportColumns.map(c => c.header), rows, accentColor: pdfAccentColor, fileName: `${title.replace(/\s+/g, '_')}.pdf` });
    }
  };

  // Keyboard navigation in table
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.min(data.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === 'Enter' && focusedRowIndex >= 0 && data[focusedRowIndex]) {
      e.preventDefault();
      openPanel(data[focusedRowIndex]);
    }
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;
  const allSelected = data.length > 0 && selectedIds.size === data.length;

  const bulkActionItems = [
    { action: 'delete', label: 'Delete Selected', icon: <Trash size={14} />, color: 'text-red-600 hover:bg-red-50' },
    { action: 'activate', label: 'Set Active', icon: <CheckSquare size={14} />, color: 'text-emerald-600 hover:bg-emerald-50' },
    { action: 'deactivate', label: 'Set Inactive', icon: <X size={14} />, color: 'text-amber-600 hover:bg-amber-50' },
    ...(enableArchive ? [{ action: 'archive', label: 'Archive Selected', icon: <Archive size={14} />, color: 'text-slate-600 hover:bg-slate-100' }] : []),
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconColor} shadow-lg ring-2 ring-white/50`}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5 uppercase tracking-wider">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-blue-700">{stats.total}</span>
          </div>
          {stats.archived > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                showArchived
                  ? 'bg-amber-100 border-amber-200 text-amber-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              <Archive size={14} />
              <span className="text-xs font-medium">{showArchived ? 'Viewing Archived' : `Archived: ${stats.archived}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {/* Search with debounce + clear */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              {searchInput !== debouncedSearch && (
                <div className="absolute right-7 top-1/2 -translate-y-1/2 w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              )}
            </div>

            {/* Filter button */}
            {filterOptions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                    activeFilterCount > 0 || showFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="Open filters"
                >
                  <Filter size={16} />
                  <span className="text-xs font-medium hidden sm:inline">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded-full font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {showFilters && (
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[260px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Filters</span>
                      <button onClick={() => setShowFilters(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {filterOptions.map(opt => (
                        <div key={opt.key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{opt.label}</label>
                          <select
                            value={activeFilters[opt.key] || ''}
                            onChange={(e) => applyFilter(opt.key, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="">All</option>
                            {opt.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-3 w-full py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
              aria-label="Refresh data"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Export Menu */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all">
                <Download size={16} />
                <span className="text-xs font-medium hidden sm:inline">Export</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 hidden group-hover:block min-w-[160px]">
                <button onClick={() => handleExportPDF(true)} className="w-full px-4 py-2 text-xs text-left hover:bg-sky-50 flex items-center gap-2 text-gray-700">
                  <Eye size={14} className="text-sky-500" /> Preview PDF
                </button>
                <button onClick={() => handleExportPDF(false)} className="w-full px-4 py-2 text-xs text-left hover:bg-rose-50 flex items-center gap-2 text-gray-700">
                  <Download size={14} className="text-rose-600" /> Download PDF
                </button>
                <button onClick={handleExportExcel} className="w-full px-4 py-2 text-xs text-left hover:bg-emerald-50 flex items-center gap-2 text-gray-700">
                  <FileSpreadsheet size={14} className="text-emerald-600" /> Export to Excel
                </button>
              </div>
            </div>
          </div>
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md transition-all ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg active:scale-95'}`}
            onClick={canWrite ? () => openPanel() : undefined}
            disabled={isReadOnly}
            title={isReadOnly ? 'You have read-only access. Contact admin for write permissions.' : `Add new ${title}`}
            aria-label={`Add new ${title}`}
          >
            <Plus size={16} /> Add {title}
                     </button>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50/50 border-b border-blue-100 flex-wrap">
            <span className="text-xs font-medium text-gray-500">Active filters:</span>
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value) return null;
              const opt = filterOptions.find(o => o.key === key);
              return (
                <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-700 font-medium">
                  {opt?.label}: {value}
                  <button onClick={() => removeFilter(key)} className="p-0.5 hover:bg-blue-100 rounded-full" aria-label={`Remove ${key} filter`}>
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 font-medium ml-1">
              Clear All
            </button>
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-blue-700">{selectedIds.size} selected</span>
              <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                Clear
              </button>
            </div>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowBulkActions(!showBulkActions); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                <SlidersHorizontal size={14} /> Bulk Actions
                <ChevronDown size={12} />
              </button>
              {showBulkActions && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 min-w-[180px]">
                  {bulkActionItems.map(item => (
                    <button
                      key={item.action}
                      onClick={(e) => { e.stopPropagation(); handleBulkAction(item.action); }}
                      className={`w-full px-4 py-2 text-xs text-left flex items-center gap-2 font-medium ${item.color}`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" ref={tableRef} onKeyDown={handleTableKeyDown} tabIndex={0}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 w-[40px]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer group select-none hover:text-gray-900' : ''}`}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  >
                    {col.sortable !== false ? (
                      <span className="inline-flex items-center gap-1.5">
                        {col.header} <SortIcon field={col.key} />
                      </span>
                    ) : col.header}
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[140px]">Actions</th>
              </tr>
            </thead>
            {loading ? (
              <SkeletonLoader rows={Math.min(pageSize, 5)} cols={columns.length} />
            ) : data.length === 0 ? (
              <tbody>
                <tr><td colSpan={columns.length + 2} className="py-8">
                  <EmptyState
                    icon={icon}
                    title={showArchived ? 'No archived records' : 'No records found'}
                    message={showArchived ? 'Archived records will appear here' : `Add a new ${title.toLowerCase()} to get started`}
                    actionLabel={showArchived ? undefined : `Add ${title}`}
                    onAction={showArchived ? undefined : () => openPanel()}
                  />
                </td></tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-100">
                {data.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${focusedRowIndex === index ? 'bg-blue-50 ring-1 ring-blue-200' : ''} ${selectedIds.has(row.id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => openPanel(row)}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label={`Select row ${index + 1}`}
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 font-medium text-gray-700">
                        {col.render ? col.render(row, index) : row[col.key]}
                      </td>
                    ))}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={canWrite ? (e) => { e.stopPropagation(); openPanel(row); } : undefined}
                          disabled={isReadOnly}
                          className={`p-1.5 rounded-lg transition-all ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}
                          aria-label={`Edit ${title}`}
                          title={isReadOnly ? 'Read-only access' : 'Edit'}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={canWrite ? (e) => { e.stopPropagation(); handleDuplicate(row.id); } : undefined}
                          disabled={isReadOnly}
                          className={`p-1.5 rounded-lg transition-all ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-500 hover:bg-indigo-100'}`}
                          aria-label={`Duplicate ${title}`}
                          title={isReadOnly ? 'Read-only access' : 'Duplicate'}
                        >
                          <Copy size={15} />
                        </button>
                        {row.status && (
                          <button
                            onClick={canWrite ? (e) => { e.stopPropagation(); handleQuickStatusToggle(row); } : undefined}
                            disabled={isReadOnly}
                            className={`p-1.5 rounded-lg transition-all ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : row.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-100' : 'text-gray-400 hover:bg-gray-100'}`}
                            aria-label={`Toggle status: ${row.status}`}
                            title={isReadOnly ? 'Read-only access' : `Status: ${row.status} (click to toggle)`}
                          >
                            <div className={`w-3 h-3 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          </button>
                        )}
                        {showArchived ? (
                          <>
                            <button
                              onClick={canWrite ? (e) => { e.stopPropagation(); handleRestore(row.id); } : undefined}
                              disabled={isReadOnly}
                              className={`p-1.5 rounded-lg transition-all ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-emerald-500 hover:bg-emerald-100'}`}
                              aria-label={`Restore ${title}`}
                              title={isReadOnly ? 'Read-only access' : 'Restore'}
                            >
                              <ArchiveRestore size={15} />
                            </button>
                            <button
                              onClick={canWrite ? (e) => { e.stopPropagation(); setPermanentDeleteConfirm({ open: true, id: row.id }); } : undefined}
                              disabled={isReadOnly}
                              className={`p-1.5 rounded-lg transition-all ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:bg-red-100 hover:text-red-600'}`}
                              aria-label={`Permanently delete ${title}`}
                              title={isReadOnly ? 'Read-only access' : 'Delete Permanently'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={canWrite ? (e) => { e.stopPropagation(); handleDelete(row.id); } : undefined}
                            disabled={isReadOnly}
                            className={`p-1.5 rounded-lg transition-all ${isReadOnly ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:bg-red-100 hover:text-red-600'}`}
                            aria-label={`Delete ${title}`}
                            title={isReadOnly ? 'Read-only access' : 'Archive'}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
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
            <div className="py-12 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 mt-3">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={icon}
              title={showArchived ? 'No archived records' : 'No records found'}
              message={showArchived ? 'Archived records will appear here' : `Add a new ${title.toLowerCase()} to get started`}
              actionLabel={showArchived ? undefined : `Add ${title}`}
              onAction={showArchived ? undefined : () => openPanel()}
            />
          ) : data.map((row, index) => (
            <div key={row.id || index} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => openPanel(row)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select ${row.name || row.code}`}
                    />
                    <p className="text-sm font-bold text-gray-900 truncate">{row.name || row.code}</p>
                  </div>
                  {row.code && row.name && <p className="text-xs text-gray-400 font-mono mt-0.5 ml-6">{row.code}</p>}
                </div>
                {row.status && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleQuickStatusToggle(row); }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {row.status}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 ml-6">
                {columns.filter(c => c.key !== 'name' && c.key !== 'code' && c.key !== 'status').slice(0, 3).map(col => (
                  <div key={col.key}>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">{col.header}</span>
                    <p className="text-xs text-gray-700 truncate">{row[col.key] || '—'}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 ml-6 border-t border-gray-100 pt-2">
                <button onClick={(e) => { e.stopPropagation(); openPanel(row); }} className="p-2 rounded-lg text-blue-500 hover:bg-blue-100" aria-label="Edit">
                  <Edit2 size={15} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDuplicate(row.id); }} className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-100" aria-label="Duplicate">
                  <Copy size={15} />
                </button>
                {showArchived ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handleRestore(row.id); }} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-100" aria-label="Restore">
                      <ArchiveRestore size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setPermanentDeleteConfirm({ open: true, id: row.id }); }} className="p-2 rounded-lg text-red-400 hover:bg-red-100" aria-label="Delete Permanently">
                      <Trash2 size={15} />
                    </button>
                  </>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-2 rounded-lg text-red-400 hover:bg-red-100" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
              Showing <span className="font-bold text-gray-700">{totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-gray-700">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-bold text-gray-700">{totalRecords}</span>
            </p>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) { page = i + 1; }
              else { page = currentPage - 2 + i; if (page < 1) page = i + 1; if (page > totalPages) page = totalPages - 4 + i; }
              return page;
            }).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Next page">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Panel (Modal) */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => closePanel()} />
          <div
            ref={panelRef}
            className={`fixed right-0 top-0 h-full w-full ${modalSize || 'max-w-[600px]'} bg-white shadow-2xl z-[61] flex flex-col animate-in slide-in-from-right`}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedItem ? 'Edit' : 'New'} ${title}`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconColor} shadow-md`}>
                    {icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedItem ? `Edit ${title}` : `New ${title}`}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      {selectedItem ? selectedItem.code || selectedItem.name : `Create a new record`}
                    </p>
                  </div>
                </div>
                <button onClick={() => closePanel()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" aria-label="Close panel">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {renderForm ? renderForm({ formData, setFormData, formErrors, selectedItem, statusToggle, setStatusToggle, setFormDirty }) : (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <div key={field.key} className={field.gridCol === false ? 'col-span-2' : ''}>
                    {field.type === 'textarea' ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          rows={3}
                          value={formData[field.key] || ''}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none ${
                            formErrors[field.key] ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                          }`}
                          aria-invalid={!!formErrors[field.key]}
                        />
                        {formErrors[field.key] && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle size={12} /> {formErrors[field.key]}
                          </p>
                        )}
                      </div>
                    ) : field.type === 'select' ? (
                      <Select
                        label={field.label}
                        required={field.required}
                        options={field.options || []}
                        value={formData[field.key] || ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        error={formErrors[field.key]}
                        gridCol={field.gridCol}
                      />
                    ) : (
                      <Input
                        label={field.label}
                        required={field.required}
                        type={field.type === 'date' ? 'date' : 'text'}
                        value={formData[field.key] || ''}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        error={formErrors[field.key]}
                        gridCol={field.gridCol}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</span>
                <button
                  onClick={() => { setStatusToggle(!statusToggle); setFormDirty(true); }}
                  className={`relative w-12 h-6 rounded-full transition-all ${statusToggle ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  role="switch"
                  aria-checked={statusToggle}
                  aria-label="Toggle status"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${statusToggle ? 'translate-x-6' : ''}`} />
                </button>
                <span className={`text-xs font-bold uppercase ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {statusToggle ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Audit Info */}
              {selectedItem && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      if (!showAudit && !auditInfo && selectedItem.id) fetchAuditInfo(selectedItem.id);
                      setShowAudit(!showAudit);
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <History size={14} /> Audit Information
                    <ChevronDown size={12} className={`transition-transform ${showAudit ? 'rotate-180' : ''}`} />
                  </button>
                  {showAudit && auditInfo && (
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <User size={14} className="text-gray-400" />
                        <div>
                          <p className="text-gray-400">Created By</p>
                          <p className="font-medium text-gray-700">{auditInfo.created_by || 'System'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <Calendar size={14} className="text-gray-400" />
                        <div>
                          <p className="text-gray-400">Created Date</p>
                          <p className="font-medium text-gray-700">{auditInfo.created_at ? new Date(auditInfo.created_at).toLocaleString() : '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <User size={14} className="text-gray-400" />
                        <div>
                          <p className="text-gray-400">Updated By</p>
                          <p className="font-medium text-gray-700">{auditInfo.updated_by || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                        <Calendar size={14} className="text-gray-400" />
                        <div>
                          <p className="text-gray-400">Updated Date</p>
                          <p className="font-medium text-gray-700">{auditInfo.updated_at ? new Date(auditInfo.updated_at).toLocaleString() : '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedItem && (
                    <button
                      onClick={canWrite ? () => handleDelete(selectedItem.id) : undefined}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'You have read-only access' : 'Archive this record'}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border rounded-lg transition-all ${isReadOnly ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' : 'text-red-600 bg-white border-red-200 hover:bg-red-50'}`}
                    >
                      <Trash2 size={14} /> Archive
                    </button>
                  )}
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    aria-label="Reset form"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => closePanel()}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={canWrite ? handleSave : undefined}
                    disabled={saving || isReadOnly}
                    title={isReadOnly ? 'You have read-only access. Contact admin for write permissions.' : undefined}
                    className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md transition-all disabled:opacity-50 ${isReadOnly ? 'cursor-not-allowed' : 'hover:shadow-lg active:scale-95'}`}
                  >
                    <Save size={14} /> {saving ? 'Saving...' : selectedItem ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Unsaved changes warning */}
      {showUnsavedWarn && createPortal(
        <ConfirmDialog
          open={showUnsavedWarn}
          title="Unsaved Changes"
          message="You have unsaved changes. Are you sure you want to close the panel?"
          confirmLabel="Discard & Close"
          cancelLabel="Keep Editing"
          onConfirm={() => { setShowUnsavedWarn(false); closePanel(true); }}
          onCancel={() => setShowUnsavedWarn(false)}
        />,
        document.body
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title={`Archive ${title}`}
        message={`Are you sure you want to archive this ${title.toLowerCase()}? You can restore it later from the archived view.`}
        confirmLabel="Archive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />

      {/* Permanent delete confirmation */}
      <ConfirmDialog
        open={permanentDeleteConfirm.open}
        title={`Permanently Delete ${title}`}
        message={`Are you sure you want to permanently delete this ${title.toLowerCase()}? This action cannot be undone.`}
        confirmLabel="Delete Forever"
        onConfirm={() => handlePermanentDelete(permanentDeleteConfirm.id)}
        onCancel={() => setPermanentDeleteConfirm({ open: false, id: null })}
      />

      {/* Bulk action confirmation */}
      <ConfirmDialog
        open={bulkConfirm.open}
        title="Confirm Bulk Action"
        message={`Are you sure you want to ${bulkConfirm.action === 'delete' ? 'archive' : bulkConfirm.action} ${bulkConfirm.ids.length} selected ${title.toLowerCase()}(s)?`}
        confirmLabel="Confirm"
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkConfirm({ open: false, action: '', ids: [] })}
      />
    </div>
  );
}
