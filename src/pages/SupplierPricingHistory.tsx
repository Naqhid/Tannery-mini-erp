import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Truck, FileText, Search, Filter, ChevronLeft, ChevronRight, Plus, Edit2,
  Trash2, Eye, CheckCircle, XCircle, Loader2, RefreshCw, Download,
  ChevronsLeft, ChevronsRight, TrendingUp, TrendingDown, Calendar, Users,
  Receipt, FileBarChart, Clock
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface SupplierPricing {
  id: number;
  supplier_id: number;
  material_id: number;
  item_group: string | null;
  supplier_part_no: string | null;
  uom: string;
  unit_price: number;
  currency: string;
  min_order_qty: number;
  price_type: string;
  valid_from: string | null;
  valid_to: string | null;
  status: string;
  remarks: string | null;
  approved_by: number | null;
  approved_date: string | null;
  approval_notes: string | null;
  last_approved_price: number;
  last_approved_date: string | null;
  supplier_code: string;
  supplier_name: string;
  material_code: string;
  material_name: string;
  price_breaks?: PriceBreak[];
  attachments?: Attachment[];
  history?: PriceChangeHistory[];
}

interface PriceBreak {
  id: number;
  pricing_id: number;
  seq: number;
  from_qty: number;
  to_qty: number;
  uom: string;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  net_price: number;
}

interface Attachment {
  id: number;
  pricing_id: number;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number;
  uploaded_by: number | null;
  uploaded_on: string;
  remarks: string | null;
}

interface PriceChangeHistory {
  id: number;
  pricing_id: number | null;
  material_id: number;
  supplier_id: number;
  old_price: number;
  new_price: number;
  change_percent: number;
  change_type: string;
  change_reason: string | null;
  effective_from: string | null;
  effective_to: string | null;
  changed_by: number | null;
  changed_by_name: string | null;
}

interface FilterOptions {
  suppliers: { id: number; name: string; code: string; }[];
  materials: { id: number; name: string; code: string; }[];
  statuses: string[];
  itemGroups: string[];
  priceTypes: string[];
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-600',
  Expired: 'bg-violet-100 text-violet-700',
  Inactive: 'bg-gray-100 text-gray-600',
};

const CHANGE_TYPE_ICONS: Record<string, string> = {
  Increase: '📈',
  Decrease: '📉',
  'No Change': '➡️',
};

