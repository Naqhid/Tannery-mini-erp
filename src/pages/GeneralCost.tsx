import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ChevronsUpDown,
  FileText, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import { ScanLine } from 'lucide-react';
import { useDebounce } from '../lib/useDebounce';
import api from '../lib/api';
import BarcodeScanner from '../components/BarcodeScanner';

interface StageOption { id: number; name: string; }

interface OrderRow {
  id: number;
  plan_no: string;
  customer_name: string;
  order_no: string;
  article: string;
  color: string;
  order_qty: number;
  completed_qty: number;
  balance_qty: number;
  status: string;
  uom: string;
  general_cost_id: number | null;
  transaction_no: string | null;
  cost_status: string | null;
}

interface TxnRow {
  id: number;
  general_cost_id: number;
  transaction_no: string;
  plan_no: string;
  group_name: string;
  production_date: string;
  cost_category: string;
  uom: string;
  amount: number;
  cost_per_piece: number;
}

type SortField = 'customer_name' | 'order_no' | 'article' | 'color' | 'order_qty' | 'status';
type SortOrder = 'asc' | 'desc';

const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  'In-Process': 'bg-blue-50 text-blue-700 border border-blue-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Planned: 'bg-violet-50 text-violet-700 border border-violet-200',
  Draft: 'bg-slate-50 text-slate-700 border border-slate-200',
};

