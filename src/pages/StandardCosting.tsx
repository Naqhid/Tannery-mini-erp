import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Edit2, Trash2, Search, Filter,
  ChevronLeft, ChevronRight, FileText,
  ArrowUp, ArrowDown, ChevronsUpDown,
} from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useDebounce } from '../lib/useDebounce';
import { usePermission } from '../lib/usePermission';
import api from '../lib/api';

interface CostSheet {
  id: number;
  cost_sheet_no: string;
  cost_sheet_version: number;
  product_name: string;
  bom_name: string;
  bom_code: string;
  bom_type: string;
  currency: string;
  basis_unit: string;
  total_bom_cost: number;
  total_other_cost: number;
  standard_cost: number;
  status: string;
  prepared_by_name: string;
  created_at: string;
}

type SortField = 'cost_sheet_no' | 'cost_sheet_version' | 'standard_cost' | 'status' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function StandardCosting() {
  const { canWrite, isReadOnly } = usePermission();
  const navigate = useNavigate();
  const [sheets, setSheets] = useState<CostSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchSheets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      const res = await api<{ data: CostSheet[]; total: number; totalPages: number }>(`/standard-costs?${params.toString()}`);
      setSheets(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch { setSheets([]); }
    finally { setLoading(false); }
  }, [debouncedSearch, statusFilter, currentPage, pageSize, sortBy, sortOrder]);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-700 group-hover:text-gray-900" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  const handleDelete = (id: number) => setDeleteConfirm({ open: true, id });
  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      await api(`/standard-costs/${id}`, { method: 'DELETE' });
      toast.success('Cost sheet deleted!');
      fetchSheets();
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Unapproved: 'bg-amber-50 text-amber-700 border-amber-200',
      Draft: 'bg-amber-50 text-amber-700 border-amber-200',
      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Posted: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200/50">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Standard Costing</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage product standard cost sheets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
            <span className="text-xs text-indigo-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-indigo-800">{totalRecords}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input type="text" placeholder="Search cost sheets..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white" />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-lg border border-purple-200 bg-white py-2 pl-7 pr-6 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200">
                <option value="">All statuses</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Posted">Posted</option>
              </select>
            </div>
          </div>
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-lg shadow-md transition-all ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg active:scale-95'}`}
            onClick={canWrite ? () => navigate('/standard-costing/new') : undefined}
            disabled={isReadOnly}
          >
            <Plus size={14} /> New Cost Sheet
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-indigo-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('cost_sheet_no')}><span className="inline-flex items-center gap-1">Cost Sheet No <SortIcon field="cost_sheet_no" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('cost_sheet_version')}><span className="inline-flex items-center gap-1">Version <SortIcon field="cost_sheet_version" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider hidden lg:table-cell">BOM</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('standard_cost')}><span className="inline-flex items-center gap-1">Standard Cost <SortIcon field="standard_cost" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort('status')}><span className="inline-flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonLoader rows={5} cols={7} />
              ) : sheets.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No cost sheets found" message="Create a new Standard Cost Sheet" actionLabel="New Cost Sheet" onAction={() => navigate('/standard-costing/new')} /></td></tr>
              ) : sheets.map((s, index) => (
                <tr key={s.id} className={`hover:bg-indigo-50/50 transition-all cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => navigate(`/standard-costing/${s.id}`)}>
                  <td className="py-3 px-4"><span className="font-mono text-xs text-indigo-600 font-medium">{s.cost_sheet_no}</span></td>
                  <td className="py-3 px-4"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">{String(s.cost_sheet_version).padStart(2, '0')}</span></td>
                  <td className="py-3 px-4"><span className="text-gray-900 font-medium text-xs">{s.product_name || '-'}</span></td>
                  <td className="py-3 px-4 hidden lg:table-cell"><span className="text-gray-600 text-xs">{s.bom_name || s.bom_code || '-'}</span></td>
                  <td className="py-3 px-4"><span className="font-semibold text-gray-900">{s.currency || 'INR'} {Number(s.standard_cost).toFixed(2)}</span></td>
                  <td className="py-3 px-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge(s.status)}`}>{s.status}</span></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/standard-costing/${s.id}`); }} className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100"><Edit2 size={14} /></button>
                      {canWrite && s.status !== 'Posted' && (
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {currentPage} of {totalPages} ({totalRecords} records)</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog open={deleteConfirm.open} title="Delete Cost Sheet" message="Are you sure you want to delete this cost sheet?" onConfirm={confirmDelete} onCancel={() => setDeleteConfirm({ open: false, id: null })} />
    </div>
  );
}
