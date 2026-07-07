import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Search, FileText, Edit2, Trash2, ChevronLeft, ChevronRight,
  ChevronsUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../lib/api';

interface SalesOrderRow {
  id: number;
  order_no: string;
  customer_id: number;
  customer_name: string;
  order_date: string;
  delivery_date: string;
  payment_terms: string;
  sales_person: string;
  status: string;
  grand_total: number;
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600 border border-gray-200',
  Confirmed: 'bg-green-50 text-green-700 border border-green-200',
  Processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  Shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

export default function SalesOrder() {
  const navigate = useNavigate();
  const [data, setData] = useState<SalesOrderRow[]>([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, confirmed: 0, delivered: 0 });
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

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: typeof stats }>('/sales-orders/stats');
      setStats(res.data);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterStatus) params.set('status', filterStatus);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      const res = await api<{ data: SalesOrderRow[]; total: number; totalPages: number }>(`/sales-orders?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch { setData([]); } finally { setLoading(false); }
  }, [searchQuery, filterStatus, currentPage, pageSize, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, sortBy, sortOrder, pageSize]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api(`/sales-orders/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Sales order deleted!');
      fetchData();
      fetchStats();
    } catch (err) { toast.error('Failed to delete: ' + (err as Error).message); }
  };

  const statCards = [
    { label: 'Total Orders', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50 border-gray-200' },
    { label: 'Draft', value: stats.draft, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
    { label: 'Confirmed', value: stats.confirmed, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    { label: 'Delivered', value: stats.delivered, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200/50">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Sales Orders</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage all customer sales orders</p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
          onClick={() => navigate('/sales-orders/new')}
        >
          <Plus size={14} /> New Sales Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(c => (
          <div key={c.label} className={`p-3 rounded-xl border ${c.bg} shadow-sm`}>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white text-gray-600">
              <option value="">All Status</option>
              {['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[['order_no', 'Order No.'], ['customer_name', 'Customer'], ['order_date', 'Order Date'], ['delivery_date', 'Delivery Date'], ['payment_terms', 'Payment Terms'], ['grand_total', 'Amount (₹)'], ['status', 'Status']].map(([key, label]) => (
                  <th key={key} onClick={() => handleSort(key)} className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">{label} <SortIcon field={key} /></span>
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">No sales orders found</td></tr>
              ) : data.map((row, i) => (
                <tr key={row.id} className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`} onClick={() => navigate(`/sales-orders/${row.id}`)}>
                  <td className="py-3 px-4 font-mono text-xs font-medium text-blue-700">{row.order_no}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{row.customer_name}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{formatDate(row.order_date)}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{formatDate(row.delivery_date)}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{row.payment_terms || '—'}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-900">{formatCurrency(row.grand_total)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[row.status] || ''}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/sales-orders/${row.id}`); }} className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: row.id }); }} className="p-1.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 font-medium">Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries</p>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Sales Order"
        message="Are you sure you want to delete this sales order? All items and attachments will be removed."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
