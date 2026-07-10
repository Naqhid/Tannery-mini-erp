import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ChevronsUpDown, Truck, Eye,
} from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../lib/api';

interface Row {
  id: number;
  receipt_no: string;
  receipt_date: string;
  receipt_type: string;
  supplier_name: string;
  warehouse_name: string;
  grand_total: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  Posted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Cancelled: 'bg-rose-100 text-rose-600 border border-rose-200',
};

export default function MaterialReceiptEntry() {
  const navigate = useNavigate();
  const [data, setData] = useState<Row[]>([]);
  const [stats, setStats] = useState({ total: 0, posted: 0, draft: 0, total_value: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterStatus) params.set('status', filterStatus);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      const res = await api<{ data: Row[]; total: number; totalPages: number }>(`/material-receipts?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch { setData([]); } finally { setLoading(false); }
  }, [searchQuery, filterStatus, currentPage, pageSize, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: typeof stats }>('/material-receipts/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, sortBy, sortOrder, pageSize]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api(`/material-receipts/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Receipt deleted');
      fetchData(); fetchStats();
    } catch (err) { toast.error('Failed to delete: ' + (err as Error).message); }
  };

  const columns = [
    { key: 'receipt_no', label: 'Receipt No', sortable: true },
    { key: 'receipt_date', label: 'Date', sortable: true },
    { key: 'receipt_type', label: 'Type', sortable: false },
    { key: 'supplier_name', label: 'Supplier', sortable: false },
    { key: 'warehouse_name', label: 'Warehouse', sortable: false },
    { key: 'grand_total', label: 'Grand Total', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-xl shadow-orange-500/30 ring-2 ring-white/50">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Material Receipt Entry</h1>
            <p className="text-xs text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">Goods receipt notes (GRN)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600" />
            <span className="text-xs text-gray-600 font-semibold">Total:</span>
            <span className="text-lg font-black text-orange-700">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-semibold">Posted:</span>
            <span className="text-lg font-black text-emerald-700">{stats.posted}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 shadow-lg shadow-orange-100/30 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-orange-100/50 bg-gradient-to-r from-slate-50 via-white to-orange-50/50">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" />
              <input type="text" placeholder="Search receipts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-orange-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all bg-white/80" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white">
              <option value="">All Status</option>
              <option value="Posted">Posted</option>
              <option value="Draft">Draft</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={() => navigate('/material-receipt/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg shadow-orange-300/40 hover:shadow-xl transition-all active:scale-95">
            <Plus size={16} /> New Receipt
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="py-12 text-center"><div className="w-10 h-10 mx-auto border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin" /></div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 opacity-20 flex items-center justify-center mb-4"><Truck size={28} className="text-orange-600" /></div>
              <p className="text-sm font-semibold text-gray-500">No receipts found</p>
            </div>
          ) : data.map((row) => (
            <div key={row.id} className="p-4 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/60 to-amber-50/40 cursor-pointer" onClick={() => navigate(`/material-receipt/${row.id}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">{row.receipt_no}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{row.supplier_name || '—'} - {row.receipt_date?.split('T')[0]}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700'}`}>{row.status}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-600">{row.warehouse_name}</span>
                <span className="text-sm font-bold text-orange-700">₹{Number(row.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 via-orange-50/60 to-white border-b-2 border-orange-200/50">
                {columns.map((col) => (
                  <th key={col.key} className={`text-left py-4 px-5 text-[11px] font-bold text-gray-600 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:text-gray-900' : ''}`}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}>
                    {col.sortable !== false ? <span className="inline-flex items-center gap-1.5">{col.label}<SortIcon field={col.key} /></span> : col.label}
                  </th>
                ))}
                <th className="text-left py-4 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><div className="w-8 h-8 mx-auto border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <p className="text-sm font-semibold text-gray-500">No receipts found</p>
                  <p className="text-xs text-gray-400 mt-1">Click "New Receipt" to create one</p>
                </td></tr>
              ) : data.map((row, idx) => (
                <tr key={row.id} className={`hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-amber-50/50 transition-all cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                  onClick={() => navigate(`/material-receipt/${row.id}`)}>
                  <td className="py-3.5 px-5 font-mono text-xs text-gray-600">{row.receipt_no}</td>
                  <td className="py-3.5 px-5 text-gray-700">{row.receipt_date?.split('T')[0]}</td>
                  <td className="py-3.5 px-5"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">{row.receipt_type}</span></td>
                  <td className="py-3.5 px-5 font-medium text-gray-900">{row.supplier_name || '—'}</td>
                  <td className="py-3.5 px-5 text-gray-600">{row.warehouse_name}</td>
                  <td className="py-3.5 px-5 font-bold text-orange-700">₹{Number(row.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3.5 px-5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700'}`}>{row.status}</span></td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/material-receipt/${row.id}`); }} className="p-2 rounded-xl text-orange-400 hover:text-white hover:bg-orange-500 transition-all shadow-sm"><Edit2 size={15} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: row.id }); }} className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500 transition-all shadow-sm"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-orange-100/50 bg-gradient-to-r from-slate-50 via-white to-orange-50/30">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
              Showing <span className="font-bold text-gray-700">{totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-gray-700">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-bold text-gray-700">{totalRecords}</span>
            </p>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs border border-orange-200 rounded-xl px-3 py-1.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
              <option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white hover:bg-orange-50 text-gray-400 hover:text-orange-600 border border-gray-200 hover:border-orange-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) page = i + 1;
              else { page = currentPage - 2 + i; if (page < 1) page = i + 1; if (page > totalPages) page = totalPages - 4 + i; }
              return page;
            }).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl bg-white hover:bg-orange-50 text-gray-400 hover:text-orange-600 border border-gray-200 hover:border-orange-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={deleteConfirm.open} title="Delete Material Receipt" message="Are you sure? This will reverse all stock movements from this receipt."
        onConfirm={confirmDelete} onCancel={() => setDeleteConfirm({ open: false, id: null })} />
    </div>
  );
}
