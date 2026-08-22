import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ChevronsUpDown,
  Factory, Download, Pencil, Trash2,
} from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import api from '../lib/api';
import { toast } from 'react-toastify';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderRow {
  id: number;
  order_no: string;
  customer_name: string;
  article: string;
  color: string;
  process_stage: string;
  issued_qty: number;
  completed_qty: number;
  balance_qty: number;
  status: string;
  uom: string;
  plan_date: string;
  posted_at: string | null;
}

type SortField = 'order_no' | 'customer_name' | 'article' | 'color' | 'issued_qty' | 'completed_qty' | 'balance_qty' | 'status';
type SortOrder = 'asc' | 'desc';

const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'In-Process': 'bg-blue-50 text-blue-700 border border-blue-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Posted: 'bg-violet-50 text-violet-700 border border-violet-200',
};

export default function ProductionStatus() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processStage, setProcessStage] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState<OrderRow | null>(null);
  const [activeTab, setActiveTab] = useState<'order' | 'transaction'>('order');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (processStage !== 'All') params.set('process_stage', processStage);
      if (statusFilter !== 'All') params.set('status_filter', statusFilter);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      if (activeTab === 'transaction') params.set('has_transactions', 'true');
      const res = await api<{ data: OrderRow[]; total: number; totalPages: number }>(`/production-status/orders?${params.toString()}`);
      setRows(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [processStage, statusFilter, currentPage, pageSize, sortBy, sortOrder, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [processStage, statusFilter, sortBy, sortOrder, activeTab]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api(`/production-status/orders/${deletingId.id}`, { method: 'DELETE' });
      toast.success('Record deleted!');
      setDeletingId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleExport = () => {
    const headers = ['Plan No', 'Customer', 'Article', 'Color', 'Planned Qty', 'Completed Qty', 'Balance Qty', 'Status'];
    const csvRows = rows.map(r => [r.order_no, r.customer_name, r.article, r.color, r.issued_qty, r.completed_qty, r.balance_qty, r.status].join(','));
    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'daily_production.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  const formatNumber = (n: number) => new Intl.NumberFormat('en-IN').format(n || 0);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <Factory size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Daily Production</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">View production progress at selected process stage</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={() => navigate('/production-status/new')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Factory size={14} /> New Entry
          </button>
          <button onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Process Stage</label>
            <select value={processStage} onChange={e => setProcessStage(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]">
              <option value="All">All Stages</option>
              <option value="Wet End">Wet End</option>
              <option value="Finishing">Finishing</option>
              <option value="Packing">Packing</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]">
              <option value="All">All</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex-1" />
          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-5 border-b border-gray-200">
        <button onClick={() => setActiveTab('order')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${activeTab === 'order' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Order Summary
        </button>
        <button onClick={() => setActiveTab('transaction')}
          className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 ${activeTab === 'transaction' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Transaction
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><SkeletonLoader rows={8} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="No records found" message={activeTab === 'transaction' ? "No records with transactions yet." : "Daily Production records are created from Production Plans."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th onClick={() => handleSort('order_no')} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Plan No. <SortIcon field="order_no" /></span>
                  </th>
                  <th onClick={() => handleSort('article')} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Article <SortIcon field="article" /></span>
                  </th>
                  <th onClick={() => handleSort('color')} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Color <SortIcon field="color" /></span>
                  </th>
                  <th onClick={() => handleSort('issued_qty')} className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Planned Qty <SortIcon field="issued_qty" /></span>
                  </th>
                  <th onClick={() => handleSort('completed_qty')} className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Completed Qty <SortIcon field="completed_qty" /></span>
                  </th>
                  <th onClick={() => handleSort('balance_qty')} className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Balance Qty <SortIcon field="balance_qty" /></span>
                  </th>
                  <th onClick={() => handleSort('status')} className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Status <SortIcon field="status" /></span>
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-blue-50/60 cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    onClick={() => navigate(`/production-status/${row.id}`)}
                  >
                    <td className="px-4 py-3.5 text-sm text-blue-700 font-mono font-medium">{row.order_no || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.article || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-medium">{row.color || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.issued_qty)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.completed_qty)}</td>
                    <td className="px-4 py-3.5 text-sm text-right tabular-nums">
                      <span className={`font-semibold ${row.balance_qty > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{formatNumber(row.balance_qty)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/production-status/${row.id}`); }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeletingId(row); }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalRecords > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-gray-700">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-medium text-gray-700">{totalRecords}</span> entries
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsLeft size={14} /></button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const pg = startPage + i;
                if (pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${pg === currentPage ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-700'}`}
                  >{pg}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsRight size={14} /></button>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="ml-3 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white cursor-pointer">
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeletingId(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Record</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold text-blue-700 font-mono">{deletingId.order_no || `#${deletingId.id}`}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
