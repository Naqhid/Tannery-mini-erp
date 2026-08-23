import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ChevronsUpDown,
  BarChart3, Download,
} from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import { useDebounce } from '../lib/useDebounce';
import api from '../lib/api';

interface ReportRow {
  id: number;
  customer_name: string;
  order_no: string;
  article: string;
  color: string;
  order_qty_sqft: number;
  completed_qty_sqft: number;
  cost_per_sqft: number;
  selling_price_per_sqft: number;
  variance_per_sqft: number;
  total_general_cost: number;
  total_machine_cost: number;
  total_material_cost: number;
}

interface Filters {
  customers: string[];
  articles: string[];
  colors: string[];
}

type SortField = 'customer_name' | 'order_no' | 'article' | 'color' | 'order_qty_sqft' | 'completed_qty_sqft' | 'cost_per_sqft' | 'selling_price_per_sqft' | 'variance_per_sqft';
type SortOrder = 'asc' | 'desc';

export default function CostingReport() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  const [customerFilter, setCustomerFilter] = useState('');
  const [articleFilter, setArticleFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [filterOptions, setFilterOptions] = useState<Filters>({ customers: [], articles: [], colors: [] });

  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch filter options
  useEffect(() => {
    api<{ data: Filters }>('/costing-report/filters')
      .then(res => setFilterOptions(res.data || { customers: [], articles: [], colors: [] }))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (customerFilter) params.set('customer', customerFilter);
      if (articleFilter) params.set('article', articleFilter);
      if (colorFilter) params.set('color', colorFilter);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      const res = await api<{ data: ReportRow[]; total: number; totalPages: number }>(`/costing-report?${params.toString()}`);
      setRows(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, customerFilter, articleFilter, colorFilter, currentPage, pageSize, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, customerFilter, articleFilter, colorFilter, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  const formatNumber = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  const formatQty = (n: number) => new Intl.NumberFormat('en-IN').format(n || 0);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-600/20 shrink-0">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Costing Report</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Order-wise cost analysis with material, machine & general cost summary.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Customer</label>
            <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 min-w-[150px]">
              <option value="">All</option>
              {filterOptions.customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Article</label>
            <select value={articleFilter} onChange={e => setArticleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 min-w-[150px]">
              <option value="">All</option>
              {filterOptions.articles.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Color</label>
            <select value={colorFilter} onChange={e => setColorFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 min-w-[130px]">
              <option value="">All</option>
              {filterOptions.colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-1" />

          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search customer, order, article..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-64 md:w-72 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><SkeletonLoader rows={8} /></div>
        ) : rows.length === 0 ? (
          <EmptyState title="No data found" description="No orders match your current filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th onClick={() => handleSort('order_no')} className="group px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1">Order No. <SortIcon field="order_no" /></span>
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
                  <th onClick={() => handleSort('order_qty_sqft')} className="group px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Order Qty (Sq.ft) <SortIcon field="order_qty_sqft" /></span>
                  </th>
                  <th onClick={() => handleSort('completed_qty_sqft')} className="group px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Completed Qty (Sq.ft) <SortIcon field="completed_qty_sqft" /></span>
                  </th>
                  <th onClick={() => handleSort('cost_per_sqft')} className="group px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Cost / Sq.ft <SortIcon field="cost_per_sqft" /></span>
                  </th>
                  <th onClick={() => handleSort('selling_price_per_sqft')} className="group px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Selling Price / Sq.ft <SortIcon field="selling_price_per_sqft" /></span>
                  </th>
                  <th onClick={() => handleSort('variance_per_sqft')} className="group px-4 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none">
                    <span className="inline-flex items-center gap-1 justify-end">Variance / Sq.ft <SortIcon field="variance_per_sqft" /></span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr key={row.id} className={`transition-colors hover:bg-blue-50/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3.5 text-sm text-blue-700 font-mono font-medium">{row.order_no || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-medium">{row.customer_name || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.article || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.color || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatQty(row.order_qty_sqft)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatQty(row.completed_qty_sqft)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.cost_per_sqft)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-semibold text-right tabular-nums">{formatNumber(row.selling_price_per_sqft)}</td>
                    <td className="px-4 py-3.5 text-sm text-right tabular-nums">
                      <span className={`font-semibold ${row.variance_per_sqft > 0 ? 'text-red-600' : row.variance_per_sqft < 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {row.variance_per_sqft > 0 ? '↑ ' : row.variance_per_sqft < 0 ? '↓ ' : ''}{formatNumber(Math.abs(row.variance_per_sqft))}
                      </span>
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
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronsLeft size={14} /></button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronLeft size={14} /></button>
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
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronRight size={14} /></button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronsRight size={14} /></button>
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

      {/* Mobile Card View */}
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
        ) : rows.length === 0 ? (
          <EmptyState title="No data found" description="No orders match your current filters." />
        ) : (
          <>
            {rows.map(row => (
              <div key={row.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                {/* Top: Customer + Order */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{row.customer_name || '—'}</p>
                    <p className="text-xs text-blue-700 font-mono mt-0.5">{row.order_no || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ml-2 ${row.variance_per_sqft > 0 ? 'bg-red-50 text-red-700 border border-red-200' : row.variance_per_sqft < 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {row.variance_per_sqft > 0 ? '↑' : row.variance_per_sqft < 0 ? '↓' : '—'} {formatNumber(Math.abs(row.variance_per_sqft))}/sqft
                  </span>
                </div>

                {/* Article + Color */}
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                  <span className="truncate">{row.article || '—'}</span>
                  {row.color && <><span className="text-gray-300">•</span><span>{row.color}</span></>}
                </div>

                {/* Qty and cost info */}
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Order Sqft</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{formatQty(row.order_qty_sqft)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Completed</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{formatQty(row.completed_qty_sqft)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Cost/Sqft</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{formatNumber(row.cost_per_sqft)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Selling/Sqft</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{formatNumber(row.selling_price_per_sqft)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Variance/Sqft</p>
                    <p className={`text-sm font-bold tabular-nums ${row.variance_per_sqft > 0 ? 'text-red-600' : row.variance_per_sqft < 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {formatNumber(row.variance_per_sqft)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {totalRecords > 0 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <span className="text-xs font-medium text-gray-700 px-2">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