export default function GeneralCost() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [txnRows, setTxnRows] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);
  const [processStage, setProcessStage] = useState('All');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTab, setActiveTab] = useState<'order' | 'transaction'>('order');
  const [stageOptions, setStageOptions] = useState<StageOption[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (processStage !== 'All') params.set('process_stage', processStage);
      params.set('show_completed', String(showCompleted));
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      if (activeTab === 'transaction') {
        params.set('view', 'transaction');
        const res = await api<{ data: TxnRow[]; total: number; totalPages: number }>(`/general-costs?${params.toString()}`);
        setTxnRows(res.data || []);
        setTotalRecords(res.total || 0);
        setTotalPages(res.totalPages || 0);
      } else {
        const res = await api<{ data: OrderRow[]; total: number; totalPages: number }>(`/general-costs?${params.toString()}`);
        setRows(res.data || []);
        setTotalRecords(res.total || 0);
        setTotalPages(res.totalPages || 0);
      }
    } catch {
      setRows([]);
      setTxnRows([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, processStage, showCompleted, currentPage, pageSize, sortBy, sortOrder, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, processStage, showCompleted, sortBy, sortOrder, activeTab]);

  // Load process stages from master
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: StageOption[] }>('/process-stages?limit=100');
        setStageOptions(res.data || []);
      } catch { setStageOptions([]); }
    })();
  }, []);

  const handleRowClick = (row: OrderRow) => {
    if (row.general_cost_id) {
      navigate(`/general-cost/${row.general_cost_id}`);
    } else {
      navigate(`/general-cost/new?planId=${row.id}`);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">General Cost</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Summary of general cost (standard cost) for all orders.</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Process Stage</label>
            <select
              value={processStage}
              onChange={e => setProcessStage(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[130px]"
            >
              <option value="All">All</option>
              {stageOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={e => setShowCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Completed orders</span>
          </label>

          {/* Tabs */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setActiveTab('order')} className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'order' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Order Status</button>
            <button onClick={() => setActiveTab('transaction')} className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'transaction' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Transaction</button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer, order no..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-64 md:w-72 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              title="Scan to search"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              <ScanLine size={16} /> Scan
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(value) => setSearchInput(value)}
      />

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><SkeletonLoader rows={8} /></div>
        ) : activeTab === 'transaction' ? (
          txnRows.length === 0 ? (
            <EmptyState title="No transactions found" description="No general cost transactions match your current filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan No.</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction No.</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Production Date</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Group</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Category</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UOM</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (₹)</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost / Piece (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {txnRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      onClick={() => navigate(`/general-cost/${row.general_cost_id}`)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      <td className="px-4 py-3.5 text-sm text-blue-700 font-mono font-medium">{row.plan_no || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 font-mono">{row.transaction_no || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{row.production_date ? new Date(row.production_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{row.group_name || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-900 font-medium">{row.cost_category || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">{row.uom || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.amount)}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.cost_per_piece)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : rows.length === 0 ? (
          <EmptyState title="No orders found" description="No production plans match your current filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th onClick={() => handleSort('order_no')} className="group px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Plan No. <SortIcon field="order_no" /></span>
                  </th>
                  <th onClick={() => handleSort('customer_name')} className="group px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Customer <SortIcon field="customer_name" /></span>
                  </th>
                  <th onClick={() => handleSort('article')} className="group px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Article <SortIcon field="article" /></span>
                  </th>
                  <th onClick={() => handleSort('color')} className="group px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Color <SortIcon field="color" /></span>
                  </th>
                  <th onClick={() => handleSort('order_qty')} className="group px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Planned Qty (Pcs) <SortIcon field="order_qty" /></span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed Qty (Pcs)</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance Qty (Pcs)</th>
                  <th onClick={() => handleSort('status')} className="group px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Status <SortIcon field="status" /></span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3.5 text-sm text-blue-700 font-mono font-medium">{row.order_no || row.plan_no || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-medium">{row.customer_name || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.article || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.color || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.order_qty)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.completed_qty)}</td>
                    <td className="px-4 py-3.5 text-sm text-right tabular-nums">
                      <span className={`font-semibold ${row.balance_qty > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                        {formatNumber(row.balance_qty)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Desktop Pagination */}
        {!loading && totalRecords > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-gray-700">{Math.min(currentPage * pageSize, totalRecords)}</span> of <span className="font-medium text-gray-700">{totalRecords}</span> entries
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronsLeft size={14} />
              </button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const page = startPage + i;
                if (page > totalPages) return null;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === currentPage ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-700'}`}
                  >{page}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronsRight size={14} />
              </button>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="ml-3 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View (visible on mobile only) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : activeTab === 'transaction' ? (
          txnRows.length === 0 ? (
            <EmptyState title="No transactions found" description="No general cost transactions match your current filters." />
          ) : (
            <>
              {txnRows.map(row => (
                <div
                  key={row.id}
                  onClick={() => navigate(`/general-cost/${row.general_cost_id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-blue-700 font-mono font-medium">{row.plan_no || '—'}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{row.transaction_no || '—'}</p>
                    </div>
                    <p className="text-[10px] text-gray-500">{row.production_date ? new Date(row.production_date).toLocaleDateString('en-IN') : '—'}</p>
                  </div>
                  {row.group_name && <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{row.group_name}</p>}
                  <p className="text-sm font-semibold text-gray-900 mb-2">{row.cost_category || '—'} <span className="text-xs font-normal text-gray-500">({row.uom || '—'})</span></p>
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Amount (₹)</p>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">{formatNumber(row.amount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Cost / Piece (₹)</p>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">{formatNumber(row.cost_per_piece)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )
        ) : rows.length === 0 ? (
          <EmptyState title="No orders found" description="No production plans match your current filters." />
        ) : (
          <>
            {rows.map(row => (
              <div
                key={row.id}
                onClick={() => handleRowClick(row)}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:bg-blue-50 transition-colors cursor-pointer"
              >
                {/* Top: Customer + Status */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{row.customer_name || '—'}</p>
                    <p className="text-xs text-blue-700 font-mono mt-0.5">{row.order_no || row.plan_no || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ml-2 ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {row.status}
                  </span>
                </div>

                {/* Middle: Article + Color */}
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                  <span className="truncate">{row.article || '—'}</span>
                  {row.color && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{row.color}</span>
                    </>
                  )}
                </div>

                {/* Bottom: Qty info */}
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Planned</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{formatNumber(row.order_qty)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Completed</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{formatNumber(row.completed_qty)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Balance</p>
                    <p className={`text-sm font-bold tabular-nums ${row.balance_qty > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                      {formatNumber(row.balance_qty)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalRecords > 0 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500">
                  {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-medium text-gray-700 px-2">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
