import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Factory, Plus, Search, Filter, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Trash2, Edit2, RefreshCw, X,
  FileSpreadsheet, Download,
} from 'lucide-react';
import api from '../lib/api';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Planned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'In-Process': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-violet-100 text-violet-700',
  Cancelled: 'bg-rose-100 text-rose-600',
};

interface FilterOptions {
  articles: string[];
  colors: string[];
  finishes: string[];
}

interface Customer { id: number; name: string; }

export default function ProductionPlan() {
  const navigate = useNavigate();

  // Data
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('');
  const [article, setArticle] = useState('');
  const [color, setColor] = useState('');
  const [finish, setFinish] = useState('');
  const [salesOrderNo, setSalesOrderNo] = useState('');
  const [customerOrderNo, setCustomerOrderNo] = useState('');

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ articles: [], colors: [], finishes: [] });
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Active search params (only applied when Search is clicked)
  const [activeParams, setActiveParams] = useState<Record<string, string>>({});

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Fetch filter options and customers
  useEffect(() => {
    (async () => {
      try {
        const [fo, cust] = await Promise.all([
          api<{ data: FilterOptions }>('/production-plans/filter-options'),
          api<{ data: Customer[] }>('/customers?limit=500'),
        ]);
        setFilterOptions(fo.data || { articles: [], colors: [], finishes: [] });
        setCustomers(cust.data || []);
      } catch {}
    })();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      params.set('sortBy', 'id');
      params.set('sortOrder', 'desc');
      for (const [k, v] of Object.entries(activeParams)) {
        if (v) params.set(k, v);
      }
      const res = await api<{ data: any[]; total: number; totalPages: number }>(`/production-plans?${params}`);
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
  }, [currentPage, pageSize, activeParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (customerId) params.customer_id = customerId;
    if (status) params.status = status;
    if (article) params.article = article;
    if (color) params.color = color;
    if (finish) params.finish = finish;
    if (salesOrderNo) params.sales_order_no = salesOrderNo;
    if (customerOrderNo) params.customer_order_no = customerOrderNo;
    setActiveParams(params);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setCustomerId('');
    setStatus('');
    setArticle('');
    setColor('');
    setFinish('');
    setSalesOrderNo('');
    setCustomerOrderNo('');
    setActiveParams({});
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api(`/production-plans/${deleteConfirm.id}`, { method: 'DELETE' });
      toast.success('Production plan deleted!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete: ' + (err as Error).message);
    }
    setDeleteConfirm({ open: false, id: null });
  };

  const formatQty = (n: number) => n != null ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : '0.00';

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Filter size={16} />
            <span className="text-sm font-bold">Filters</span>
          </div>
          <button
            onClick={() => navigate('/production-plan/new')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus size={14} /> New Production Plan
          </button>
        </div>

        {/* Filter Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="dd-mm-yyyy"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All</option>
              {customers.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All</option>
              {['Draft', 'Planned', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Article</label>
            <select
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All</option>
              {filterOptions.articles.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All</option>
              {filterOptions.colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Finish</label>
            <select
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">All</option>
              {filterOptions.finishes.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sales Order No.</label>
            <input
              type="text"
              value={salesOrderNo}
              onChange={(e) => setSalesOrderNo(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="Search SO No."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Order No.</label>
            <input
              type="text"
              value={customerOrderNo}
              onChange={(e) => setCustomerOrderNo(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="Search Customer Order No."
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
            >
              <Search size={13} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-blue-800">Production Plans</h2>
            <span className="text-xs text-gray-500">[Total: {totalRecords}]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { /* Export functionality */ }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FileSpreadsheet size={13} /> Export
            </button>
            <button onClick={fetchData} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase w-10">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Sale Order No.</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Customer</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Customer Order No.</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Article</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Color</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Finish</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Order Qty<br />(Sq.Ft.)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Planned Qty<br />(Sq.Ft.)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Balance Qty<br />(Sq.Ft.)</th>
                <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="py-3 px-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <Factory size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-500">No production plans found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or create a new plan</p>
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 transition-all cursor-pointer"
                    onClick={() => navigate(`/production-plan/${row.id}`)}
                  >
                    <td className="py-2.5 px-3 text-xs text-gray-500 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                    <td className="py-2.5 px-3 text-xs font-medium text-blue-700">{row.sales_order_no || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-800">{row.customer_name || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{row.customer_order_no || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{row.article || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{row.color || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{row.finish || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-900 font-semibold text-right">{formatQty(row.order_qty)}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-900 font-semibold text-right">{formatQty(row.planned_qty)}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-900 font-semibold text-right">{formatQty(row.balance_qty)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-gray-500">entries</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    currentPage === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Production Plan"
        message="Are you sure? This production plan will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
