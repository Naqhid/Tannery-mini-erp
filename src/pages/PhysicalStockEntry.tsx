import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Package, Search, Filter, ChevronLeft, ChevronRight, Plus, Edit2,
  Trash2, Eye, CheckCircle, XCircle, Loader2, RefreshCw, Download,
  ChevronsLeft, ChevronsRight, Calendar, Warehouse, Clock, FileText,
  Upload
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface PhysicalStockEntry {
  id: number;
  entry_no: string;
  entry_date: string;
  stock_date: string;
  reference_no: string | null;
  godown_id: number | null;
  godown_name: string | null;
  location_rack: string | null;
  uom: string | null;
  from_item_code: string | null;
  to_item_code: string | null;
  remarks: string | null;
  status: string;
  created_by: number;
  created_by_name: string;
  total_items: number;
  matched_items: number;
  variance_items: number;
  total_variance_qty: number;
  total_variance_value: number;
  items?: PhysicalStockEntryItem[];
}

interface PhysicalStockEntryItem {
  id: number;
  entry_id: number;
  seq: number;
  item_code: string;
  item_description: string;
  uom: string;
  batch_no: string | null;
  location_rack: string | null;
  system_qty: number;
  physical_qty: number;
  variance_qty: number;
  variance_value: number;
  remarks: string | null;
  status: string;
}

interface FilterOptions {
  godowns: { id: number; name: string; code: string; }[];
  statuses: string[];
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Pending: 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Approved: 'bg-blue-100 text-blue-700',
  Rejected: 'bg-rose-100 text-rose-600',
};

