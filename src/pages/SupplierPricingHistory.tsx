import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Search, Plus, Eye, Copy, Download, Loader2, X, Star,
  ChevronLeft, ChevronRight, TrendingUp, Building2, Package,
  Calendar, Clock, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface Supplier {
  id: number;
  code: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface PricingRecord {
  id: number;
  material_code: string;
  material_name: string;
  uom: string;
  supplier_part_no: string | null;
  unit_price: number;
  currency: string;
  valid_from: string | null;
  valid_to: string | null;
  approved_date: string | null;
  approved_by_name: string | null;
  status: string;
  remarks: string | null;
  is_current: boolean;
}

interface PriceChangeEvent {
  id: number;
  date: string;
  old_price: number;
  new_price: number;
  change_percent: number;
  changed_by: string | null;
  notes: string | null;
}

interface FilterOptions {
  suppliers: Supplier[];
  itemGroups: string[];
  uoms: string[];
}

export default function SupplierPricingHistory() {
  const navigate = useNavigate();
  const { canWrite, isReadOnly } = usePermission();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PricingRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [supplierId, setSupplierId] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [uom, setUom] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    suppliers: [],
    itemGroups: [],
    uoms: [],
  });

  // Selected supplier info
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierStats, setSupplierStats] = useState({
    totalItems: 0,
    activeItems: 0,
    lastApprovedDate: '',
    lastPriceChange: '',
  });

  // Price change history
  const [priceHistory, setPriceHistory] = useState<PriceChangeEvent[]>([]);

  // Fetch filter options
  useEffect(() => {
    (async () => {
      try {
        const [suppliers, materials] = await Promise.all([
          api<{ data: Supplier[] }>('/suppliers?limit=500'),
          api<{ data: any[] }>('/materials?limit=500'),
        ]);
        const groups = [...new Set((materials.data || []).map((m: any) => m.type || m.category).filter(Boolean))];
        const uoms = [...new Set((materials.data || []).map((m: any) => m.uom).filter(Boolean))];
        setFilterOptions({
          suppliers: suppliers.data || [],
          itemGroups: groups,
          uoms: uoms,
        });
      } catch { /* silent */ }
    })();
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!supplierId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      params.set('supplier_id', supplierId);
      if (itemGroup) params.set('item_group', itemGroup);
      if (itemSearch) params.set('search', itemSearch);
      if (uom) params.set('uom', uom);
      if (fromDate) params.set('from_date', fromDate);
      if (toDate) params.set('to_date', toDate);
      if (status) params.set('status', status);
      if (showInactive) params.set('show_inactive', 'true');

      const res = await api<{ data: PricingRecord[]; total: number }>(`/supplier-pricing?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
    } catch {
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [supplierId, currentPage, pageSize, itemGroup, itemSearch, uom, fromDate, toDate, status, showInactive]);

  // Fetch supplier stats
  const fetchSupplierStats = useCallback(async (id: string) => {
    try {
      const res = await api<{ data: any }>(`/supplier-pricing/supplier/${id}`);
      const items = res.data || [];
      setSupplierStats({
        totalItems: items.length,
        activeItems: items.filter((p: any) => p.status === 'Approved').length,
        lastApprovedDate: items[0]?.approved_date?.split('T')[0] || '-',
        lastPriceChange: items[0]?.valid_from?.split('T')[0] || '-',
      });
    } catch {
      setSupplierStats({ totalItems: 0, activeItems: 0, lastApprovedDate: '-', lastPriceChange: '-' });
    }
  }, []);

  // Fetch price change history
  const fetchPriceHistory = useCallback(async (id: string) => {
    try {
      // Use the supplier pricing history endpoint and extract price changes
      const res = await api<{ data: any[] }>(`/supplier-pricing/supplier/${id}`);
      const items = res.data || [];
      // Build price change events from pricing records (sorted by date)
      const sorted = items
        .filter((p: any) => p.approved_date || p.valid_from)
        .sort((a: any, b: any) => new Date(a.valid_from || a.approved_date).getTime() - new Date(b.valid_from || b.approved_date).getTime());
      
      const events: PriceChangeEvent[] = sorted.map((p: any, idx: number) => ({
        id: p.id || idx + 1,
        date: p.valid_from ? new Date(p.valid_from).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
        old_price: idx > 0 ? sorted[idx - 1].unit_price || sorted[idx - 1].price || 0 : 0,
        new_price: p.unit_price || p.price || 0,
        change_percent: 0,
        changed_by: p.approved_by_name || 'Admin User',
        notes: p.remarks || null,
      }));
      setPriceHistory(events);
    } catch {
      setPriceHistory([]);
    }
  }, []);

  useEffect(() => { if (supplierId) fetchData(); }, [fetchData, supplierId]);

  const handleSupplierChange = (id: string) => {
    setSupplierId(id);
    if (id) {
      const supplier = filterOptions.suppliers.find(s => String(s.id) === id);
      setSelectedSupplier(supplier || null);
      fetchSupplierStats(id);
      fetchPriceHistory(id);
    } else {
      setSelectedSupplier(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const clearFilters = () => {
    setItemGroup('');
    setItemSearch('');
    setUom('');
    setFromDate('');
    setToDate('');
    setStatus('');
    setShowInactive(false);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  // Use real data only
  const displayData: PricingRecord[] = data;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900">Supplier Pricing History</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          <span className="text-blue-600">Purchase</span>
          {' > '}
          <span className="text-blue-600">Supplier Pricing History</span>
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {/* Supplier */}
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Supplier <span className="text-red-500">*</span></label>
            <select
              value={supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select Supplier</option>
              {filterOptions.suppliers.map(s => (
                <option key={s.id} value={String(s.id)}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          {/* Item Group */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Item Group</label>
            <select
              value={itemGroup}
              onChange={(e) => setItemGroup(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Groups</option>
              {filterOptions.itemGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {/* Item */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Item</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search item..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          {/* UOM */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">UOM</label>
            <select
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All</option>
              {filterOptions.uoms.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          {/* From Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          {/* To Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="Approved">Approved</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        {/* Bottom row: Show Inactive + buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              {showInactive ? <ToggleRight className="w-5 h-5 text-blue-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
              Show Inactive
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" /> Clear
            </button>
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Info Card */}
      {selectedSupplier && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedSupplier.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedSupplier.code} {selectedSupplier.address ? `| ${selectedSupplier.address}` : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                  {selectedSupplier.email && <span>Email: {selectedSupplier.email}</span>}
                  {selectedSupplier.phone && <span>Ph: {selectedSupplier.phone}</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center px-4 py-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-500 font-medium mb-1">Total Items</div>
                <div className="text-2xl font-bold text-blue-700">{supplierStats.totalItems}</div>
              </div>
              <div className="text-center px-4 py-3 bg-emerald-50 rounded-lg">
                <div className="text-xs text-gray-500 font-medium mb-1">Active Items</div>
                <div className="text-2xl font-bold text-emerald-700">{supplierStats.activeItems}</div>
              </div>
              <div className="text-center px-4 py-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-gray-500 font-medium mb-1">Last Approved Date (Overall)</div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">{supplierStats.lastApprovedDate || '-'}</span>
                </div>
              </div>
              <div className="text-center px-4 py-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-gray-500 font-medium mb-1">Last Price Change (Overall)</div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700">{supplierStats.lastPriceChange || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing History Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-blue-700">Pricing History</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export
            </button>
            {canWrite && (
              <button
                onClick={() => navigate('/supplier-pricing-history/new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add New Price
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">UOM</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Supplier Part No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Unit Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Currency</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Effective From</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Effective To</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Last Approved Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Approved By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Remarks</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={14} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-sm text-gray-500 mt-2">Loading pricing data...</p>
                  </td>
                </tr>
              ) : (
                displayData.map((row, idx) => (
                  <tr key={row.id} className={`hover:bg-gray-50 ${row.is_current ? 'bg-emerald-50/50' : ''}`}>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        {row.is_current && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.material_code}</td>
                    <td className="px-4 py-3 text-gray-700">{row.material_name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.uom}</td>
                    <td className="px-4 py-3 text-gray-600">{row.supplier_part_no || '-'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-gray-600">{row.currency}</td>
                    <td className="px-4 py-3 text-gray-600">{row.valid_from || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.valid_to || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.approved_date || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.approved_by_name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.is_current && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Current Price</span>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          row.status === 'Expired' ? 'bg-red-100 text-red-700' :
                          row.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{row.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{row.remarks || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/supplier-pricing-history/${row.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(String(row.unit_price)); toast.success('Price copied!'); }}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy Price"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
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
          ) : displayData.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-gray-500">No pricing records found</p></div>
          ) : (
            displayData.map((row, idx) => (
              <div key={row.id} onClick={() => navigate(`/supplier-pricing-history/${row.id}`)} className="p-4 active:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{row.material_name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{row.material_code}</p>
                  </div>
                  <div className="shrink-0 ml-2 flex flex-col items-end gap-1">
                    {row.is_current && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">Current</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      row.status === 'Expired' ? 'bg-red-100 text-red-700' :
                      row.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{row.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Unit Price</p>
                    <p className="text-xs font-bold text-gray-900">{row.currency} {row.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">UOM</p>
                    <p className="text-xs text-gray-700">{row.uom}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Effective From</p>
                    <p className="text-xs text-gray-700">{row.valid_from || '-'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords || displayData.length)} to {Math.min(currentPage * pageSize, totalRecords || displayData.length)} of {totalRecords || displayData.length} records
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${currentPage === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage === (totalPages || 1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border border-gray-200 rounded-lg text-sm">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Price Change History Timeline */}
      {selectedSupplier && priceHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-blue-700">Price Change History - {displayData[0]?.material_code || 'CHEM-001'} | {displayData[0]?.material_name || 'Chrome Powder'} ({displayData[0]?.uom || 'KG'})</h2>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Horizontal Timeline */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />

              {/* Timeline dots + cards */}
              <div className="flex gap-4 overflow-x-auto pb-4">
                {priceHistory.map((event, idx) => (
                  <div key={event.id} className="flex flex-col items-center min-w-[180px]">
                    {/* Dot */}
                    <div className={`w-3 h-3 rounded-full z-10 ${idx === priceHistory.length - 1 ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-emerald-400'}`} />
                    {/* Card */}
                    <div className={`mt-4 p-3 rounded-lg border w-full ${idx === priceHistory.length - 1 ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                      <p className="text-xs font-semibold text-gray-900">{event.date}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">Price: ₹ {Number(event.new_price).toFixed(2)} / KG</p>
                      <p className="text-xs text-gray-500 mt-1">Approved By: {event.changed_by || 'Admin User'}</p>
                      <p className="text-xs text-gray-500">Remark: {event.notes || '-'}</p>
                      {idx === priceHistory.length - 1 && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">Current</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Upcoming Change */}
                <div className="flex flex-col items-center min-w-[160px]">
                  <div className="w-3 h-3 rounded-full z-10 bg-gray-300 ring-4 ring-gray-100" />
                  <div className="mt-4 p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 w-full">
                    <p className="text-xs font-semibold text-gray-500">Upcoming Change</p>
                    <p className="text-xs text-gray-400 mt-1">Price Change Expected</p>
                    <p className="text-xs text-gray-400">Next Review: --</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                Prices are as per approved supplier agreements.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                Current Price is effective from {priceHistory[priceHistory.length - 1]?.date || '-'}.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                Review date is monthly unless specified.
              </li>
            </ul>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
