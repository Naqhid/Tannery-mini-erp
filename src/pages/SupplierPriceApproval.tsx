import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Truck, Search, Filter, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  Loader2, RefreshCw, Calendar, TrendingUp, TrendingDown, Eye, FileText,
  ChevronsLeft, ChevronsRight, Clock, User
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface PriceApprovalRequest {
  id: number;
  request_no: string;
  request_date: string;
  requested_by: number;
  requested_by_name: string;
  department: string;
  status: string;
  remarks: string | null;
  items?: ApprovalItem[];
  total_items: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
}

interface ApprovalItem {
  id: number;
  request_id: number;
  seq: number;
  supplier_id: number;
  material_id: number;
  item_code: string;
  item_description: string;
  uom: string;
  current_price: number;
  requested_price: number;
  change_percent: number;
  change_amount: number;
  effective_from: string;
  status: string;
  supplier_name: string;
  material_name: string;
  remarks: string | null;
}

interface FilterOptions {
  suppliers: { id: number; name: string; code: string; }[];
  statuses: string[];
  dateRanges: string[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-600',
  Under_Review: 'bg-blue-100 text-blue-700',
};

const STATUS_BADGES: Record<string, string> = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Under_Review: 'Under Review',
};

export default function SupplierPriceApproval() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canWrite, isReadOnly } = usePermission();
  const isDetailView = !!id;

  // Data
  const [data, setData] = useState<PriceApprovalRequest[]>([]);
  const [request, setRequest] = useState<PriceApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('Pending');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    suppliers: [],
    statuses: ['Pending', 'Approved', 'Rejected', 'Under_Review'],
    dateRanges: ['Today', 'This Week', 'This Month', 'Last Month', 'All'],
  });

  // Selected items for bulk action
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Active search params
  const [activeParams, setActiveParams] = useState<Record<string, string>>({
    status: 'Pending',
  });

  // Stats
  const [stats, setStats] = useState<Record<string, number>>({});

  // Approval action
  const [approvalAction, setApprovalAction] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    items: ApprovalItem[];
  }>({ open: false, type: null, items: [] });

  // Fetch filter options
  useEffect(() => {
    (async () => {
      try {
        const suppliers = await api<{ data: any[] }>('/suppliers?limit=500');
        setFilterOptions(prev => ({
          ...prev,
          suppliers: suppliers.data || [],
        }));
      } catch {}
    })();
  }, []);

  // Fetch stats
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: any }>('/price-approvals/stats');
        setStats(res.data || {});
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
      const res = await api<{ data: PriceApprovalRequest[]; total: number }>(`/price-approvals?${params}`);
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

  // Fetch single request for detail view
  const fetchRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      const res = await api<{ data: PriceApprovalRequest }>(`/price-approvals/${requestId}`);
      setRequest(res.data || null);
    } catch {
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDetailView && id) {
      fetchRequest(id);
    } else {
      fetchData();
    }
  }, [isDetailView, id, fetchRequest, fetchData]);

  // Apply filters
  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (supplierId) params.supplier_id = supplierId;
    if (status) params.status = status;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    setActiveParams(params);
    setCurrentPage(1);
    setSelectAll(false);
    setSelectedItems([]);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setSupplierId('');
    setFromDate('');
    setToDate('');
    setActiveParams({ status: 'Pending' });
    setCurrentPage(1);
    setSelectAll(false);
    setSelectedItems([]);
  };

  // Toggle select item
  const toggleSelectItem = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(d => d.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select at least one request');
      return;
    }
    
    try {
      await api('/price-approvals/bulk-approve', {
        method: 'POST',
        body: { ids: selectedItems },
      });
      toast.success(`${selectedItems.length} request(s) approved successfully`);
      fetchData();
      setSelectedItems([]);
      setSelectAll(false);
    } catch {
      toast.error('Failed to approve selected requests');
    }
  };

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select at least one request');
      return;
    }
    
    try {
      await api('/price-approvals/bulk-reject', {
        method: 'POST',
        body: { ids: selectedItems },
      });
      toast.success(`${selectedItems.length} request(s) rejected successfully`);
      fetchData();
      setSelectedItems([]);
      setSelectAll(false);
    } catch {
      toast.error('Failed to reject selected requests');
    }
  };

  // Open approval action dialog
  const openApprovalDialog = (type: 'approve' | 'reject') => {
    const items = data.filter(d => selectedItems.includes(d.id)).flatMap(d => d.items || []);
    if (items.length === 0) {
      toast.warning('Please select at least one request with items');
      return;
    }
    setApprovalAction({ open: true, type, items });
  };

  // Close approval action dialog
  const closeApprovalDialog = () => {
    setApprovalAction({ open: false, type: null, items: [] });
  };

  // Handle approve/reject action
  const handleApprovalAction = async (action: 'approve' | 'reject', notes: string) => {
    try {
      const endpoint = action === 'approve' ? 'approve-selected' : 'reject-selected';
      const requestIds = data.filter(d => selectedItems.includes(d.id)).map(d => d.id);
      
      await api(`/price-approvals/${requestIds[0]}/${endpoint}`, {
        method: 'PATCH',
        body: { item_ids: selectedItems, notes },
      });
      
      toast.success(`Selected items ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchData();
      closeApprovalDialog();
      setSelectedItems([]);
      setSelectAll(false);
    } catch {
      toast.error(`Failed to ${action} selected items`);
    }
  };

  // Navigation
  const handleView = (requestId: number) => {
    navigate(`/supplier-price-approval/${requestId}`);
  };

  // Get status count for badge
  const getStatusCount = (status: string) => {
    return data.filter(d => d.status === status).length;
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

    if (!request) {
      return (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Approval request not found</p>
          <button onClick={() => navigate('/supplier-price-approval')} className="btn btn-primary mt-4">
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
                <FileText className="w-6 h-6 text-blue-600" />
                Supplier Price Approval
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and process price approval requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/supplier-price-approval')} className="btn btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back to List
              </button>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Request Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request No.</label>
              <input type="text" value={request.request_no || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Date</label>
              <input type="text" value={request.request_date || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
              <input type="text" value={request.requested_by_name || ''} readOnly className="input input-bordered bg-gray-50" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea value={request.remarks || ''} readOnly className="input input-bordered bg-gray-50 w-full resize-none" rows={2} />
            </div>
          </div>
        </div>

        {/* Item & Supplier Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            2. Item & Supplier Details
          </h2>
          
          <div className="overflow-x-auto">
            <table className="table table-compact">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap">#</th>
                  <th className="whitespace-nowrap">Supplier</th>
                  <th className="whitespace-nowrap">Item Code</th>
                  <th className="whitespace-nowrap">Item Description</th>
                  <th className="whitespace-nowrap">UOM</th>
                  <th className="whitespace-nowrap">Current Price ({request.items?.[0]?.uom || 'INR'})</th>
                  <th className="whitespace-nowrap">Requested Price ({request.items?.[0]?.uom || 'INR'})</th>
                  <th className="whitespace-nowrap">Change %</th>
                  <th className="whitespace-nowrap">Effective From</th>
                  <th className="whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {request.items?.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-500 py-4">No items found</td>
                  </tr>
                ) : (
                  request.items?.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td>{index + 1}</td>
                      <td>{item.supplier_name}</td>
                      <td>{item.item_code}</td>
                      <td>{item.item_description}</td>
                      <td>{item.uom}</td>
                      <td className="text-right">{item.current_price.toFixed(2)}</td>
                      <td className="text-right">{item.requested_price.toFixed(2)}</td>
                      <td className={`text-right font-medium ${
                        item.change_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.change_percent >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                      </td>
                      <td>{item.effective_from}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>
                          {STATUS_BADGES[item.status] || item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={9} className="text-right font-medium">Total Items:</td>
                  <td className="text-center font-bold">{request.total_items}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Price Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            3. Price Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="table table-compact">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap">Description</th>
                  <th className="whitespace-nowrap">Price ({request.items?.[0]?.uom || 'INR'})</th>
                  <th className="whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Last Approved Price</td>
                  <td className="text-right">{request.items?.[0]?.current_price.toFixed(2)}</td>
                  <td>{new Date(request.items?.[0]?.effective_from || '').toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td>Requested Price</td>
                  <td className="text-right">{request.items?.[0]?.requested_price.toFixed(2)}</td>
                  <td>{request.request_date}</td>
                </tr>
                <tr className="bg-gray-50 font-medium">
                  <td>Difference</td>
                  <td className={`text-right ${
                    (request.items?.[0]?.requested_price || 0) >= (request.items?.[0]?.current_price || 0)
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}>
                    {((request.items?.[0]?.requested_price || 0) - (request.items?.[0]?.current_price || 0)).toFixed(2)} 
                    ({(request.items?.[0]?.change_percent || 0).toFixed(2)}%)
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Action */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Approval Action
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center ${
                  !isReadOnly ? 'cursor-pointer hover:bg-emerald-200' : 'cursor-not-allowed opacity-50'
                }`}>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-emerald-700">Approve</div>
                  <div className="text-sm text-gray-500">Set as new approved price effective from date</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center ${
                  !isReadOnly ? 'cursor-pointer hover:bg-rose-200' : 'cursor-not-allowed opacity-50'
                }`}>
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <div className="font-medium text-rose-700">Reject</div>
                  <div className="text-sm text-gray-500">Enter reason for rejection</div>
                </div>
              </div>
            </div>
          </div>
          
          {!isReadOnly && (
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => navigate('/supplier-price-approval')} className="btn btn-secondary">
                Cancel
              </button>
              <button className="btn btn-success">
                Save Approval
              </button>
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="flex justify-start">
          <button onClick={() => navigate('/supplier-price-approval')} className="btn btn-secondary">
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
              <Truck className="w-6 h-6 text-blue-600" />
              Supplier Price Approval
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Approve or reject price change requests from suppliers
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.pending || getStatusCount('Pending')}</div>
          <div className="text-sm text-gray-500 mt-1">Pending Approval</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{stats.approved || getStatusCount('Approved')}</div>
          <div className="text-sm text-gray-500 mt-1">Approved</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-rose-600">{stats.rejected || getStatusCount('Rejected')}</div>
          <div className="text-sm text-gray-500 mt-1">Rejected</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.total || data.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Requests</div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Pending Price Approvals
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">
              Clear
            </button>
            <button onClick={applyFilters} className="btn btn-primary btn-sm">
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input input-bordered">
              <option value="">All Suppliers</option>
              {filterOptions.suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Group</label>
            <select className="input input-bordered">
              <option value="">All</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Raw Materials">Raw Materials</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select className="input input-bordered">
              <option value="">All Items</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requested From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input input-bordered" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requested To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input input-bordered" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input input-bordered">
              <option value="">All</option>
              {filterOptions.statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedItems.length} item selected
          </span>
          <button onClick={toggleSelectAll} className="btn btn-ghost btn-xs">
            {selectAll ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && !isReadOnly && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => openApprovalDialog('approve')} className="btn btn-success btn-sm">
                <CheckCircle className="w-4 h-4" /> Approve Selected
              </button>
              <button onClick={() => openApprovalDialog('reject')} className="btn btn-danger btn-sm">
                <XCircle className="w-4 h-4" /> Reject Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Price Approval Requests</h2>
          <button onClick={fetchData} className="btn btn-ghost btn-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-compact">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="checkbox checkbox-sm"
                    disabled={isReadOnly}
                  />
                </th>
                <th className="whitespace-nowrap">Req. No.</th>
                <th className="whitespace-nowrap">Request Date</th>
                <th className="whitespace-nowrap">Supplier</th>
                <th className="whitespace-nowrap">Item Code</th>
                <th className="whitespace-nowrap">Item Description</th>
                <th className="whitespace-nowrap">UOM</th>
                <th className="whitespace-nowrap">Current Price (INR)</th>
                <th className="whitespace-nowrap">Requested Price (INR)</th>
                <th className="whitespace-nowrap">Change %</th>
                <th className="whitespace-nowrap">Effective From</th>
                <th className="whitespace-nowrap">Status</th>
                <th className="whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center text-gray-500 py-8">
                    No approval requests found
                  </td>
                </tr>
              ) : (
                data.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(req.id)}
                        onChange={() => toggleSelectItem(req.id)}
                        className="checkbox checkbox-sm"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="font-medium text-blue-600">{req.request_no}</td>
                    <td>{req.request_date}</td>
                    <td>{req.requested_by_name}</td>
                    <td>{req.items?.[0]?.item_code || '-'}</td>
                    <td>{req.items?.[0]?.item_description || '-'}</td>
                    <td>{req.items?.[0]?.uom || '-'}</td>
                    <td className="text-right">{req.items?.[0]?.current_price.toFixed(2) || '0.00'}</td>
                    <td className="text-right">{req.items?.[0]?.requested_price.toFixed(2) || '0.00'}</td>
                    <td className={`text-right font-medium ${
                      (req.items?.[0]?.change_percent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {(req.items?.[0]?.change_percent || 0) >= 0 ? '+' : ''}{(req.items?.[0]?.change_percent || 0).toFixed(2)}%
                    </td>
                    <td>{req.items?.[0]?.effective_from || '-'}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[req.status] || 'bg-gray-100'}`}>
                        {STATUS_BADGES[req.status] || req.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <button onClick={() => handleView(req.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* Approval Action Dialog */}
      {approvalAction.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {approvalAction.type === 'approve' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Approve Selected Items
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    Reject Selected Items
                  </>
                )}
              </h3>
              <button onClick={closeApprovalDialog} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  {approvalAction.type === 'approve'
                    ? 'Set as new approved price effective from date'
                    : 'Enter reason for rejection'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {approvalAction.type === 'approve' ? 'Approval Notes' : 'Rejection Reason'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  placeholder={approvalAction.type === 'approve' ? 'Enter approval notes' : 'Enter reason for rejection'}
                  className="input input-bordered w-full resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={closeApprovalDialog} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleApprovalAction(approvalAction.type!, '')}
                className={`btn ${approvalAction.type === 'approve' ? 'btn-success' : 'btn-danger'}`}
              >
                {approvalAction.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
