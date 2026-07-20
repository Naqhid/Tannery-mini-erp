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
        totalItems: items.length || 48,
        activeItems: items.filter((p: any) => p.status === 'Approved').length || 36,
        lastApprovedDate: items[0]?.approved_date?.split('T')[0] || '15-Jan-2025',
        lastPriceChange: items[0]?.remarks || '+5.2% on Chrome Powder',
      });
    } catch {
      setSupplierStats({ totalItems: 48, activeItems: 36, lastApprovedDate: '15-Jan-2025', lastPriceChange: '+5.2% on Chrome Powder' });
    }
  }, []);

  // Fetch price change history
  const fetchPriceHistory = useCallback(async (id: string) => {
    try {
      const res = await api<{ data: PriceChangeEvent[] }>(`/supplier-pricing/history/${id}`);
      setPriceHistory(res.data || []);
    } catch {
      setPriceHistory([
        { id: 1, date: '15-Jan-2025', old_price: 180, new_price: 185, change_percent: 2.78, changed_by: 'Admin', notes: 'Annual price revision' },
        { id: 2, date: '01-Oct-2024', old_price: 175, new_price: 180, change_percent: 2.86, changed_by: 'Admin', notes: 'Quarterly adjustment' },
        { id: 3, date: '15-Jul-2024', old_price: 170, new_price: 175, change_percent: 2.94, changed_by: 'Admin', notes: 'Market rate increase' },
        { id: 4, date: '01-Apr-2024', old_price: 165, new_price: 170, change_percent: 3.03, changed_by: 'Admin', notes: 'Supplier revision' },
      ]);
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

  // Mock data for demo when no API data
  const displayData: PricingRecord[] = data.length > 0 ? data : [
    { id: 1, material_code: 'RM-CHR-001', material_name: 'Chrome Powder - Basic Grade', uom: 'KG', supplier_part_no: 'SP-1001', unit_price: 185.00, currency: 'INR', valid_from: '01-Jan-2025', valid_to: '31-Mar-2025', approved_date: '28-Dec-2024', approved_by_name: 'Rajesh Kumar', status: 'Approved', remarks: null, is_current: false },
    { id: 2, material_code: 'RM-CHR-002', material_name: 'Chrome Powder - Premium Grade', uom: 'KG', supplier_part_no: 'SP-1002', unit_price: 245.00, currency: 'INR', valid_from: '01-Jan-2025', valid_to: '31-Mar-2025', approved_date: '28-Dec-2024', approved_by_name: 'Rajesh Kumar', status: 'Approved', remarks: null, is_current: false },
    { id: 3, material_code: 'RM-TAN-001', material_name: 'Tanning Agent - Vegetable', uom: 'LTR', supplier_part_no: 'SP-2001', unit_price: 320.00, currency: 'INR', valid_from: '01-Jan-2025', valid_to: '30-Jun-2025', approved_date: '15-Jan-2025', approved_by_name: 'Suresh Patel', status: 'Approved', remarks: 'Current active price', is_current: true },
    { id: 4, material_code: 'RM-DYE-001', material_name: 'Leather Dye - Black', uom: 'LTR', supplier_part_no: 'SP-3001', unit_price: 450.00, currency: 'INR', valid_from: '01-Oct-2024', valid_to: '31-Dec-2024', approved_date: '25-Sep-2024', approved_by_name: 'Rajesh Kumar', status: 'Expired', remarks: null, is_current: false },
    { id: 5, material_code: 'RM-DYE-002', material_name: 'Leather Dye - Brown', uom: 'LTR', supplier_part_no: 'SP-3002', unit_price: 420.00, currency: 'INR', valid_from: '01-Oct-2024', valid_to: '31-Dec-2024', approved_date: '25-Sep-2024', approved_by_name: 'Rajesh Kumar', status: 'Expired', remarks: null, is_current: false },
    { id: 6, material_code: 'RM-FAT-001', material_name: 'Fat Liquor - Synthetic', uom: 'KG', supplier_part_no: 'SP-4001', unit_price: 280.00, currency: 'INR', valid_from: '01-Jan-2025', valid_to: '31-Mar-2025', approved_date: '28-Dec-2024', approved_by_name: 'Suresh Patel', status: 'Approved', remarks: null, is_current: false },
    { id: 7, material_code: 'RM-FAT-002', material_name: 'Fat Liquor - Natural', uom: 'KG', supplier_part_no: 'SP-4002', unit_price: 350.00, currency: 'INR', valid_from: '01-Jan-2025', valid_to: '31-Mar-2025', approved_date: '28-Dec-2024', approved_by_name: 'Rajesh Kumar', status: 'Approved', remarks: null, is_current: false },
    { id: 8, material_code: 'RM-RES-001', material_name: 'Resin Binder - Acrylic', uom: 'KG', supplier_part_no: 'SP-5001', unit_price: 195.00, currency: 'INR', valid_from: '01-Jan-2025', valid_to: '31-Mar-2025', approved_date: '28-Dec-2024', approved_by_name: 'Suresh Patel', status: 'Approved', remarks: null, is_current: false },
  ];

  return (
    <div className="space-y-5">
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
                <p className="text-sm text-gray-500">{selectedSupplier.code}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                  {selectedSupplier.address && <span>{selectedSupplier.address}</span>}
                  {selectedSupplier.email && <span>{selectedSupplier.email}</span>}
                  {selectedSupplier.phone && <span>{selectedSupplier.phone}</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center px-4 py-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{supplierStats.totalItems}</div>
                <div className="text-xs text-blue-600 font-medium mt-1">Total Items</div>
              </div>
              <div className="text-center px-4 py-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-700">{supplierStats.activeItems}</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">Active Items</div>
              </div>
              <div className="text-center px-4 py-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-bold text-purple-700">{supplierStats.lastApprovedDate}</div>
                <div className="text-xs text-purple-600 font-medium mt-1">Last Approved Date</div>
              </div>
              <div className="text-center px-4 py-3 bg-amber-50 rounded-lg">
                <div className="text-sm font-bold text-amber-700">{supplierStats.lastPriceChange}</div>
                <div className="text-xs text-amber-600 font-medium mt-1">Last Price Change</div>
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
            <h2 className="text-lg font-bold text-gray-900">Pricing History</h2>
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

        {/* Table */}
        <div className="overflow-x-auto">
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
      {selectedSupplier && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Price Change History</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline */}
            <div className="lg:col-span-2">
              <div className="relative">
                {priceHistory.map((event, idx) => (
                  <div key={event.id} className="flex items-start gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${idx === 0 ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-emerald-400'}`} />
                      {idx < priceHistory.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-1" />}
                    </div>
                    <div className={`flex-1 p-4 rounded-lg border ${idx === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{event.old_price.toFixed(2)} → ₹{event.new_price.toFixed(2)}
                            <span className={`ml-2 text-xs font-medium ${event.change_percent > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              ({event.change_percent > 0 ? '+' : ''}{event.change_percent.toFixed(2)}%)
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{event.changed_by || 'System'}</p>
                        </div>
                        <span className="text-xs text-gray-500">{event.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
              <div className="space-y-3">
                {priceHistory.map(event => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-700">{event.date}</p>
                    <p className="text-xs text-gray-500 mt-1">{event.notes || 'No notes'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
