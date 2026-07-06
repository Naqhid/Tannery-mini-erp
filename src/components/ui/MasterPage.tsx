import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  FileSpreadsheet,
  Download,
  Eye,
} from 'lucide-react';
import Input from './Input';
import Select from './Select';
import ConfirmDialog from './ConfirmDialog';
import { exportToExcel } from '../../lib/excelExport';
import { previewPDF, downloadPDF } from '../../lib/pdfExport';
import api from '../../lib/api';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: any, index: number) => React.ReactNode;
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
}

interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'date';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  gridCol?: boolean;
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
}: MasterPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>(emptyData);
  const [saving, setSaving] = useState(false);
  const [statusToggle, setStatusToggle] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) {
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
      }
      const res = await api<{ data: any[]; total: number; page: number; totalPages: number }>(`${apiEndpoint}?${params.toString()}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, searchQuery, currentPage, pageSize, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number; inactive?: number } }>(`${apiEndpoint}/stats`);
      setStats(res.data);
    } catch {}
  }, [apiEndpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, sortOrder, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-700 group-hover:text-gray-900" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="text-indigo-600" />
      : <ArrowDown size={12} className="text-indigo-600" />;
  };

  const openPanel = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ ...emptyData, ...item });
      setStatusToggle(item.status === 'Active');
    } else {
      setSelectedItem(null);
      setFormData(emptyData);
      setStatusToggle(true);
    }
    setShowPanel(true);
  };

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = formFields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!formData[field.key]) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'Active' : 'Inactive' };
      if (selectedItem?.id) {
        const res = await api(`${apiEndpoint}/${selectedItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || `${title} updated successfully!`);
      } else {
        const res = await api(apiEndpoint, { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || `${title} created successfully!`);
      }
      setShowPanel(false);
      setSearchQuery('');
      setCurrentPage(1);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;

    try {
      // Check if there's a beforeDelete callback
      if (onBeforeDelete) {
        const canDelete = await onBeforeDelete(id);
        if (canDelete !== true && canDelete !== undefined) {
          toast.error(typeof canDelete === 'string' ? canDelete : `Cannot delete this ${title}. It is being referenced.`);
          return;
        }
      }

      const res = await api(`${apiEndpoint}/${id}`, { method: 'DELETE' });
      toast.success(res.message || `${title} deleted successfully!`);
      setShowPanel(false);
      setSearchQuery('');
      setCurrentPage(1);
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

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  // Export functions
  const handleExportExcel = () => {
    if (exportColumns) {
      exportToExcel({
        data,
        columns: exportColumns,
        fileName: title.replace(/\s+/g, '_'),
      });
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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
            <span className="text-xs text-blue-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-blue-800">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden ring-1 ring-indigo-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
              />
            </div>
            <button className="p-2 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-all">
              <Filter size={15} />
            </button>
            {/* Export Menu */}
            <div className="relative group">
              <button className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all flex items-center gap-1">
                <Download size={15} />
                <span className="text-xs hidden sm:inline">Export</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 hidden group-hover:block min-w-[140px]">
                <button
                  onClick={() => handleExportPDF(true)}
                  className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye size={14} className="text-sky-500" />
                  Preview PDF
                </button>
                <button
                  onClick={() => handleExportPDF(false)}
                  className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={14} className="text-red-600" />
                  Download PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={14} className="text-green-600" />
                  Export to Excel
                </button>
              </div>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add {title}
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-blue-100/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer group select-none' : ''}`}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  >
                    {col.sortable !== false ? (
                      <span className="inline-flex items-center gap-1">
                        {col.header} <SortIcon field={col.key} />
                      </span>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-gray-400 text-sm">No records found</td></tr>
              ) : data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`hover:bg-blue-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  onClick={() => openPanel(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4">
                      {col.render ? col.render(row, index) : row[col.key]}
                    </td>
                  ))}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openPanel(row); }}
                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); row.id && handleDelete(row.id); }}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-blue-100/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-3">
            <p className="text-xs text-indigo-400 font-medium">
              Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
            </p>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs border border-indigo-200 rounded-lg px-2 py-1 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-indigo-300 border border-transparent hover:border-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else {
                page = currentPage - 2 + i;
                if (page < 1) page = i + 1;
                if (page > totalPages) page = totalPages - 4 + i;
              }
              return page;
            }).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200'
                    : 'hover:bg-white hover:shadow-sm text-indigo-600 border border-transparent hover:border-indigo-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-indigo-300 border border-transparent hover:border-indigo-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="px-5 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconColor} shadow-lg`}>
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {selectedItem ? `Edit ${title}` : `New ${title}`}
                      </h2>
                      <p className="text-[11px] text-indigo-500 font-medium mt-0.5">
                        {selectedItem ? selectedItem.code || selectedItem.name : `Add a new ${title.toLowerCase()} record`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                <div className="grid grid-cols-2 gap-3">
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
                            className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none placeholder-gray-400 bg-white"
                          />
                        </div>
                      ) : field.type === 'select' ? (
                        <Select
                          label={field.label}
                          required={field.required}
                          options={field.options || []}
                          value={formData[field.key] || ''}
                          onChange={(e) => updateField(field.key, e.target.value)}
                        />
                      ) : field.type === 'date' ? (
                        <Input
                          label={field.label}
                          required={field.required}
                          type="date"
                          value={formData[field.key] || ''}
                          onChange={(e) => updateField(field.key, e.target.value)}
                        />
                      ) : (
                        <Input
                          label={field.label}
                          required={field.required}
                          value={formData[field.key] || ''}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          onChange={(e) => updateField(field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Status</span>
                  <button
                    onClick={() => setStatusToggle(!statusToggle)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${statusToggle ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${statusToggle ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className={`text-xs font-semibold ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {statusToggle ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedItem ? (
                    <button
                      onClick={() => selectedItem?.id && handleDelete(selectedItem.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                      onClick={() => setShowPanel(false)}
                    >
                      <RotateCcw size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save size={13} /> {saving ? 'Saving...' : selectedItem ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title={`Delete ${title}`}
        message={`Are you sure you want to delete this ${title.toLowerCase()}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
