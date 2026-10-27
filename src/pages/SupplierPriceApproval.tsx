import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Search, Loader2, X, Check, XCircle, FileText
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface ApprovalRequest {
  id: number;
  request_id: number;
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

interface FilterState {
  supplier: string;
  item_group: string;
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
  const [saving, setSaving] = useState(false);

  // Reject modal (requires a reason before rejecting).
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    supplier: '', item_group: '', item: '', fromDate: '', toDate: '', status: '',
  });

  const [suppliers, setSuppliers] = useState<{ id: number; code: string; name: string }[]>([]);

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
      if (filters.item_group) params.set('item_group', filters.item_group);
      if (filters.item) params.set('search', filters.item);
      if (filters.fromDate) params.set('from_date', filters.fromDate);
      if (filters.toDate) params.set('to_date', filters.toDate);
      if (filters.status) params.set('status', filters.status);

      const res = await api<{ data: ApprovalRequest[] }>(`/price-approvals?${params}`);
      setData(res.data || []);
    } catch {
      setData([]);
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

  const clearFilters = () => {
    setFilters({ supplier: '', item_group: '', item: '', fromDate: '', toDate: '', status: '' });
  };

  const handleSearch = () => { fetchData(); };

  const statusClass = (status: string) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      // Group selected items by request_id
      const groupedByRequest = data.reduce((acc, item) => {
        if (selectedIds.includes(item.id)) {
          if (!acc[item.request_id]) {
            acc[item.request_id] = [];
          }
          acc[item.request_id].push(item.id);
        }
        return acc;
      }, {} as Record<number, number[]>);

      // Approve each group
      for (const [requestId, itemIds] of Object.entries(groupedByRequest)) {
        await api(`/price-approvals/${requestId}/approve-selected`, {
          method: 'PATCH',
          body: JSON.stringify({ item_ids: itemIds, approval_notes: 'Bulk approved' }),
        });
      }

      toast.success(`${selectedIds.length} prices approved!`);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to approve');
    } finally { setSaving(false); }
  };

  const handleBulkReject = () => {
    if (!selectedIds.length) return;
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const confirmBulkReject = async () => {
    const reason = rejectionReason.trim();
    if (!reason) {
      toast.error('Rejection reason is required');
      return;
    }
    setSaving(true);
    try {
      // Group selected items by request_id
      const groupedByRequest = data.reduce((acc, item) => {
        if (selectedIds.includes(item.id)) {
          if (!acc[item.request_id]) {
            acc[item.request_id] = [];
          }
          acc[item.request_id].push(item.id);
        }
        return acc;
      }, {} as Record<number, number[]>);

      // Reject each group
      for (const [requestId, itemIds] of Object.entries(groupedByRequest)) {
        await api(`/price-approvals/${requestId}/reject-selected`, {
          method: 'PATCH',
          body: JSON.stringify({ item_ids: itemIds, rejection_reason: reason }),
        });
      }

      toast.success(`${selectedIds.length} prices rejected`);
      setSelectedIds([]);
      setRejectModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to reject');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Supplier Price Approval</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          <span className="text-blue-600">Purchase</span>
          {' > '}
          <span className="text-blue-600">Supplier Pricing History</span>
          {' > '}
          <span className="text-blue-600">Supplier Price Approval</span>
        </p>
      </div>

      {/* Pending Price Approvals - Top Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold text-blue-700">Pending Price Approvals</h1>
          </div>

          {/* Filters — 3 per row so they wrap onto multiple lines and the
              action buttons remain fully visible. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Supplier</label>
              <select value={filters.supplier} onChange={e => setFilters(p => ({ ...p, supplier: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">All Suppliers</option>
                {suppliers.map(s => <option key={s.id} value={String(s.id)}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Item Group</label>
              <select value={filters.item_group} onChange={e => setFilters(p => ({ ...p, item_group: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
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
            <div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-3">
              <button onClick={clearFilters} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <X className="w-4 h-4" /> Clear
              </button>
              <button onClick={handleSearch} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/30 border border-blue-700 transition-all">
                <Search className="w-4 h-4" /> Search
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
                  <td colSpan={12} className="text-center py-12 text-gray-500">No price approvals found</td>
                </tr>
              ) : (
                data.map(req => (
                  <tr
                    key={req.id}
                    onClick={() => toggleSelect(req.id)}
                    className={`cursor-pointer transition-colors ${selectedIds.includes(req.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
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
                    <td className="px-4 py-3 text-right text-gray-700">{Number(req.current_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{Number(req.requested_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className={`px-4 py-3 text-right font-medium ${(req.change_percent || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {(req.change_percent || 0) > 0 ? '+' : ''}{Number(req.change_percent || 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-gray-600">{req.effective_from}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(req.status)}`}>{req.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-gray-500">No price approvals found</p></div>
          ) : (
            data.map(req => (
              <div
                key={req.id}
                onClick={() => toggleSelect(req.id)}
                className={`p-4 transition-colors cursor-pointer ${selectedIds.includes(req.id) ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'active:bg-gray-50'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{req.material_name}</p>
                    <p className="text-xs text-blue-600 font-mono mt-0.5">{req.request_no}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${statusClass(req.status)}`}>{req.status}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2 truncate">{req.supplier_name}</p>
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Current</p>
                    <p className="text-xs font-bold text-gray-900">₹{Number(req.current_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Requested</p>
                    <p className="text-xs font-bold text-gray-900">₹{Number(req.requested_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Change</p>
                    <p className={`text-xs font-bold ${(req.change_percent || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {(req.change_percent || 0) > 0 ? '+' : ''}{Number(req.change_percent || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
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
          </div>
        </div>
      </div>

      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reject-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 id="reject-title" className="text-lg font-bold text-gray-900">Reject selected prices</h2>
            <p className="mt-1 text-sm text-gray-600">Provide a reason for rejecting {selectedIds.length} selected price{selectedIds.length === 1 ? '' : 's'}.</p>
            <label className="mt-4 block text-sm font-medium text-gray-700" htmlFor="rejection-reason">Rejection reason <span className="text-red-600">*</span></label>
            <textarea id="rejection-reason" autoFocus rows={4} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Enter reason for rejection..." className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setRejectModalOpen(false)} disabled={saving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={confirmBulkReject} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{saving ? 'Rejecting...' : 'Reject selected'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
