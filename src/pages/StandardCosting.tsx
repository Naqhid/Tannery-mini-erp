import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, FileText, Download, Factory,
  ChevronDown, ChevronRight as ChevronRightIcon, Loader2,
} from 'lucide-react';
import { useDebounce } from '../lib/useDebounce';
import api from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-700',
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

interface StageCost {
  process_stage: string;
  material_cost: number;
  general_cost: number;
  machine_cost: number;
  total_cost: number;
}

interface CostSummary {
  stages: StageCost[];
  total_material: number;
  total_general: number;
  total_machine: number;
  grand_total: number;
}

interface StandardCostingProps {
  /** Route to open a detail sheet for a plan. Defaults to the Actual sheet. */
  detailBasePath?: string;
  /** Page title override. */
  title?: string;
}

export default function StandardCosting({ detailBasePath = '/standard-costing/actual/plan', title = 'Standard Cost (Actual)' }: StandardCostingProps = {}) {
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Accordion state
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [costSummary, setCostSummary] = useState<Record<number, CostSummary>>({});
  const [loadingCost, setLoadingCost] = useState<number | null>(null);

  // Filters
  const [customerId, setCustomerId] = useState('');
  const [article, setArticle] = useState('');
  const [color, setColor] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ articles: [], colors: [], finishes: [] });
  const [customers, setCustomers] = useState<Customer[]>([]);

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
      if (customerId) params.set('customer_id', customerId);
      if (article) params.set('article', article);
      if (color) params.set('color', color);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await api<{ data: any[]; total: number; totalPages: number }>(`/production-plans/sales-order-items?${params}`);
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
  }, [currentPage, pageSize, customerId, article, color, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [customerId, article, color, debouncedSearch]);

  const openDetail = (row: any) => {
    if (!row.plan_id) {
      toast.info('No production plan / cost data yet for this item');
      return;
    }
    navigate(`${detailBasePath}/${row.plan_id}`);
  };

  const toggleAccordion = async (e: React.MouseEvent, row: any) => {
    e.stopPropagation();
    const planId = row.plan_id;
    
    if (!planId) {
      toast.info('No production plan / cost data yet for this item');
      return;
    }

    if (expandedRow === row.item_id) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(row.item_id);

    // Fetch cost summary if not already loaded
    if (!costSummary[planId]) {
      setLoadingCost(row.item_id);
      try {
        const res = await api<{ data: CostSummary }>(`/costing-report/plan/${planId}/summary`);
        setCostSummary(prev => ({ ...prev, [planId]: res.data }));
      } catch {
        toast.error('Failed to load cost summary');
      } finally {
        setLoadingCost(null);
      }
    }
  };

  const formatQty = (n: number) => n != null ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : '0.00';
  const formatCurrency = (n: number) => n != null ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : '0.00';

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200/50">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Order-wise cost analysis with material, machine & general cost summary.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Customer</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 min-w-[150px]">
              <option value="">All</option>
              {customers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Article</label>
            <select value={article} onChange={e => setArticle(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 min-w-[150px]">
              <option value="">All</option>
              {filterOptions.articles.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Color</label>
            <select value={color} onChange={e => setColor(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 min-w-[130px]">
              <option value="">All</option>
              {filterOptions.colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-1" />

          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search customer, order, article..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-64 md:w-72 focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-indigo-800">Standard Cost Sheets</h2>
            <span className="text-xs text-gray-500">[Total: {totalRecords}]</span>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase w-10"></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase w-8">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Sale Order No.</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Customer</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Customer Order No.</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Article</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Color</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Order Qty<br />(Sq.Ft.)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Completed Qty<br />(Sq.Ft.)</th>
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
                    <p className="text-sm font-medium text-gray-500">No cost sheets found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <>
                    <tr
                      key={row.item_id}
                      className="hover:bg-indigo-50/40 transition-all cursor-pointer"
                      onClick={() => openDetail(row)}
                    >
                      <td className="py-2.5 px-3" onClick={(e) => toggleAccordion(e, row)}>
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          {loadingCost === row.item_id ? (
                            <Loader2 size={14} className="animate-spin text-indigo-600" />
                          ) : expandedRow === row.item_id ? (
                            <ChevronDown size={14} className="text-indigo-600" />
                          ) : (
                            <ChevronRightIcon size={14} className="text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-500 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="py-2.5 px-3 text-xs font-medium text-indigo-700">{row.sales_order_no || '—'}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-800">{row.customer_name || '—'}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-700">{row.customer_order_no || '—'}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-700">{row.article || '—'}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-700">{row.color || '—'}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-900 font-semibold text-right">{formatQty(row.order_qty)}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-900 font-semibold text-right">{formatQty(row.completed_qty)}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-900 font-semibold text-right">{formatQty(row.balance_qty)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                    {/* Accordion Content */}
                    {expandedRow === row.item_id && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={11} className="p-0">
                          <div className="px-6 py-4 border-t border-slate-200">
                            {loadingCost === row.item_id ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-indigo-600" />
                                <span className="ml-2 text-sm text-gray-500">Loading cost summary...</span>
                              </div>
                            ) : costSummary[row.plan_id] ? (
                              <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-700">Stage-wise Cost Summary</h4>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      <th className="text-left py-2 px-3 font-semibold text-slate-600">Stage</th>
                                      <th className="text-right py-2 px-3 font-semibold text-slate-600">Material Cost (₹)</th>
                                      <th className="text-right py-2 px-3 font-semibold text-slate-600">General Cost (₹)</th>
                                      <th className="text-right py-2 px-3 font-semibold text-slate-600">Machine Cost (₹)</th>
                                      <th className="text-right py-2 px-3 font-semibold text-slate-600">Total (₹)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {costSummary[row.plan_id].stages.map((stage, idx) => (
                                      <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-2 px-3 font-medium text-slate-700">{stage.process_stage || 'N/A'}</td>
                                        <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(stage.material_cost)}</td>
                                        <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(stage.general_cost)}</td>
                                        <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(stage.machine_cost)}</td>
                                        <td className="py-2 px-3 text-right font-semibold text-slate-700">{formatCurrency(stage.total_cost)}</td>
                                      </tr>
                                    ))}
                                    {costSummary[row.plan_id].stages.length === 0 && (
                                      <tr>
                                        <td colSpan={5} className="py-4 text-center text-slate-400">No cost data available</td>
                                      </tr>
                                    )}
                                  </tbody>
                                  {costSummary[row.plan_id].stages.length > 0 && (
                                    <tfoot className="border-t-2 border-slate-300 bg-slate-100">
                                      <tr>
                                        <td className="py-2 px-3 font-bold text-slate-700">Grand Total</td>
                                        <td className="py-2 px-3 text-right font-bold text-blue-700">{formatCurrency(costSummary[row.plan_id].total_material)}</td>
                                        <td className="py-2 px-3 text-right font-bold text-blue-700">{formatCurrency(costSummary[row.plan_id].total_general)}</td>
                                        <td className="py-2 px-3 text-right font-bold text-blue-700">{formatCurrency(costSummary[row.plan_id].total_machine)}</td>
                                        <td className="py-2 px-3 text-right font-bold text-indigo-700">{formatCurrency(costSummary[row.plan_id].grand_total)}</td>
                                      </tr>
                                    </tfoot>
                                  )}
                                </table>
                                <div className="flex justify-end">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openDetail(row); }}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                  >
                                    View Full Details <ChevronRightIcon size={14} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="py-4 text-center text-slate-400">No cost data available</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">No cost sheets found</p>
            </div>
          ) : (
            data.map((row) => (
              <div key={row.item_id}>
                <div className="p-4 active:bg-indigo-50 transition-colors cursor-pointer" onClick={() => openDetail(row)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleAccordion(e, row)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {loadingCost === row.item_id ? (
                          <Loader2 size={14} className="animate-spin text-indigo-600" />
                        ) : expandedRow === row.item_id ? (
                          <ChevronDown size={14} className="text-indigo-600" />
                        ) : (
                          <ChevronRightIcon size={14} className="text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{row.customer_name || '—'}</p>
                        <p className="text-xs text-indigo-700 font-mono mt-0.5">{row.sales_order_no || '—'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ml-2 ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700'}`}>{row.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2.5 ml-7">
                    <span className="truncate">{row.article || '—'}</span>
                    {row.color && <><span className="text-gray-300">•</span><span>{row.color}</span></>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-100 ml-7">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Order</p>
                      <p className="text-xs font-bold text-gray-900 tabular-nums">{formatQty(row.order_qty)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Completed</p>
                      <p className="text-xs font-bold text-gray-900 tabular-nums">{formatQty(row.completed_qty)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Balance</p>
                      <p className="text-xs font-bold text-amber-700 tabular-nums">{formatQty(row.balance_qty)}</p>
                    </div>
                  </div>
                </div>
                {/* Mobile Accordion Content */}
                {expandedRow === row.item_id && (
                  <div className="px-4 pb-4 bg-slate-50">
                    {loadingCost === row.item_id ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 size={20} className="animate-spin text-indigo-600" />
                      </div>
                    ) : costSummary[row.plan_id] ? (
                      <div className="space-y-2">
                        {costSummary[row.plan_id].stages.map((stage, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                            <p className="text-xs font-bold text-slate-700 mb-2">{stage.process_stage || 'N/A'}</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div><span className="text-slate-500">Material:</span> <span className="font-medium">₹{formatCurrency(stage.material_cost)}</span></div>
                              <div><span className="text-slate-500">General:</span> <span className="font-medium">₹{formatCurrency(stage.general_cost)}</span></div>
                              <div><span className="text-slate-500">Machine:</span> <span className="font-medium">₹{formatCurrency(stage.machine_cost)}</span></div>
                              <div><span className="text-slate-500">Total:</span> <span className="font-bold text-indigo-700">₹{formatCurrency(stage.total_cost)}</span></div>
                            </div>
                          </div>
                        ))}
                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs font-bold text-indigo-800">Grand Total: ₹{formatCurrency(costSummary[row.plan_id].grand_total)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-2">No cost data</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
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
                      ? 'bg-indigo-600 text-white shadow-sm'
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
    </div>
  );
}
