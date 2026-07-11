import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ChevronsUpDown, Warehouse, Filter,
} from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../lib/api';

interface WarehouseRow {
  id: number;
  code: string;
  name: string;
  warehouse_type: string;
  city: string;
  state: string;
  is_default: string;
  status: string;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  'Raw Material': 'bg-blue-100 text-blue-700 border-blue-200',
  'Finished Goods': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Semi-Finished': 'bg-amber-100 text-amber-700 border-amber-200',
  'WIP': 'bg-violet-100 text-violet-700 border-violet-200',
  'Consumable': 'bg-teal-100 text-teal-700 border-teal-200',
  'Quarantine': 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function WarehouseMaster() {
  const navigate = useNavigate();
  const [data, setData] = useState<WarehouseRow[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
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
      const res = await api<{ data: WarehouseRow[]; total: number; totalPages: number }>(`/warehouses?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch { setData([]); } finally { setLoading(false); }
  }, [searchQuery, filterStatus, currentPage, pageSize, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: typeof stats }>('/warehouses/stats');
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
      const res = await api(`/warehouses/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Warehouse deleted');
      fetchData(); fetchStats();
    } catch (err) {
      toast.error('Failed to delete: ' + (err as Error).message);
    }
  };

  const columns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Warehouse Name', sortable: true },
    { key: 'warehouse_type', label: 'Type', sortable: true },
    { key: 'city', label: 'City', sortable: false },
    { key: 'is_default', label: 'Default', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <Warehouse size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Warehouse / Store Master</h1>
            <p className="text-xs text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">Manage warehouses and storage locations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
            <span className="text-xs text-gray-600 font-semibold">Total:</span>
            <span className="text-lg font-black text-blue-700">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-semibold">Active:</span>
            <span className="text-lg font-black text-emerald-700">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-blue-100/50 bg-gradient-to-r from-slate-50 via-white to-blue-50/50">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Search warehouses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-blue-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white/80"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-300/40 hover:shadow-xl transition-all active:scale-95"
            onClick={() => navigate('/warehouse-master/new')}
          >
            <Plus size={16} /> Add Warehouse
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 mx-auto border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 flex items-center justify-center mb-4">
                <Warehouse size={28} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No warehouses found</p>
            </div>
          ) : data.map((row) => (
            <div key={row.id} className="p-4 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 cursor-pointer" onClick={() => navigate(`/warehouse-master/${row.id}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">{row.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{row.code}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${TYPE_COLORS[row.warehouse_type] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                  {row.warehouse_type}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-600">{row.city || '—'}{row.state ? `, ${row.state}` : ''}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 via-blue-50/60 to-white border-b-2 border-blue-200/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left py-4 px-5 text-[11px] font-bold text-gray-600 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:text-gray-900' : ''}`}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                  >
                    {col.sortable !== false ? (
                      <span className="inline-flex items-center gap-1.5">{col.label}<SortIcon field={col.key} /></span>
                    ) : col.label}
                  </th>
                ))}
                <th className="text-left py-4 px-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <div className="w-8 h-8 mx-auto border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <p className="text-sm font-semibold text-gray-500">No warehouses found</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add Warehouse" to create one</p>
                </td></tr>
              ) : data.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50 transition-all cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                  onClick={() => navigate(`/warehouse-master/${row.id}`)}
                >
                  <td className="py-3.5 px-5 font-mono text-xs text-gray-600">{row.code}</td>
                  <td className="py-3.5 px-5 font-medium text-gray-900">{row.name}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${TYPE_COLORS[row.warehouse_type] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      {row.warehouse_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-gray-600">{row.city || '—'}</td>
                  <td className="py-3.5 px-5">
                    {row.is_default === 'Yes' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">Default</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                      <span className={`w-2 h-2 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/warehouse-master/${row.id}`); }} className="p-2 rounded-xl text-blue-400 hover:text-white hover:bg-blue-500 transition-all shadow-sm">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: row.id }); }} className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500 transition-all shadow-sm">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-blue-100/50 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
              Showing <span className="font-bold text-gray-700">{totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-gray-700">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-bold text-gray-700">{totalRecords}</span>
            </p>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs border border-blue-200 rounded-xl px-3 py-1.5 text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) page = i + 1;
              else { page = currentPage - 2 + i; if (page < 1) page = i + 1; if (page > totalPages) page = totalPages - 4 + i; }
              return page;
            }).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'}`}
              >
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Warehouse"
        message="Are you sure you want to delete this warehouse? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
