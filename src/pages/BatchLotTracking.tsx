import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Barcode, Package, Calendar, Factory, Layers, TrendingUp, TrendingDown,
  Search, Filter, ChevronLeft, ChevronRight, Plus, Edit2, Trash2,
  Eye, CheckCircle, XCircle, Loader2, RefreshCw, Download, ChevronsUpDown
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface Batch {
  id: number;
  batch_no: string;
  production_plan_id: number | null;
  sales_order_id: number | null;
  customer_id: number | null;
  order_no: string | null;
  article_code: string | null;
  article_name: string | null;
  production_date: string | null;
  stage: string;
  current_stage: string;
  total_receipt_qty: number;
  total_output_qty: number;
  yield_percent: number;
  status: string;
  remarks: string | null;
  customer_name: string | null;
  production_plan_no: string | null;
  sales_order_no: string | null;
  items?: BatchLineItem[];
}

interface BatchLineItem {
  id: number;
  batch_id: number;
  seq: number;
  customer_name: string | null;
  order_no: string | null;
  article_code: string | null;
  article_name: string | null;
  finish: string | null;
  color: string | null;
  receipt_qty: number;
  uom: string;
  output_qty: number;
  output_uom: string;
  status: string;
  remarks: string | null;
}

interface FilterOptions {
  stages: string[];
  statuses: string[];
  customers: { id: number; name: string; }[];
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  'In-Process': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  'On-Hold': 'bg-violet-100 text-violet-700',
  Cancelled: 'bg-rose-100 text-rose-600',
};

const STAGE_ICONS: Record<string, string> = {
  Tanning: '🧪',
  Finishing: '🎨',
  Dyeing: '🟢',
  'In-Process': '🔄',
  Completed: '✅',
};

