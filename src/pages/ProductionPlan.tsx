import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Factory, Search, Filter, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, RefreshCw,
  FileSpreadsheet, Plus, ChevronDown, Trash2,
} from 'lucide-react';
import api from '../lib/api';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SearchableSelect from '../components/ui/SearchableSelect';
import { usePermission } from '../lib/usePermission';

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

export default function ProductionPlan() {
  const navigate = useNavigate();
  const { canWrite } = usePermission();

  // Data
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; itemId?: number; plan_row?: any }>({ open: false, id: null });

  // Accordion
  const [expandedRow, setExpandedRow] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('productionPlan_expandedRow');
    return saved ? Number(saved) : null;
  });
  const [rowPlans, setRowPlans] = useState<Record<number, any[]>>({});
  const [rowPlansLoading, setRowPlansLoading] = useState<Record<number, boolean>>({});

  // Persist expandedRow to sessionStorage
  useEffect(() => {
    if (expandedRow !== null) {
      sessionStorage.setItem('productionPlan_expandedRow', String(expandedRow));
    } else {
      sessionStorage.removeItem('productionPlan_expandedRow');
    }
  }, [expandedRow]);

  // Fetch all plans created for a given sales-order-item row (there can be multiple)
  // Declared before the effects that depend on it to avoid a temporal-dead-zone
  // "Cannot access before initialization" crash in the minified build.
  const fetchRowPlans = useCallback(async (row: any) => {
    setRowPlansLoading((prev) => ({ ...prev, [row.item_id]: true }));
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (row.sales_order_no) params.set('sales_order_no', row.sales_order_no);
      if (row.article) params.set('article', row.article);
      if (row.color) params.set('color', row.color);
      const res = await api<{ data: any[] }>(`/production-plans?${params}`);
      setRowPlans((prev) => ({ ...prev, [row.item_id]: res.data || [] }));
    } catch {
      setRowPlans((prev) => ({ ...prev, [row.item_id]: [] }));
    } finally {
      setRowPlansLoading((prev) => ({ ...prev, [row.item_id]: false }));
    }
  }, []);

  // When data finishes loading and there's a restored expandedRow, fetch its plans
  useEffect(() => {
    if (!loading && expandedRow !== null && data.length > 0) {
      const row = data.find((r) => r.item_id === expandedRow);
      if (row && !rowPlans[expandedRow]) {
        fetchRowPlans(row);
      }
    }
  }, [loading, expandedRow, data, rowPlans, fetchRowPlans]);

  const createNewPlan = (row: any) => {
    navigate(`/production-plan/new?sales_order_id=${row.sales_order_id}&article=${encodeURIComponent(row.article || '')}&color=${encodeURIComponent(row.color || '')}&customer_id=${row.customer_id || ''}&order_qty=${row.order_qty || 0}`);
  };

  const goToPlan = (row: any) => {
    if (row.plan_id) {
      navigate(`/production-plan/${row.plan_id}`);
    } else {
      createNewPlan(row);
    }
  };

  const toggleRow = (row: any) => {
    const willExpand = expandedRow !== row.item_id;
    setExpandedRow(willExpand ? row.item_id : null);
    if (willExpand) fetchRowPlans(row);
  };

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
      for (const [k, v] of Object.entries(activeParams)) {
        if (v) params.set(k, v);
      }
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
  }, [currentPage, pageSize, activeParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    const params: Record<string, string> = {};
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
      // Refresh the accordion plans for the affected row, and the main list
      if (deleteConfirm.plan_row) fetchRowPlans(deleteConfirm.plan_row);
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
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filter Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
            <SearchableSelect
              options={[{ value: '', label: 'All' }, ...customers.map((c) => ({ value: String(c.id), label: c.name }))]}
              value={customerId}
              onChange={setCustomerId}
              placeholder="All"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <SearchableSelect
              options={[{ value: '', label: 'All' }, ...['Pending', 'In Progress', 'Completed'].map((s) => ({ value: s, label: s }))]}
              value={status}
              onChange={setStatus}
              placeholder="All"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Article</label>
            <SearchableSelect
              options={[{ value: '', label: 'All' }, ...filterOptions.articles.map((a) => ({ value: a, label: a }))]}
              value={article}
              onChange={setArticle}
              placeholder="All"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
            <SearchableSelect
              options={[{ value: '', label: 'All' }, ...filterOptions.colors.map((c) => ({ value: c, label: c }))]}
              value={color}
              onChange={setColor}
              placeholder="All"
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
            <h2 className="text-sm font-bold text-blue-800">Production Requirement Plans</h2>
            <span className="text-xs text-gray-500">[Total: {totalRecords}]</span>
          </div>
          <div className="flex items-center gap-2">
            {canWrite && (
              <button
                onClick={() => navigate('/production-plan/new')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                <Plus size={13} /> New Plan
              </button>
            )}
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

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-8" />
              <col className="w-8" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase" />
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">#</th>
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
                    <p className="text-sm font-medium text-gray-500">No production plans found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or create a new plan</p>
                  </td>
                </tr>
              ) : (
                data.map((row, i) => {
                  const isExpanded = expandedRow === row.item_id;
                  return (
                  <Fragment key={row.item_id}>
                  <tr
                    className={`hover:bg-blue-50/40 transition-all cursor-pointer ${isExpanded ? 'bg-blue-50/60' : ''}`}
                    onClick={() => toggleRow(row)}
                  >
                    <td className="py-2.5 px-3 text-gray-400">
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-500 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                    <td className="py-2.5 px-3 text-xs font-medium text-blue-700">{row.sales_order_no || '—'}</td>
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
                  {isExpanded && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={11} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Sale Order</p><p className="text-xs font-medium text-gray-800 mt-0.5">{row.sales_order_no || '—'}</p></div>
                          <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Article Code</p><p className="text-xs font-medium text-gray-800 mt-0.5">{row.article_code || '—'}</p></div>
                          <div><p className="text-[10px] text-gray-400 uppercase font-semibold">UOM</p><p className="text-xs font-medium text-gray-800 mt-0.5">{row.uom || '—'}</p></div>
                          <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Total Planned Qty</p><p className="text-xs font-medium text-gray-800 mt-0.5">{formatQty(row.planned_qty)}</p></div>
                        </div>

                        {/* Plans created for this row */}
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-slate-50">
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                              Plans ({(rowPlans[row.item_id] || []).length})
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); createNewPlan(row); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                            >
                              <Plus size={12} /> Create New Plan
                            </button>
                          </div>
                          {rowPlansLoading[row.item_id] ? (
                            <div className="p-4 space-y-2">
                              {[1, 2].map((k) => <div key={k} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                            </div>
                          ) : (rowPlans[row.item_id] || []).length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-gray-400">
                              No plans created yet for this item.
                            </div>
                          ) : (
                            <table className="w-full text-sm table-fixed">
                              <colgroup>
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/8" />
                                <col className="w-1/8" />
                              </colgroup>
                              <thead>
                                <tr className="border-b border-gray-100">
                                  <th className="text-left py-2 px-4 text-[10px] font-bold text-gray-500 uppercase">Plan No.</th>
                                  <th className="text-left py-2 px-4 text-[10px] font-bold text-gray-500 uppercase">Plan Date</th>
                                  <th className="text-right py-2 px-4 text-[10px] font-bold text-gray-500 uppercase">Planned Qty</th>
                                  <th className="text-center py-2 px-4 text-[10px] font-bold text-gray-500 uppercase">Status</th>
                                  <th className="text-center py-2 px-4 text-[10px] font-bold text-gray-500 uppercase">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {(rowPlans[row.item_id] || []).map((plan: any) => (
                                  <tr key={plan.id} className="hover:bg-blue-50/40">
                                    <td className="py-2 px-4 text-xs font-medium text-blue-700">{plan.plan_no || '—'}</td>
                                    <td className="py-2 px-4 text-xs text-gray-700">{plan.plan_date ? new Date(plan.plan_date).toLocaleDateString('en-IN') : '—'}</td>
                                    <td className="py-2 px-4 text-xs text-gray-900 font-semibold text-right">{formatQty(plan.planned_qty)}</td>
                                    <td className="py-2 px-4 text-center">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[plan.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {plan.status}
                                      </span>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); navigate(`/production-plan/${plan.id}`); }}
                                          className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-all"
                                        >
                                          Open
                                        </button>
                                        {canWrite && (plan.status === 'Pending' || plan.status === 'Planned') && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: plan.id, itemId: row.item_id, plan_row: row }); }}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-rose-600 bg-white border border-rose-200 rounded-md hover:bg-rose-50 transition-all"
                                            title="Delete plan (available before production starts)"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                  );
                })
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
              <p className="text-sm text-gray-500">No production plans found</p>
            </div>
          ) : (
            data.map((row) => (
              <div key={row.item_id} onClick={() => goToPlan(row)} className="p-4 active:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{row.customer_name || '—'}</p>
                    <p className="text-xs text-blue-700 font-mono mt-0.5">{row.sales_order_no || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ml-2 ${STATUS_COLORS[row.status] || 'bg-gray-100 text-gray-700'}`}>{row.status}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2.5">
                  <span className="truncate">{row.article || '—'}</span>
                  {row.color && <><span className="text-gray-300">•</span><span>{row.color}</span></>}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-100">
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