export default function SupplierPricingHistory() {
  const navigate = useNavigate();
  const { canWrite, isReadOnly } = usePermission();

  // Data
  const [data, setData] = useState<SupplierPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected supplier for filtering
  const [selectedSupplier, setSelectedSupplier] = useState<{ id: number; name: string; code: string; } | null>(null);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    suppliers: [],
    materials: [],
    statuses: ['Draft', 'Pending', 'Approved', 'Rejected', 'Expired', 'Inactive'],
    itemGroups: [],
    priceTypes: ['Purchase Price', 'Contract Price'],
  });

  // Active search params
  const [activeParams, setActiveParams] = useState<Record<string, string>>({});

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Stats
  const [stats, setStats] = useState<Record<string, number>>({});
  const [supplierStats, setSupplierStats] = useState<{ total: number; active: number; last_approved_date: string | null; price_change: string | null; } | null>(null);

  // Fetch filter options
  useEffect(() => {
    (async () => {
      try {
        const [suppliers, materials] = await Promise.all([
          api<{ data: any[] }>('/suppliers?limit=500'),
          api<{ data: any[] }>('/materials?limit=500'),
        ]);
        setFilterOptions(prev => ({
          ...prev,
          suppliers: suppliers.data || [],
          materials: materials.data || [],
        }));

        // Extract unique item groups from materials
        const groups = [...new Set((materials.data || []).map((m: any) => m.type || m.category).filter(Boolean))];
        setFilterOptions(prev => ({ ...prev, itemGroups: groups }));
      } catch {}
    })();
  }, []);

  // Fetch stats
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: any }>('/supplier-pricing/stats');
        setStats(res.data || {});
      } catch {}
    })();
  }, []);

  // Fetch supplier-specific stats
  const fetchSupplierStats = useCallback(async (supplierId: number) => {
    try {
      const res = await api<{ data: any }>(`/supplier-pricing/supplier/${supplierId}`);
      setSupplierStats({
        total: res.data?.length || 0,
        active: res.data?.filter((p: any) => p.status === 'Approved').length || 0,
        last_approved_date: res.data?.[0]?.last_approved_date || null,
        price_change: res.data?.[0]?.remarks || null,
      });
    } catch {}
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
      const res = await api<{ data: SupplierPricing[]; total: number }>(`/supplier-pricing?${params}`);
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters
  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (supplierId) params.supplier_id = supplierId;
    if (materialId) params.material_id = materialId;
    if (itemGroup) params.item_group = itemGroup;
    if (status) params.status = status;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    setActiveParams(params);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setSupplierId('');
    setMaterialId('');
    setItemGroup('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setActiveParams({});
    setCurrentPage(1);
  };

  // Delete pricing
  const handleDelete = async (pricingId: number) => {
    try {
      await api('/supplier-pricing/' + pricingId, { method: 'DELETE' });
      toast.success('Pricing deleted successfully');
      fetchData();
      setDeleteConfirm({ open: false, id: null });
    } catch {
      toast.error('Failed to delete pricing');
    }
  };

  // Bulk delete
  const handleBulkDelete = async (ids: number[]) => {
    try {
      await api('/supplier-pricing/bulk-delete', { method: 'POST', body: { ids } });
      toast.success(`${ids.length} pricings deleted successfully`);
      fetchData();
    } catch {
      toast.error('Failed to delete pricings');
    }
  };

  // Update status
  const handleUpdateStatus = async (pricingId: number, newStatus: string) => {
    try {
      await api('/supplier-pricing/' + pricingId, {
        method: 'PUT',
        body: { status: newStatus },
      });
      toast.success('Status updated successfully');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Navigation
  const handleView = (pricingId: number) => {
    navigate(`/supplier-pricing-history/${pricingId}`);
  };

  const handleEdit = (pricingId: number) => {
    navigate(`/supplier-pricing-history/${pricingId}/edit`);
  };

  const handleCreate = () => {
    navigate('/supplier-pricing-history/new');
  };

  const handleSupplierSelect = (supplier: { id: number; name: string; code: string; }) => {
    setSelectedSupplier(supplier);
    setSupplierId(String(supplier.id));
    fetchSupplierStats(supplier.id);
    setShowSupplierDetails(true);
  };

  // Get price trend for a material
  const getPriceTrend = async (materialId: number) => {
    try {
      const res = await api<{ data: PriceChangeHistory[] }>(`/supplier-pricing/trend/${materialId}`);
      return res.data || [];
    } catch {
      return [];
    }
  };

  // Render supplier details panel
  if (showSupplierDetails && selectedSupplier) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                Supplier Pricing History
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {selectedSupplier.name} ({selectedSupplier.code})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowSupplierDetails(false)} className="btn btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back to List
              </button>
              {!isReadOnly && (
                <button onClick={handleCreate} className="btn btn-primary">
                  <Plus className="w-4 h-4" /> Add New Price
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Supplier Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{selectedSupplier.code}</div>
              <div className="text-sm font-medium text-blue-700 mt-1">Supplier Code</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
              <div className="text-3xl font-bold text-cyan-600">{supplierStats?.total || 0}</div>
              <div className="text-sm font-medium text-cyan-700 mt-1">Total Items</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <div className="text-3xl font-bold text-emerald-600">{supplierStats?.active || 0}</div>
              <div className="text-sm font-medium text-emerald-700 mt-1">Active Items</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-xl font-bold text-purple-600">📅</div>
              <div className="text-sm font-medium text-purple-700 mt-1">Last Approved</div>
              <div className="text-xs text-purple-600">{supplierStats?.last_approved_date || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Pricing History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Pricing History
            </h2>
            <button onClick={fetchData} className="btn btn-ghost btn-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
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
                  <th className="whitespace-nowrap">Supplier Part No.</th>
                  <th className="whitespace-nowrap">Unit Price ({data[0]?.currency || 'INR'})</th>
                  <th className="whitespace-nowrap">Currency</th>
                  <th className="whitespace-nowrap">Valid From</th>
                  <th className="whitespace-nowrap">Valid To</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="whitespace-nowrap">Action</th>
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
                      No pricing records found for this supplier
                    </td>
                  </tr>
                ) : (
                  data.map((pricing, index) => (
                    <tr key={pricing.id} className="hover:bg-gray-50">
                      <td>{index + 1}</td>
                      <td className="font-medium">{pricing.material_code}</td>
                      <td>{pricing.material_name}</td>
                      <td>{pricing.uom}</td>
                      <td>{pricing.supplier_part_no || '-'}</td>
                      <td className="text-right">{pricing.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{pricing.currency}</td>
                      <td>{pricing.valid_from || '-'}</td>
                      <td>{pricing.valid_to || '-'}</td>
                      <td><span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[pricing.status] || 'bg-gray-100'}`}>{pricing.status}</span></td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleView(pricing.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isReadOnly && (
                            <>
                              <button onClick={() => handleEdit(pricing.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteConfirm({ open: true, id: pricing.id })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
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

        {/* Back button */}
        <div className="flex justify-start">
          <button onClick={() => setShowSupplierDetails(false)} className="btn btn-secondary">
            <ChevronLeft className="w-4 h-4" /> Back to All Suppliers
          </button>
        </div>
      </div>
    );
  }

  // Render list view (supplier selection)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              Supplier Pricing History
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage supplier pricing history with price comparisons and trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <button onClick={handleCreate} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Add New Price
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Pricings</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-amber-600">{stats.pending || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Pending</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{stats.approved || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Approved</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-rose-600">{stats.rejected || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Rejected</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-violet-600">{stats.expired || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Expired</div>
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
                placeholder="Search by supplier, material, part no..."
                className="w-full input input-bordered pl-10"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select value={supplierId} onChange={(e) => {
              setSupplierId(e.target.value);
              const supplier = filterOptions.suppliers.find(s => s.id === Number(e.target.value));
              if (supplier) {
                handleSupplierSelect(supplier);
              }
            }} className="input input-bordered">
              <option value="">All Suppliers</option>
              {filterOptions.suppliers.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} className="input input-bordered">
              <option value="">All Materials</option>
              {filterOptions.materials.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Group</label>
            <select value={itemGroup} onChange={(e) => setItemGroup(e.target.value)} className="input input-bordered">
              <option value="">All Groups</option>
              {filterOptions.itemGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input input-bordered">
              <option value="">All Statuses</option>
              {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
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
          <h2 className="text-lg font-semibold text-gray-900">Supplier Pricing List</h2>
          <button onClick={fetchData} className="btn btn-ghost btn-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-compact">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap">#</th>
                <th className="whitespace-nowrap">Supplier</th>
                <th className="whitespace-nowrap">Item Code</th>
                <th className="whitespace-nowrap">Item Description</th>
                <th className="whitespace-nowrap">UOM</th>
                <th className="whitespace-nowrap">Supplier Part No.</th>
                <th className="whitespace-nowrap">Unit Price ({data[0]?.currency || 'INR'})</th>
                <th className="whitespace-nowrap">Valid From</th>
                <th className="whitespace-nowrap">Valid To</th>
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
                    No pricing records found
                  </td>
                </tr>
              ) : (
                data.map((pricing, index) => (
                  <tr key={pricing.id} className="hover:bg-gray-50">
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="font-medium">{pricing.supplier_code} - {pricing.supplier_name}</td>
                    <td>{pricing.material_code}</td>
                    <td>{pricing.material_name}</td>
                    <td>{pricing.uom}</td>
                    <td>{pricing.supplier_part_no || '-'}</td>
                    <td className="text-right">{pricing.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{pricing.valid_from || '-'}</td>
                    <td>{pricing.valid_to || '-'}</td>
                    <td><span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[pricing.status] || 'bg-gray-100'}`}>{pricing.status}</span></td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(pricing.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <>
                            <button onClick={() => handleEdit(pricing.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm({ open: true, id: pricing.id })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
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
              Are you sure you want to delete this pricing record? This action cannot be undone.
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
