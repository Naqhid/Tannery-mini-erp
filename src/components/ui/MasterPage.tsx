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

  const pageAccentGradient = iconColor.replace('from-', '').replace('to-', '').split(' ').reduce((acc: string[], c, i) => {
    if (i === 0) acc.push(c);
    if (i === 1) acc.push(c);
    return acc;
  }, []);
  const primaryColor = pageAccentGradient[0] || 'blue-500';
  const secondaryColor = pageAccentGradient[1] || 'indigo-600';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconColor} shadow-xl shadow-${primaryColor}/30 ring-2 ring-white/50`}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-xs text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-${primaryColor}/10 to-${secondaryColor}/10 rounded-xl border border-${primaryColor}/20 shadow-sm`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${iconColor}`} />
            <span className="text-xs text-gray-600 font-semibold">Total:</span>
            <span className={`text-lg font-black text-${primaryColor.split('-')[0]}-700`}>{stats.total}</span>
          </div>
          <div className={`hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 shadow-sm`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-semibold">Active:</span>
            <span className="text-lg font-black text-emerald-700">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className={`bg-white rounded-2xl border border-${primaryColor.split('-')[0]}-100 shadow-lg shadow-${primaryColor.split('-')[0]}-100/30 overflow-hidden ring-1 ring-${primaryColor.split('-')[0]}-50/50`}>
        {/* Toolbar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-${primaryColor.split('-')[0]}-100/50 bg-gradient-to-r from-slate-50 via-white to-${primaryColor.split('-')[0]}-50/50`}>
          <div className="flex items-center gap-2 flex-1">
            <div className={`relative flex-1 max-w-xs`}>
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-${primaryColor.split('-')[0]}-400`} />
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 text-sm border border-${primaryColor.split('-')[0]}-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-${primaryColor}/30 focus:border-${primaryColor.split('-')[0]}-400 transition-all bg-white/80`}
              />
            </div>
            <button className={`p-2.5 rounded-xl border border-amber-200/60 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm`}>
              <Filter size={16} />
            </button>
            {/* Export Menu */}
            <div className="relative group">
              <button className="p-2.5 rounded-xl border border-emerald-200/60 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all flex items-center gap-1.5 shadow-sm">
                <Download size={16} />
                <span className="text-xs hidden sm:inline font-medium">Export</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 hidden group-hover:block min-w-[160px]">
                <button
                  onClick={() => handleExportPDF(true)}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-sky-50 flex items-center gap-2 font-medium text-gray-700"
                >
                  <Eye size={15} className="text-sky-500" />
                  Preview PDF
                </button>
                <button
                  onClick={() => handleExportPDF(false)}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-rose-50 flex items-center gap-2 font-medium text-gray-700"
                >
                  <Download size={15} className="text-rose-600" />
                  Download PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2.5 text-xs text-left hover:bg-emerald-50 flex items-center gap-2 font-medium text-gray-700"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  Export to Excel
                </button>
              </div>
            </div>
          </div>
          <button
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r ${iconColor} rounded-xl shadow-lg shadow-${primaryColor.split('-')[0]}-300/40 hover:shadow-xl transition-all active:scale-95`}
            onClick={() => openPanel()}
          >
            <Plus size={16} />
            Add {title}
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 mx-auto border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 mt-3">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${iconColor} opacity-20 flex items-center justify-center mb-4`}>
                {icon}
              </div>
              <p className="text-sm font-semibold text-gray-500">No records found</p>
              <p className="text-xs text-gray-400 mt-1">Add a new {title.toLowerCase()} to get started</p>
            </div>
          ) : data.map((row, index) => {
            const cardColors = [
              'border-l-blue-500 bg-gradient-to-r from-blue-50/60 to-indigo-50/40',
              'border-l-purple-500 bg-gradient-to-r from-purple-50/60 to-fuchsia-50/40',
              'border-l-teal-500 bg-gradient-to-r from-teal-50/60 to-cyan-50/40',
              'border-l-rose-500 bg-gradient-to-r from-rose-50/60 to-pink-50/40',
              'border-l-amber-500 bg-gradient-to-r from-amber-50/60 to-orange-50/40',
              'border-l-emerald-500 bg-gradient-to-r from-emerald-50/60 to-green-50/40',
              'border-l-sky-500 bg-gradient-to-r from-sky-50/60 to-blue-50/40',
              'border-l-violet-500 bg-gradient-to-r from-violet-50/60 to-purple-50/40',
            ];
            const avatarColors = [
              'from-blue-500 to-indigo-600 shadow-blue-400/40',
              'from-purple-500 to-fuchsia-600 shadow-purple-400/40',
              'from-teal-500 to-cyan-600 shadow-teal-400/40',
              'from-rose-500 to-pink-600 shadow-rose-400/40',
              'from-amber-500 to-orange-600 shadow-amber-400/40',
              'from-emerald-500 to-green-600 shadow-emerald-400/40',
              'from-sky-500 to-blue-600 shadow-sky-400/40',
              'from-violet-500 to-purple-600 shadow-violet-400/40',
            ];
            return (
              <div
                key={row.id || index}
                className={`p-5 border-l-4 ${cardColors[index % 8]} transition-all cursor-pointer active:scale-[0.98]`}
                onClick={() => openPanel(row)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[index % 8]} flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0 ring-2 ring-white/60`}>
                      {(row.name || row.code || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-gray-900 truncate">{row.name || row.code}</p>
                      {row.code && row.name && (
                        <p className="text-xs text-gray-500 font-mono mt-0.5 bg-gray-100 px-2 py-0.5 rounded-md inline-block">{row.code}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {row.status && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        row.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-100 text-rose-600 border border-rose-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${row.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                        {row.status}
                      </span>
                    )}
                  </div>
                </div>
                {/* Show additional columns as key-value pairs */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 bg-white/60 rounded-xl p-3">
                  {columns.filter(col => col.key !== 'name' && col.key !== 'code' && col.key !== 'status').slice(0, 4).map(col => (
                    <div key={col.key} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{col.header}:</span>
                      <span className="text-xs text-gray-700 font-medium truncate">{row[col.key] || '—'}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-200/60 pt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); openPanel(row); }}
                    className="p-2.5 rounded-xl text-blue-500 hover:text-white hover:bg-blue-500 transition-all shadow-sm hover:shadow-md"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); row.id && handleDelete(row.id); }}
                    className="p-2.5 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500 transition-all shadow-sm hover:shadow-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className={`bg-gradient-to-r from-slate-100 via-${primaryColor.split('-')[0]}-50/60 to-white border-b-2 border-${primaryColor.split('-')[0]}-200/50`}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left py-4 px-5 text-[11px] font-bold text-gray-600 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer group select-none hover:text-gray-900' : ''}`}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  >
                    {col.sortable !== false ? (
                      <span className="inline-flex items-center gap-1.5">
                        {col.header}
                        <SortIcon field={col.key} />
                      </span>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
                <th className="text-left py-4 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="py-12 text-center">
                  <div className="w-8 h-8 mx-auto border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 mt-3">Loading...</p>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="py-16 text-center">
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${iconColor} opacity-20 flex items-center justify-center mb-3`}>
                    {icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No records found</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add {title}" to create one</p>
                </td></tr>
              ) : data.map((row, index) => {
                const rowColors = [
                  'hover:from-blue-50/80 hover:to-indigo-50/50',
                  'hover:from-purple-50/80 hover:to-fuchsia-50/50',
                  'hover:from-teal-50/80 hover:to-cyan-50/50',
                  'hover:from-rose-50/80 hover:to-pink-50/50',
                  'hover:from-amber-50/80 hover:to-orange-50/50',
                  'hover:from-emerald-50/80 hover:to-green-50/50',
                ];
                return (
                  <tr
                    key={row.id || index}
                    className={`hover:bg-gradient-to-r ${rowColors[index % 6]} transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                    onClick={() => openPanel(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="py-3.5 px-5 font-medium text-gray-700">
                        {col.render ? col.render(row, index) : row[col.key]}
                      </td>
                    ))}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); openPanel(row); }}
                          className="p-2 rounded-xl text-blue-400 hover:text-white hover:bg-blue-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); row.id && handleDelete(row.id); }}
                          className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-${primaryColor.split('-')[0]}-100/50 bg-gradient-to-r from-slate-50 via-white to-${primaryColor.split('-')[0]}-50/30`}>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
              Showing <span className="font-bold text-gray-700">{totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-gray-700">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-bold text-gray-700">{totalRecords}</span> entries
            </p>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={`text-xs border border-${primaryColor.split('-')[0]}-200 rounded-xl px-3 py-1.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-${primaryColor}/30 bg-white`}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl bg-white hover:bg-${primaryColor.split('-')[0]}-50 hover:shadow-md text-gray-400 hover:text-${primaryColor.split('-')[0]}-600 border border-gray-200 hover:border-${primaryColor.split('-')[0]}-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ChevronLeft size={16} />
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
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? `bg-gradient-to-r ${iconColor} text-white shadow-lg`
                    : `bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-sm`
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 rounded-xl bg-white hover:bg-${primaryColor.split('-')[0]}-50 hover:shadow-md text-gray-400 hover:text-${primaryColor.split('-')[0]}-600 border border-gray-200 hover:border-${primaryColor.split('-')[0]}-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className={`w-full max-w-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl shadow-${primaryColor.split('-')[0]}-900/20 flex flex-col mx-3 ring-1 ring-white/20`} onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className={`px-6 py-5 border-b border-${primaryColor.split('-')[0]}-100/50 bg-gradient-to-r from-slate-50 via-white to-${primaryColor.split('-')[0]}-50/50 shrink-0 rounded-t-3xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconColor} shadow-xl ring-2 ring-white/60`}>
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedItem ? `Edit ${title}` : `New ${title}`}
                      </h2>
                      <p className={`text-xs text-${primaryColor.split('-')[0]}-500 font-semibold mt-0.5 uppercase tracking-wide`}>
                        {selectedItem ? selectedItem.code || selectedItem.name : `Create a new record`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="p-2.5 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-500 transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-white to-slate-50/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formFields.map((field) => (
                    <div key={field.key} className={field.gridCol === false ? 'col-span-2' : ''}>
                      {field.type === 'textarea' ? (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          <textarea
                            rows={3}
                            value={formData[field.key] || ''}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            className={`w-full px-4 py-3 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${primaryColor}/20 focus:border-${primaryColor.split('-')[0]}-400 transition-all resize-none placeholder-gray-400 bg-white`}
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
                <div className={`flex items-center gap-4 pt-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-${primaryColor.split('-')[0]}-50/30 -mx-6 px-6 py-4 rounded-xl`}>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Status</span>
                  <button
                    onClick={() => setStatusToggle(!statusToggle)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${statusToggle ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg shadow-emerald-400/30' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${statusToggle ? 'translate-x-7' : ''}`} />
                  </button>
                  <span className={`text-xs font-bold uppercase tracking-wide ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {statusToggle ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-6 py-5 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-${primaryColor.split('-')[0]}-50/30 shrink-0 rounded-b-3xl`}>
                <div className="flex items-center justify-between">
                  {selectedItem ? (
                    <button
                      onClick={() => selectedItem?.id && handleDelete(selectedItem.id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl shadow-lg shadow-red-300/40 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-3">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                      onClick={() => setShowPanel(false)}
                    >
                      <RotateCcw size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r ${iconColor} rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50`}
                    >
                      <Save size={14} /> {saving ? 'Saving...' : selectedItem ? 'Update' : 'Save'}
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