const STATUS_BADGES: Record<string, string> = {
  Draft: 'Draft',
  Pending: 'Pending',
  Completed: 'Completed',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

export default function PhysicalStockEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canWrite, isReadOnly } = usePermission();
  const isDetailView = !!id;

  // Data
  const [data, setData] = useState<PhysicalStockEntry[]>([]);
  const [entry, setEntry] = useState<PhysicalStockEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [godownId, setGodownId] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    godowns: [],
    statuses: ['Draft', 'Pending', 'Completed', 'Approved', 'Rejected'],
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Active search params
  const [activeParams, setActiveParams] = useState<Record<string, string>>({});

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<{
    total_entries: number;
    matched_items: number;
    variance_items: number;
    total_variance_value: number;
  }>({ total_entries: 0, matched_items: 0, variance_items: 0, total_variance_value: 0 });

  // Fetch filter options
  useEffect(() => {
    (async () => {
      try {
        const godowns = await api<{ data: any[] }>('/warehouse-master?limit=500');
        setFilterOptions(prev => ({
          ...prev,
          godowns: godowns.data || [],
        }));
      } catch {}
    })();
  }, []);

  // Fetch stats
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: any }>('/physical-stock-entries/stats');
        setStats(res.data || {});
      } catch {}
    })();
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: any }>('/physical-stock-entries/dashboard-stats');
        setDashboardStats(res.data || {});
      } catch {}
    })();
  }, []);

  // Fetch data
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
      const res = await api<{ data: PhysicalStockEntry[]; total: number }>(`/physical-stock-entries?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / pageSize));
    } catch {
      setData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeParams]);

  // Fetch single entry for detail view
  const fetchEntry = useCallback(async (entryId: string) => {
    try {
      setLoading(true);
      const res = await api<{ data: PhysicalStockEntry }>(`/physical-stock-entries/${entryId}`);
      setEntry(res.data || null);
    } catch {
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDetailView && id) {
      fetchEntry(id);
    } else {
      fetchData();
    }
  }, [isDetailView, id, fetchEntry, fetchData]);

  // Apply filters
  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (godownId) params.godown_id = godownId;
    if (status) params.status = status;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    setActiveParams(params);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setGodownId('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setActiveParams({});
    setCurrentPage(1);
  };

  // Delete entry
  const handleDelete = async (entryId: number) => {
    try {
      await api(`/physical-stock-entries/${entryId}`, { method: 'DELETE' });
      toast.success('Stock entry deleted successfully');
      fetchData();
      setDeleteConfirm({ open: false, id: null });
    } catch {
      toast.error('Failed to delete stock entry');
    }
  };

  // Bulk delete
  const handleBulkDelete = async (ids: number[]) => {
    try {
      await api('/physical-stock-entries/bulk-delete', { method: 'POST', body: { ids } });
      toast.success(`${ids.length} stock entries deleted successfully`);
      fetchData();
    } catch {
      toast.error('Failed to delete stock entries');
    }
  };

  // Navigation
  const handleView = (entryId: number) => {
    navigate(`/physical-stock-entry/${entryId}`);
  };

  const handleEdit = (entryId: number) => {
    navigate(`/physical-stock-entry/${entryId}/edit`);
  };

  const handleCreate = () => {
    navigate('/physical-stock-entry/new');
  };

  // Get item system stock
  const getItemSystemStock = async (itemCode: string) => {
    try {
      const res = await api<{ data: { stock: number; } }>(`/physical-stock-entries/item-stock/${itemCode}`);
      return res.data?.stock || 0;
    } catch {
      return 0;
    }
  };

  // Export entry
  const handleExport = async (entryId: number) => {
    try {
      const res = await api(`/physical-stock-entries/export/${entryId}`);
      // In a real implementation, you would download the file
      toast.success('Entry exported successfully');
    } catch {
      toast.error('Failed to export entry');
    }
  };

  // Render detail view
  if (isDetailView) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!entry) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Physical Stock Entry not found</p>
          <button onClick={() => navigate('/physical-stock-entry')} className="btn btn-primary mt-4">
            Back to List
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Physical Stock Entry
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View physical stock entry details and variance analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/physical-stock-entry')} className="btn btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back to List
              </button>
              {!isReadOnly && (
                <button onClick={() => handleEdit(entry.id)} className="btn btn-outline">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
              <button onClick={() => handleExport(entry.id)} className="btn btn-outline">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Entry Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            1. Entry Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry No.</label>
              <input type="text" value={entry.entry_no || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry Date</label>
              <input type="text" value={entry.entry_date || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Date</label>
              <input type="text" value={entry.stock_date || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference No.</label>
              <input type="text" value={entry.reference_no || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Godown</label>
              <input type="text" value={entry.godown_name || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Rack</label>
              <input type="text" value={entry.location_rack || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
              <input type="text" value={entry.uom || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[entry.status] || 'bg-gray-100'}`}>
                {STATUS_BADGES[entry.status] || entry.status}
              </span>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea value={entry.remarks || ''} readOnly className="input input-bordered bg-gray-50 w-full resize-none" rows={2} />
            </div>
          </div>
        </div>

        {/* Stock Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              2. Stock Details
            </h2>
            <button onClick={() => handleExport(entry.id)} className="btn btn-ghost btn-sm">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button className="btn btn-primary btn-sm">
              <Upload className="w-4 h-4" /> Import from Excel
            </button>
            <button className="btn btn-outline btn-sm">
              <Download className="w-4 h-4" /> Download Template
            </button>
            <button className="btn btn-ghost btn-sm">
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-compact">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap">#</th>
                  <th className="whitespace-nowrap">Item Code</th>
                  <th className="whitespace-nowrap">Item Description</th>
                  <th className="whitespace-nowrap">UOM</th>
                  <th className="whitespace-nowrap">Batch No.</th>
                  <th className="whitespace-nowrap">Location / Rack</th>
                  <th className="whitespace-nowrap">System Qty</th>
                  <th className="whitespace-nowrap">Physical Qty</th>
                  <th className="whitespace-nowrap">Variance Qty</th>
                  <th className="whitespace-nowrap">Variance Value</th>
                  <th className="whitespace-nowrap">Remarks</th>
                  {!isReadOnly && <th className="whitespace-nowrap">Action</th>}
                </tr>
              </thead>
              <tbody>
                {entry.items?.length === 0 ? (
                  <tr>
                    <td colSpan={!isReadOnly ? 12 : 11} className="text-center text-gray-500 py-4">No items found</td>
                  </tr>
                ) : (
                  entry.items?.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td>{index + 1}</td>
                      <td className="font-medium">{item.item_code}</td>
                      <td>{item.item_description}</td>
                      <td>{item.uom}</td>
                      <td>{item.batch_no || '-'}</td>
                      <td>{item.location_rack || '-'}</td>
                      <td className="text-right">{item.system_qty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>
                        <input
                          type="number"
                          value={item.physical_qty}
                          readOnly
                          className="input input-bordered input-sm w-24 text-right"
                        />
                      </td>
                      <td className={`text-right font-medium ${
                        item.variance_qty >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.variance_qty >= 0 ? '+' : ''}{item.variance_qty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`text-right font-medium ${
                        item.variance_value >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.variance_value >= 0 ? '+' : ''}{item.variance_value.toFixed(2)}
                      </td>
                      <td>{item.remarks || '-'}</td>
                      {!isReadOnly && (
                        <td className="whitespace-nowrap">
                          <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={6} className="text-right font-medium">Total Items:</td>
                  <td className="text-center font-bold">{entry.total_items}</td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-right font-medium">Matched Items:</td>
                  <td className="text-center">{entry.matched_items}</td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-right font-medium">Variance Items:</td>
                  <td className="text-center">{entry.variance_items}</td>
                  <td colSpan={4}></td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-right font-medium">Total Variance Value:</td>
                  <td colSpan={5} className="text-right">
                    <span className={`font-bold ${entry.total_variance_value >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {entry.total_variance_value >= 0 ? '+' : ''}{entry.total_variance_value.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {!isReadOnly && (
            <button onClick={handleCreate} className="btn btn-primary btn-sm mt-4">
              <Plus className="w-4 h-4" /> Add Row
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            3. Summary
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{entry.total_items || 0}</div>
              <div className="text-sm font-medium text-blue-700 mt-1">Total Items</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <div className="text-3xl font-bold text-emerald-600">{entry.matched_items || 0}</div>
              <div className="text-sm font-medium text-emerald-700 mt-1">Matched Items</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
              <div className="text-3xl font-bold text-rose-600">{entry.variance_items || 0}</div>
              <div className="text-sm font-medium text-rose-700 mt-1">Variance Items</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <div className="text-3xl font-bold text-amber-600">{entry.total_variance_value.toFixed(2)}</div>
              <div className="text-sm font-medium text-amber-700 mt-1">Total Variance Value</div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Prices are as per approved supplier agreements.</li>
              <li>• Current Price is effective from 16-05-2024</li>
              <li>• Review date is monthly unless specified.</li>
            </ul>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-start">
          <button onClick={() => navigate('/physical-stock-entry')} className="btn btn-secondary">
            <ChevronLeft className="w-4 h-4" /> Back to List
          </button>
        </div>
      </div>
    );
  }

  // Render list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Physical Stock Entry
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track physical inventory counting with variance tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <button onClick={handleCreate} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Add New Entry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total || dashboardStats.total_entries || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Entries</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{dashboardStats.matched_items || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Matched Items</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-rose-600">{dashboardStats.variance_items || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Variance Items</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-amber-600">{dashboardStats.total_variance_value.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-1">Total Variance Value</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-gray-500 mt-1">This Month</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by entry no, reference, item..."
                className="w-full input input-bordered pl-10"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Godown</label>
            <select value={godownId} onChange={(e) => setGodownId(e.target.value)} className="input input-bordered">
              <option value="">All Godowns</option>
              {filterOptions.godowns.map(g => (
                <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input input-bordered">
              <option value="">All Statuses</option>
              {filterOptions.statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input input-bordered" />
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input input-bordered" />
          </div>

          <div className="flex gap-2 self-end">
            <button onClick={clearFilters} className="btn btn-ghost">
              Clear
            </button>
            <button onClick={applyFilters} className="btn btn-primary">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4">
          <button onClick={() => setPageSize(10)} className={`px-3 py-1 text-sm rounded-md ${pageSize === 10 ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>10 / Page</button>
          <button onClick={() => setPageSize(25)} className={`px-3 py-1 text-sm rounded-md ${pageSize === 25 ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>25 / Page</button>
          <button onClick={() => setPageSize(50)} className={`px-3 py-1 text-sm rounded-md ${pageSize === 50 ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>50 / Page</button>
          <button onClick={() => setPageSize(100)} className={`px-3 py-1 text-sm rounded-md ${pageSize === 100 ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>100 / Page</button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Physical Stock Entry List</h2>
          <button onClick={fetchData} className="btn btn-ghost btn-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-compact">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap">#</th>
                <th className="whitespace-nowrap">Entry No.</th>
                <th className="whitespace-nowrap">Entry Date</th>
                <th className="whitespace-nowrap">Stock Date</th>
                <th className="whitespace-nowrap">Godown</th>
                <th className="whitespace-nowrap">Location / Rack</th>
                <th className="whitespace-nowrap">Total Items</th>
                <th className="whitespace-nowrap">Matched Items</th>
                <th className="whitespace-nowrap">Variance Items</th>
                <th className="whitespace-nowrap">Total Variance Value</th>
                <th className="whitespace-nowrap">Status</th>
                <th className="whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-gray-500 py-8">
                    No physical stock entries found
                  </td>
                </tr>
              ) : (
                data.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="font-medium text-blue-600">{entry.entry_no}</td>
                    <td>{entry.entry_date}</td>
                    <td>{entry.stock_date}</td>
                    <td>{entry.godown_name || '-'}</td>
                    <td>{entry.location_rack || '-'}</td>
                    <td className="text-right">{entry.total_items}</td>
                    <td className="text-right text-emerald-600 font-medium">{entry.matched_items}</td>
                    <td className="text-right text-rose-600 font-medium">{entry.variance_items}</td>
                    <td className={`text-right font-medium ${
                      entry.total_variance_value >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {entry.total_variance_value >= 0 ? '+' : ''}{entry.total_variance_value.toFixed(2)}
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[entry.status] || 'bg-gray-100'}`}>
                        {STATUS_BADGES[entry.status] || entry.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(entry.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <>
                            <button onClick={() => handleEdit(entry.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm({ open: true, id: entry.id })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="btn btn-ghost btn-sm">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-ghost btn-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage === totalPages} className="btn btn-ghost btn-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPage(totalPages || 1)} disabled={currentPage === totalPages} className="btn btn-ghost btn-sm">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this physical stock entry? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm({ open: false, id: null })} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => deleteConfirm.id && handleDelete(deleteConfirm.id)} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
