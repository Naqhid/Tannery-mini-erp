import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Search, Loader2, X, Check, XCircle, Eye, ChevronLeft, ChevronRight,
  Calendar, CheckCircle2, Clock, TrendingUp, FileText, Save
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface ApprovalRequest {
  id: number;
  request_no: string;
  request_date: string;
  supplier_code: string;
  supplier_name: string;
  material_code: string;
  material_name: string;
  uom: string;
  current_price: number;
  requested_price: number;
  change_percent: number;
  effective_from: string;
  status: string;
  requested_by: string;
  remarks: string | null;
  supplier_part_no: string | null;
  item_group: string | null;
}

interface PriceTrendPoint {
  month: string;
  price: number;
}

interface FilterState {
  supplier: string;
  itemGroup: string;
  item: string;
  fromDate: string;
  toDate: string;
  status: string;
}

export default function SupplierPriceApproval() {
  const { isReadOnly } = usePermission();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApprovalRequest[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    supplier: '', itemGroup: '', item: '', fromDate: '', toDate: '', status: '',
  });

  // Mock suppliers/groups for dropdowns
  const [suppliers, setSuppliers] = useState<{ id: number; code: string; name: string }[]>([]);

  // Price trend data
  const [priceTrend] = useState<PriceTrendPoint[]>([
    { month: 'Aug', price: 172 },
    { month: 'Sep', price: 175 },
    { month: 'Oct', price: 178 },
    { month: 'Nov', price: 180 },
    { month: 'Dec', price: 180 },
    { month: 'Jan', price: 185 },
  ]);

  // Mock data for pending approvals
  const mockData: ApprovalRequest[] = [
    { id: 1, request_no: 'PRA-2025-001', request_date: '15-Jan-2025', supplier_code: 'SUP-001', supplier_name: 'Balaji Chemicals Pvt Ltd', material_code: 'RM-CHR-001', material_name: 'Chrome Powder - Basic Grade', uom: 'KG', current_price: 185.00, requested_price: 180.60, change_percent: -2.38, effective_from: '01-Feb-2025', status: 'Pending', requested_by: 'Rajesh Kumar', remarks: 'Annual contract renewal - price reduction negotiated', supplier_part_no: 'SP-1001', item_group: 'Chemicals' },
    { id: 2, request_no: 'PRA-2025-002', request_date: '14-Jan-2025', supplier_code: 'SUP-002', supplier_name: 'Krishna Dyes & Chemicals', material_code: 'RM-DYE-001', material_name: 'Leather Dye - Black', uom: 'LTR', current_price: 420.00, requested_price: 455.00, change_percent: 8.33, effective_from: '01-Feb-2025', status: 'Pending', requested_by: 'Suresh Patel', remarks: 'Raw material cost increase from supplier', supplier_part_no: 'SP-3001', item_group: 'Dyes' },
    { id: 3, request_no: 'PRA-2025-003', request_date: '13-Jan-2025', supplier_code: 'SUP-001', supplier_name: 'Balaji Chemicals Pvt Ltd', material_code: 'RM-TAN-001', material_name: 'Tanning Agent - Vegetable', uom: 'LTR', current_price: 320.00, requested_price: 310.00, change_percent: -3.13, effective_from: '01-Feb-2025', status: 'Pending', requested_by: 'Rajesh Kumar', remarks: 'Bulk order discount applied', supplier_part_no: 'SP-2001', item_group: 'Chemicals' },
    { id: 4, request_no: 'PRA-2025-004', request_date: '12-Jan-2025', supplier_code: 'SUP-003', supplier_name: 'Modi Leather Supplies', material_code: 'RM-FAT-001', material_name: 'Fat Liquor - Synthetic', uom: 'KG', current_price: 280.00, requested_price: 295.00, change_percent: 5.36, effective_from: '01-Feb-2025', status: 'Pending', requested_by: 'Admin', remarks: null, supplier_part_no: 'SP-4001', item_group: 'Chemicals' },
    { id: 5, request_no: 'PRA-2025-005', request_date: '11-Jan-2025', supplier_code: 'SUP-002', supplier_name: 'Krishna Dyes & Chemicals', material_code: 'RM-DYE-002', material_name: 'Leather Dye - Brown', uom: 'LTR', current_price: 400.00, requested_price: 420.00, change_percent: 5.00, effective_from: '01-Feb-2025', status: 'Pending', requested_by: 'Suresh Patel', remarks: 'Quarterly price revision', supplier_part_no: 'SP-3002', item_group: 'Dyes' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: any[] }>('/suppliers?limit=500');
        setSuppliers(res.data || []);
      } catch { /* silent */ }
    })();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.supplier) params.set('supplier_id', filters.supplier);
      if (filters.itemGroup) params.set('item_group', filters.itemGroup);
      if (filters.item) params.set('search', filters.item);
      if (filters.fromDate) params.set('from_date', filters.fromDate);
      if (filters.toDate) params.set('to_date', filters.toDate);
      if (filters.status) params.set('status', filters.status);
      params.set('status', filters.status || 'Pending');

      const res = await api<{ data: ApprovalRequest[] }>(`/price-approvals?${params}`);
      setData(res.data || mockData);
    } catch {
      setData(mockData);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) setSelectedIds([]);
    else setSelectedIds(data.map(d => d.id));
  };

  const handleRowClick = (req: ApprovalRequest) => {
    setSelectedRequest(req);
    setSelectedIds([req.id]);
    setApprovalAction('approve');
    setRejectionReason('');
  };

  const clearFilters = () => {
    setFilters({ supplier: '', itemGroup: '', item: '', fromDate: '', toDate: '', status: '' });
  };

  const handleSearch = () => { fetchData(); };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setSaving(true);
    try {
      await api(`/price-approvals/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: approvalAction === 'approve' ? 'Approved' : 'Rejected',
          rejection_reason: rejectionReason || null,
        }),
      });
      toast.success(approvalAction === 'approve' ? 'Price approved successfully!' : 'Price rejected');
      setSelectedRequest(null);
      fetchData();
    } catch (err) {
      toast.error('Failed: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      await api('/price-approvals/bulk-approve', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds }),
      });
      toast.success(`${selectedIds.length} prices approved!`);
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Failed to approve');
    } finally { setSaving(false); }
  };

  const handleBulkReject = async () => {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      await api('/price-approvals/bulk-reject', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds }),
      });
      toast.success(`${selectedIds.length} prices rejected`);
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Failed to reject');
    } finally { setSaving(false); }
  };

  // SVG price trend chart
  const renderPriceTrendChart = () => {
    const width = 280;
    const height = 120;
    const padding = { top: 10, right: 10, bottom: 25, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const prices = priceTrend.map(p => p.price);
    const minP = Math.min(...prices) - 5;
    const maxP = Math.max(...prices) + 5;

    const points = priceTrend.map((p, i) => ({
      x: padding.left + (i / (priceTrend.length - 1)) * chartW,
      y: padding.top + chartH - ((p.price - minP) / (maxP - minP)) * chartH,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    return (
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + chartH - pct * chartH;
          const val = Math.round(minP + pct * (maxP - minP));
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padding.left - 5} y={y + 3} textAnchor="end" className="text-[9px] fill-gray-400">{val}</text>
            </g>
          );
        })}
        {/* Area */}
        <path d={areaPath} fill="url(#gradient)" opacity="0.3" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
        ))}
        {/* X labels */}
        {priceTrend.map((pt, i) => (
          <text key={i} x={points[i].x} y={height - 5} textAnchor="middle" className="text-[9px] fill-gray-500">{pt.month}</text>
        ))}
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="space-y-5">
      {/* Pending Price Approvals - Top Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold text-blue-700">Pending Price Approvals</h1>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Supplier</label>
              <select value={filters.supplier} onChange={e => setFilters(p => ({ ...p, supplier: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">All Suppliers</option>
                {suppliers.map(s => <option key={s.id} value={String(s.id)}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Item Group</label>
              <select value={filters.itemGroup} onChange={e => setFilters(p => ({ ...p, itemGroup: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">All Groups</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Dyes">Dyes</option>
                <option value="Raw Materials">Raw Materials</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Item</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={filters.item} onChange={e => setFilters(p => ({ ...p, item: e.target.value }))} placeholder="Search item..." className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Requested From</label>
              <input type="date" value={filters.fromDate} onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Requested To</label>
              <input type="date" value={filters.toDate} onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <X className="w-4 h-4" /> Clear
              </button>
              <button onClick={handleSearch} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selectedIds.length === data.length && data.length > 0} onChange={toggleSelectAll} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Req. No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Request Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Supplier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">UOM</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Current Price (INR)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Requested Price (INR)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Change %</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Effective From</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-gray-500 mt-2">Loading approvals...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-gray-500">No pending approvals found</td>
                </tr>
              ) : (
                data.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req)}
                    className={`cursor-pointer transition-colors ${selectedRequest?.id === req.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.includes(req.id)} onChange={() => toggleSelect(req.id)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-600">{req.request_no}</td>
                    <td className="px-4 py-3 text-gray-600">{req.request_date}</td>
                    <td className="px-4 py-3 text-gray-700">{req.supplier_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{req.material_code}</td>
                    <td className="px-4 py-3 text-gray-700">{req.material_name}</td>
                    <td className="px-4 py-3 text-gray-600">{req.uom}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{req.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{req.requested_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className={`px-4 py-3 text-right font-medium ${req.change_percent < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {req.change_percent > 0 ? '+' : ''}{req.change_percent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-gray-600">{req.effective_from}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{req.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Selection actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">{selectedIds.length} Item{selectedIds.length !== 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <>
                <button onClick={handleBulkApprove} disabled={selectedIds.length === 0 || saving} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  <Check className="w-4 h-4" /> Approve Selected
                </button>
                <button onClick={handleBulkReject} disabled={selectedIds.length === 0 || saving} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject Selected
                </button>
              </>
            )}
            <button onClick={() => { if (selectedRequest) handleRowClick(selectedRequest); }} disabled={!selectedRequest} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              <Eye className="w-4 h-4" /> View Details
            </button>
          </div>
        </div>
      </div>

      {/* Price Request Details - Bottom Section */}
      {selectedRequest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Title + Badge */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900">Price Request Details</h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending Approval</span>
          </div>

          {/* Approval Workflow Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-0">
              {/* Step 1: Requested */}
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-700 mt-1">Requested</span>
                </div>
                <div className="w-24 h-0.5 bg-blue-600 mx-2" />
              </div>
              {/* Step 2: Under Review */}
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-amber-700 mt-1">Under Review</span>
                </div>
                <div className="w-24 h-0.5 bg-gray-300 mx-2" />
              </div>
              {/* Step 3: Approved/Rejected */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Check className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 mt-1">Approved / Rejected</span>
              </div>
            </div>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left: Request Information */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">1. Request Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Request No.</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.request_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Request Date</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.request_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Requested By</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.requested_by}</span>
                </div>
                {selectedRequest.remarks && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500 block mb-1">Remarks</span>
                    <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100">{selectedRequest.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Item & Supplier Details */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">2. Item & Supplier Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Supplier</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.supplier_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Supplier Part No.</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.supplier_part_no || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Item Code</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.material_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Item Description</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.material_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Item Group</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.item_group || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">UOM</span>
                  <span className="text-xs font-medium text-gray-900">{selectedRequest.uom}</span>
                </div>
              </div>
            </div>

            {/* Right: Price Trend + Price Comparison */}
            <div className="space-y-4">
              {/* Price Trend */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">4. Price Trend (Last 6 Months)</h3>
                {renderPriceTrendChart()}
              </div>

              {/* Price Comparison */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">3. Price Comparison</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Description</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Price (INR/{selectedRequest.uom})</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Last Approved Price</td>
                      <td className="py-2 text-right font-medium text-gray-900">{selectedRequest.current_price.toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-500">28-Dec-2024</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Requested Price</td>
                      <td className="py-2 text-right font-medium text-gray-900">{selectedRequest.requested_price.toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-500">{selectedRequest.request_date}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700 font-medium">Difference</td>
                      <td className={`py-2 text-right font-bold ${selectedRequest.change_percent < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedRequest.change_percent < 0 ? '' : '+'}{(selectedRequest.requested_price - selectedRequest.current_price).toFixed(2)}
                      </td>
                      <td className={`py-2 text-right font-medium ${selectedRequest.change_percent < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedRequest.change_percent > 0 ? '+' : ''}{selectedRequest.change_percent.toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Approval Action Section */}
          {!isReadOnly && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Approval Action</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Approve Option */}
                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${approvalAction === 'approve' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="action" value="approve" checked={approvalAction === 'approve'} onChange={() => setApprovalAction('approve')} className="mt-0.5 w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-sm font-medium text-emerald-700">Approve</span>
                    <p className="text-xs text-gray-500 mt-1">Set as new approved price effective from date</p>
                  </div>
                </label>

                {/* Reject Option */}
                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${approvalAction === 'reject' ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="action" value="reject" checked={approvalAction === 'reject'} onChange={() => setApprovalAction('reject')} className="mt-0.5 w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-red-700">Reject</span>
                    {approvalAction === 'reject' && (
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                        <textarea
                          rows={3}
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setSelectedRequest(null)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${
                    approvalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Approval'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