export default function BatchLotTracking() {
  const navigate = useNavigate();
  const { canWrite, isReadOnly } = usePermission();
  const { id } = useParams();
  const isDetailView = !!id;

  // Data
  const [data, setData] = useState<Batch[]>([]);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    stages: ['Tanning', 'Finishing', 'Dyeing', 'In-Process', 'Completed'],
    statuses: ['Draft', 'In-Process', 'Completed', 'On-Hold', 'Cancelled'],
    customers: [],
  });

  // Scan barcode
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);

  // Active search params
  const [activeParams, setActiveParams] = useState<Record<string, string>>({});

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Stats
  const [stats, setStats] = useState<Record<string, number>>({});

  // Fetch filter options
  useEffect(() => {
    (async () => {
      try {
        const [customers] = await Promise.all([
          api<{ data: any[] }>('/customers?limit=500'),
        ]);
        setFilterOptions(prev => ({
          ...prev,
          customers: customers.data || [],
        }));
      } catch {}
    })();
  }, []);

  // Fetch stats
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: any }>('/batches/stats');
        setStats(res.data || {});
      } catch {}
    })();
  }, []);

  // Fetch batch by barcode
  const handleBarcodeScan = async () => {
    if (!barcode.trim()) return;
    try {
      setScanning(true);
      const res = await api<{ data: Batch }>(`/batches/barcode/${barcode}`);
      if (res.data) {
        setBatch(res.data);
        navigate(`/batch-lot-tracking/${res.data.id}`);
      } else {
        toast.error('Batch not found');
      }
    } catch {
      toast.error('Error fetching batch');
    } finally {
      setScanning(false);
    }
  };

  // Fetch data for list view
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
      const res = await api<{ data: Batch[]; total: number }>(`/batches?${params}`);
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

  // Fetch single batch for detail view
  const fetchBatch = useCallback(async (batchId: string) => {
    try {
      setLoading(true);
      const res = await api<{ data: Batch }>(`/batches/${batchId}`);
      setBatch(res.data || null);
    } catch {
      setBatch(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDetailView && id) {
      fetchBatch(id);
    } else {
      fetchData();
    }
  }, [isDetailView, id, fetchBatch, fetchData]);

  // Apply filters
  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (stage) params.stage = stage;
    if (customerId) params.customer_id = customerId;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    setActiveParams(params);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setStage('');
    setCustomerId('');
    setFromDate('');
    setToDate('');
    setActiveParams({});
    setCurrentPage(1);
  };

  // Handle barcode key press
  const handleBarcodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBarcodeScan();
    }
  };

  // Delete batch
  const handleDelete = async (batchId: number) => {
    try {
      await api('/batches/' + batchId, { method: 'DELETE' });
      toast.success('Batch deleted successfully');
      fetchData();
      setDeleteConfirm({ open: false, id: null });
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  // Bulk delete
  const handleBulkDelete = async (ids: number[]) => {
    try {
      await api('/batches/bulk-delete', { method: 'POST', body: { ids } });
      toast.success(`${ids.length} batches deleted successfully`);
      fetchData();
    } catch {
      toast.error('Failed to delete batches');
    }
  };

  // Update status
  const handleUpdateStatus = async (batchId: number, newStatus: string) => {
    try {
      await api('/batches/' + batchId, {
        method: 'PUT',
        body: { status: newStatus },
      });
      toast.success('Status updated successfully');
      if (isDetailView) {
        fetchBatch(id!);
      } else {
        fetchData();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Navigation
  const handleView = (batchId: number) => {
    navigate(`/batch-lot-tracking/${batchId}`);
  };

  const handleEdit = (batchId: number) => {
    navigate(`/batch-lot-tracking/${batchId}/edit`);
  };

  const handleCreate = () => {
    navigate('/batch-lot-tracking/new');
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

    if (!batch) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Batch not found</p>
          <button onClick={() => navigate('/batch-lot-tracking')} className="btn btn-primary mt-4">
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
                <Factory className="w-6 h-6 text-blue-600" />
                Batch / Lot Tracking
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View batch details and line items
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/batch-lot-tracking')} className="btn btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {!isReadOnly && (
                <button onClick={() => handleEdit(batch.id)} className="btn btn-outline">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Batch Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Barcode className="w-5 h-5 text-blue-600" />
            Batch / Lot Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Scan Barcode */}
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={handleBarcodeKeyPress}
                  placeholder="Scan barcode or enter manually"
                  className="flex-1 input input-bordered"
                />
                <button onClick={handleBarcodeScan} disabled={scanning} className="btn btn-primary">
                  {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Batch No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch No.</label>
              <input type="text" value={batch.batch_no || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>

            {/* Production Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Production Date</label>
              <input type="date" value={batch.production_date || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select value={batch.stage || ''} disabled className="input input-bordered bg-gray-50">
                <option value="">Select Stage</option>
                {filterOptions.stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Current Stage Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Stage Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{STAGE_ICONS[batch.current_stage] || '📦'}</div>
              <div className="text-sm font-medium text-blue-700 mt-1">Current Stage</div>
              <div className="text-xs text-blue-600">{batch.current_stage || 'N/A'}</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
              <div className="text-2xl font-bold text-cyan-600">📅</div>
              <div className="text-sm font-medium text-cyan-700 mt-1">Production Date</div>
              <div className="text-xs text-cyan-600">{batch.production_date || 'N/A'}</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">📦</div>
              <div className="text-sm font-medium text-purple-700 mt-1">Total Receipt Qty</div>
              <div className="text-xs text-purple-600">{batch.total_receipt_qty.toLocaleString()} {batch.uom || 'SQ.FT.'}</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
              <div className="text-2xl font-bold text-teal-600">📤</div>
              <div className="text-sm font-medium text-teal-700 mt-1">Total Output Qty</div>
              <div className="text-xs text-teal-600">{batch.total_output_qty.toLocaleString()} {batch.uom || 'SQ.FT.'}</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
              <div className="text-2xl font-bold text-rose-600">📊</div>
              <div className="text-sm font-medium text-rose-700 mt-1">Yield %</div>
              <div className="text-xs text-rose-600">{batch.yield_percent.toFixed(2)} %</div>
            </div>
          </div>
        </div>

        {/* Batch Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Batch / Lot Line Items
            </h2>
            <button className="btn btn-outline btn-sm">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-compact">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap">#</th>
                  <th className="whitespace-nowrap">Customer</th>
                  <th className="whitespace-nowrap">Order No.</th>
                  <th className="whitespace-nowrap">Article Code</th>
                  <th className="whitespace-nowrap">Article Name</th>
                  <th className="whitespace-nowrap">Finish</th>
                  <th className="whitespace-nowrap">Color</th>
                  <th className="whitespace-nowrap">Receipt Qty ({batch.uom || 'SQ.FT.'})</th>
                  <th className="whitespace-nowrap">Output Qty ({batch.uom || 'SQ.FT.'})</th>
                  <th className="whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {batch.items?.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td>{index + 1}</td>
                    <td>{item.customer_name || '-'}</td>
                    <td>{item.order_no || '-'}</td>
                    <td>{item.article_code || '-'}</td>
                    <td>{item.article_name || '-'}</td>
                    <td>{item.finish || '-'}</td>
                    <td>{item.color || '-'}</td>
                    <td className="text-right">{item.receipt_qty.toLocaleString()}</td>
                    <td className="text-right">{item.output_qty.toLocaleString()}</td>
                    <td><span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>{item.status}</span></td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-500 py-4">
                      No line items found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={7} className="text-right font-medium">Total Records:</td>
                  <td className="text-right font-bold">{batch.items?.length || 0}</td>
                  <td colSpan={2}></td>
                </tr>
                <tr>
                  <td colSpan={7} className="text-right font-medium">Total Receipt:</td>
                  <td className="text-right font-bold">{batch.items?.reduce((sum, item) => sum + (item.receipt_qty || 0), 0).toLocaleString()}</td>
                  <td colSpan={2}></td>
                </tr>
                <tr>
                  <td colSpan={7} className="text-right font-medium">Total Output:</td>
                  <td className="text-right font-bold">{batch.items?.reduce((sum, item) => sum + (item.output_qty || 0), 0).toLocaleString()}</td>
                  <td colSpan={2}></td>
                </tr>
                <tr>
                  <td colSpan={7} className="text-right font-medium">Yield %:</td>
                  <td colSpan={3} className="text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                      {batch.yield_percent.toFixed(2)} %
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-start">
          <button onClick={() => navigate('/batch-lot-tracking')} className="btn btn-secondary">
            <ChevronLeft className="w-4 h-4" /> Back
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
              <Factory className="w-6 h-6 text-blue-600" />
              Batch / Lot Tracking
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track production batches and their progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <button onClick={handleCreate} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Add Batch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Batches</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-amber-600">{stats.in_process || 0}</div>
          <div className="text-sm text-gray-500 mt-1">In Process</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{stats.completed || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-violet-600">{stats.on_hold || 0}</div>
          <div className="text-sm text-gray-500 mt-1">On Hold</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-rose-600">{stats.cancelled || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Cancelled</div>
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
                placeholder="Search by batch no, article, customer..."
                className="w-full input input-bordered pl-10"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input input-bordered">
              <option value="">All Statuses</option>
              {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="input input-bordered">
              <option value="">All Stages</option>
              {filterOptions.stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input input-bordered">
              <option value="">All Customers</option>
              {filterOptions.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <RefreshCw className="w-4 h-4" /> Clear
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
          <h2 className="text-lg font-semibold text-gray-900">Batches List</h2>
          <button onClick={fetchData} className="btn btn-ghost btn-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-compact">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap">#</th>
                <th className="whitespace-nowrap">Batch No.</th>
                <th className="whitespace-nowrap">Production Date</th>
                <th className="whitespace-nowrap">Stage / Current Stage</th>
                <th className="whitespace-nowrap">Article</th>
                <th className="whitespace-nowrap">Customer</th>
                <th className="whitespace-nowrap">Receipt Qty</th>
                <th className="whitespace-nowrap">Output Qty</th>
                <th className="whitespace-nowrap">Yield %</th>
                <th className="whitespace-nowrap">Status</th>
                <th className="whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center text-gray-500 py-8">
                    No batches found
                  </td>
                </tr>
              ) : (
                data.map((batch, index) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="font-medium text-blue-600">{batch.batch_no}</td>
                    <td>{batch.production_date || '-'}</td>
                    <td>
                      <div className="text-sm">
                        <span>{batch.stage}</span>
                        <br />
                        <span className="text-xs text-gray-500">{batch.current_stage}</span>
                      </div>
                    </td>
                    <td>{batch.article_code || '-'}</td>
                    <td>{batch.customer_name || '-'}</td>
                    <td className="text-right">{batch.total_receipt_qty?.toLocaleString() || '0'}</td>
                    <td className="text-right">{batch.total_output_qty?.toLocaleString() || '0'}</td>
                    <td className="text-right">{batch.yield_percent?.toFixed(2) || '0.00'} %</td>
                    <td><span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[batch.status] || 'bg-gray-100'}`}>{batch.status}</span></td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(batch.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <>
                            <button onClick={() => handleEdit(batch.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm({ open: true, id: batch.id })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
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
              Are you sure you want to delete this batch? This action cannot be undone.
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
