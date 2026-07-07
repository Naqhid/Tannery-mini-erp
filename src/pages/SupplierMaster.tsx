import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Truck,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Save,
  X,
  Users,
  Globe,
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportMenu from '../components/ui/ExportMenu';
import AddressFields from '../components/ui/AddressFields';
import { previewPDF, downloadPDF } from '../lib/pdfExport';
import { exportToExcel } from '../lib/excelExport';
import api from '../lib/api';

interface Supplier {
  id?: number;
  code: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: string;
  category?: string;
  supply_type?: string;
  country?: string;
  address?: string;
  alt_phone?: string;
  pincode?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  payment_terms?: string;
  bank_name?: string;
  bank_account?: string;
  ifsc_code?: string;
  notes?: string;
  country_id?: number | null;
  state_id?: number | null;
  city_id?: number | null;
  pin_code?: string;
}

interface PricingEntry {
  id: number;
  material_code: string;
  material_name: string;
  uom: string;
  price: number;
  valid_from: string;
  valid_to: string;
  status: string;
}

const emptySupplier: Supplier = {
  code: '', name: '', contact_person: '', phone: '', email: '', city: '', state: '',
  status: 'Active', category: 'chemical', supply_type: 'chemical', country: '', address: '',
  alt_phone: '', pincode: '', website: '', gstin: '', pan: '', payment_terms: '30',
  bank_name: '', bank_account: '', ifsc_code: '', notes: '',
  country_id: null, state_id: null, city_id: null, pin_code: '',
};

type SortField = 'code' | 'name' | 'contact_person' | 'phone' | 'email' | 'city' | 'status';
type SortOrder = 'asc' | 'desc';

export default function SupplierMaster() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [pricingData, setPricingData] = useState<PricingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusToggle, setStatusToggle] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Supplier>(emptySupplier);
  const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'financial'>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) {
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
      }
      const res = await api<{ data: Supplier[]; total: number; page: number; totalPages: number }>(`/suppliers?${params.toString()}`);
      setSuppliers(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, pageSize, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number } }>('/suppliers/stats');
      setStats(res.data);
    } catch {}
  }, []);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await api<{ data: PricingEntry[] }>('/suppliers/pricing');
      setPricingData(res.data || []);
    } catch {
      setPricingData([]);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  // Reset to page 1 when search or sort changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, sortOrder, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-700 group-hover:text-gray-900" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="text-orange-600" />
      : <ArrowDown size={12} className="text-orange-600" />;
  };

  const openPanel = (supplier?: Supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({ ...emptySupplier, ...supplier });
      setStatusToggle(supplier.status === 'Active');
    } else {
      setSelectedSupplier(null);
      setFormData(emptySupplier);
      setStatusToggle(true);
    }
    setActiveTab('basic');
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'Active' : 'Inactive' };
      if (selectedSupplier?.id) {
        const res = await api(`/suppliers/${selectedSupplier.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Supplier updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        const res = await api('/suppliers', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Supplier created successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      setShowPanel(false);
      setSearchQuery(''); // Clear search to see all records including the updated one
      setCurrentPage(1);
      fetchSuppliers();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save supplier: ' + (err as Error).message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api(`/suppliers/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Supplier deleted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setShowPanel(false);
      setSearchQuery('');
      setCurrentPage(1);
      fetchSuppliers();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete supplier: ' + (err as Error).message, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const updateField = (field: keyof Supplier, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Check if a supplier has financial transaction data (bank details, gstin, pan)
  const hasFinancialData = (supplier: Supplier | null) => {
    if (!supplier) return false;
    return !!(
      (supplier.bank_account && supplier.bank_account.trim() !== '') ||
      (supplier.gstin && supplier.gstin.trim() !== '') ||
      (supplier.pan && supplier.pan.trim() !== '')
    );
  };

  // Tab Validation Functions
  const isBasicInfoComplete = () => formData.code && formData.name && formData.contact_person && formData.phone;
  const isAddressComplete = () => formData.address && (formData.city || formData.city_id);
  const isFinancialComplete = () => formData.bank_name && formData.bank_account && formData.ifsc_code;
  
  const canAccessTab = (tab: 'basic' | 'address' | 'financial') => {
    // When editing, allow access to all tabs
    if (selectedSupplier) return true;
    // When adding, restrict tabs step-by-step
    if (tab === 'basic') return true;
    if (tab === 'address') return isBasicInfoComplete();
    if (tab === 'financial') return isBasicInfoComplete() && isAddressComplete();
    return false;
  };

  const goToNextTab = () => {
    if (activeTab === 'basic' && canAccessTab('address')) setActiveTab('address');
    else if (activeTab === 'address' && canAccessTab('financial')) setActiveTab('financial');
  };

  const goToPreviousTab = () => {
    if (activeTab === 'address') setActiveTab('basic');
    else if (activeTab === 'financial') setActiveTab('address');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-200/50">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Supplier Master</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your supplier network</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100 shadow-sm">
            <div className="p-1 rounded-md bg-orange-100">
              <Truck size={12} className="text-orange-600" />
            </div>
            <span className="text-xs text-orange-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-orange-800">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* Supplier List */}
      <div className="bg-white rounded-xl border border-orange-100 shadow-sm shadow-orange-100/50 overflow-hidden ring-1 ring-orange-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-orange-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all bg-white"
              />
            </div>
            <button className="p-2 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-all">
              <Filter size={15} />
            </button>
            <ExportMenu
              onPreview={() => {
                const columns = ['Code', 'Name', 'Contact Person', 'Phone', 'Email', 'City', 'Status'];
                const rows = suppliers.map(s => [s.code, s.name, s.contact_person, s.phone, s.email, s.city, s.status]);
                previewPDF({ title: 'Supplier Master', subtitle: `Total: ${suppliers.length} suppliers`, columns, rows, accentColor: [249, 115, 22] });
              }}
              onDownload={() => {
                const columns = ['Code', 'Name', 'Contact Person', 'Phone', 'Email', 'City', 'Status'];
                const rows = suppliers.map(s => [s.code, s.name, s.contact_person, s.phone, s.email, s.city, s.status]);
                downloadPDF({ title: 'Supplier Master', subtitle: `Total: ${suppliers.length} suppliers`, columns, rows, accentColor: [249, 115, 22], fileName: 'Supplier_Master.pdf' });
              }}
              onExcel={() => {
                exportToExcel({
                  data: suppliers,
                  columns: [
                    { key: 'code', header: 'Code' },
                    { key: 'name', header: 'Name' },
                    { key: 'contact_person', header: 'Contact Person' },
                    { key: 'phone', header: 'Phone' },
                    { key: 'email', header: 'Email' },
                    { key: 'city', header: 'City' },
                    { key: 'status', header: 'Status' },
                  ],
                  fileName: 'Supplier_Master',
                });
              }}
            />
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-lg shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add Supplier
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-orange-50/40 border-b border-orange-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-orange-600 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('code')}><span className="inline-flex items-center gap-1">Code <SortIcon field="code" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-violet-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}><span className="inline-flex items-center gap-1">Supplier Name <SortIcon field="name" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-teal-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('contact_person')}><span className="inline-flex items-center gap-1">Contact Person <SortIcon field="contact_person" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer group select-none" onClick={() => handleSort('phone')}><span className="inline-flex items-center gap-1">Phone <SortIcon field="phone" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-purple-500 uppercase tracking-wider hidden xl:table-cell cursor-pointer group select-none" onClick={() => handleSort('email')}><span className="inline-flex items-center gap-1">Email <SortIcon field="email" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-sky-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer group select-none" onClick={() => handleSort('city')}><span className="inline-flex items-center gap-1">City <SortIcon field="city" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}><span className="inline-flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No suppliers found</td></tr>
              ) : suppliers.map((s, index) => (
                <tr key={s.id || s.code} className={`hover:bg-orange-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(s)}>
                  <td className="py-3 px-4 relative">
                    <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${s.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-orange-600 font-medium">{s.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        ['bg-orange-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500'][index % 8]
                      }`}>
                        {s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-teal-700 font-medium text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      {s.contact_person}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-blue-600 font-medium text-xs">{s.phone}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-purple-500 text-xs hover:text-purple-700 hover:underline cursor-pointer">{s.email}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-100">{s.city}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                      s.status === 'Active'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(s); }} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); s.id && handleDelete(s.id); }} disabled={hasFinancialData(s)} title={hasFinancialData(s) ? 'Cannot delete: supplier has financial transaction data' : 'Delete supplier'} className={`p-1.5 rounded-lg transition-all ${hasFinancialData(s) ? 'text-gray-300 cursor-not-allowed' : 'text-rose-400 hover:text-rose-600 hover:bg-rose-100'}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {suppliers.map((s) => (
            <div key={s.id || s.code} className="p-4 hover:bg-orange-50/30 transition-colors" onClick={() => openPanel(s)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">{s.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1.5">{s.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users size={11} className="text-teal-400" />{s.contact_person}</span>
                    <span className="flex items-center gap-1"><Phone size={11} className="text-blue-400" />{s.phone}</span>
                    <span className="text-sky-600">{s.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openPanel(s); }} className="p-2 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); s.id && handleDelete(s.id); }} disabled={hasFinancialData(s)} title={hasFinancialData(s) ? 'Cannot delete: supplier has financial transaction data' : 'Delete supplier'} className={`p-2 rounded-lg transition-all ${hasFinancialData(s) ? 'text-gray-300 cursor-not-allowed' : 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-orange-100/50 bg-gradient-to-r from-slate-50 to-orange-50/30">
          <div className="flex items-center gap-3">
            <p className="text-xs text-orange-500 font-medium">
              Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
            </p>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs border border-orange-200 rounded-lg px-2 py-1 text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-orange-300 border border-transparent hover:border-orange-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - currentPage) <= 1) return true;
                return false;
              })
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-orange-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      currentPage === item
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-200'
                        : 'hover:bg-white hover:shadow-sm text-orange-600 border border-transparent hover:border-orange-200'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-orange-300 border border-transparent hover:border-orange-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing History */}
      <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-amber-100/50 bg-gradient-to-r from-amber-50/50 to-yellow-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <CreditCard size={14} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Pricing History</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select className="px-2 py-1.5 border border-amber-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-300 focus:border-amber-400">
                <option>All Materials</option>
                <option>Chrome Powder 33%</option>
                <option>Sodium Sulphide</option>
              </select>
              <input type="date" defaultValue="2024-04-01" className="px-2 py-1.5 border border-amber-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-300" />
              <input type="date" defaultValue="2024-05-31" className="px-2 py-1.5 border border-amber-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
        </div>
        {/* Desktop pricing table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Material Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Material Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">UOM</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Price (₹)</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Valid From</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Valid To</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pricingData.map((p, i) => (
                <tr key={p.material_code + i} className={`hover:bg-amber-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <td className="py-2.5 px-4 font-mono text-xs text-amber-600 font-medium">{p.material_code}</td>
                  <td className="py-2.5 px-4 text-gray-900 font-medium text-xs">{p.material_name}</td>
                  <td className="py-2.5 px-4 text-gray-500 text-xs">{p.uom}</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold text-xs">₹{p.price.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-gray-500 text-xs hidden lg:table-cell">{p.valid_from}</td>
                  <td className="py-2.5 px-4 text-gray-500 text-xs hidden lg:table-cell">{p.valid_to}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile pricing cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {pricingData.map((p, i) => (
            <div key={p.material_code + i} className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{p.material_code}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>{p.status}</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{p.material_name}</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">{p.uom} | {p.valid_from} – {p.valid_to}</span>
                <span className="text-emerald-700 font-bold">₹{p.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className="w-full max-w-[850px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-orange-100/50 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-200/50">
                      <Truck size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedSupplier ? 'Edit Supplier' : 'New Supplier'}</h2>
                      <p className="text-[11px] text-orange-600 font-medium mt-0.5">{selectedSupplier ? selectedSupplier.code : 'Add a new supplier record'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all"><X size={18} /></button>
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-1 mt-4">
                  {[
                    { id: 'basic' as const, label: 'Basic Info', icon: <Building2 size={13} />, color: 'from-orange-500 to-amber-600' },
                    { id: 'address' as const, label: 'Address & Contact', icon: <MapPin size={13} />, color: 'from-violet-500 to-purple-600' },
                    { id: 'financial' as const, label: 'Financial', icon: <CreditCard size={13} />, color: 'from-emerald-500 to-teal-600' },
                  ].map((tab) => {
                    const isAccessible = canAccessTab(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => isAccessible && setActiveTab(tab.id)}
                        disabled={!isAccessible}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          !isAccessible
                            ? 'opacity-40 cursor-not-allowed text-gray-400'
                            : activeTab === tab.id
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                        }`}
                      >
                        {tab.icon}{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><Truck size={10} /> Supplier Identity</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Supplier Code" required value={formData.code || ''} placeholder="Auto-generated" onChange={(e) => updateField('code', e.target.value)} />
                        <Input label="Supplier Name" required value={formData.name || ''} placeholder="Enter name" onChange={(e) => updateField('name', e.target.value)} />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1.5"><Layers size={10} /> Classification</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Select label="Supplier Category" options={[
                          { value: '', label: 'Select category' },
                          { value: 'chemical', label: 'Chemical Supplier' },
                          { value: 'raw', label: 'Raw Material Supplier' },
                          { value: 'dye', label: 'Dye Supplier' },
                          { value: 'finishing', label: 'Finishing Supplier' },
                        ]} value={formData.category || ''} onChange={(e) => updateField('category', e.target.value)} />
                        <Select label="Type of Supply" options={[
                          { value: '', label: 'Select type' },
                          { value: 'raw', label: 'Raw Material' },
                          { value: 'chemical', label: 'Chemical' },
                          { value: 'dye', label: 'Dye' },
                          { value: 'finishing', label: 'Finishing Material' },
                        ]} value={formData.supply_type || ''} onChange={(e) => updateField('supply_type', e.target.value)} />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5"><Phone size={10} /> Contact</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Contact Person" value={formData.contact_person || ''} placeholder="Contact name" onChange={(e) => updateField('contact_person', e.target.value)} />
                        <Input label="Phone" value={formData.phone || ''} placeholder="+91 XXXXX XXXXX" onChange={(e) => updateField('phone', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Email" value={formData.email || ''} placeholder="email@domain.com" onChange={(e) => updateField('email', e.target.value)} />
                        <Input label="Alternate Phone" value={formData.alt_phone || ''} placeholder="Optional" onChange={(e) => updateField('alt_phone', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'address' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-violet-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={10} /> Address & Location</p>
                      <AddressFields
                        value={{
                          country_id: formData.country_id,
                          state_id: formData.state_id,
                          city_id: formData.city_id,
                          country: formData.country,
                          city: formData.city,
                          state: formData.state,
                          pin_code: formData.pin_code || formData.pincode,
                          address: formData.address,
                        }}
                        onChange={(addr) => setFormData(prev => ({ ...prev, ...addr, pincode: addr.pin_code || prev.pincode }))}
                        showBillingShipping={false}
                        showAddressTextarea={true}
                        addressLabel="Address"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-50/80 to-sky-50/80 border border-cyan-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider flex items-center gap-1.5"><Globe size={10} /> Web & Notes</p>
                      <Input label="Website" value={formData.website || ''} placeholder="www.example.com" onChange={(e) => updateField('website', e.target.value)} />
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
                        <textarea rows={2} value={formData.notes || ''} placeholder="Any notes..." onChange={(e) => updateField('notes', e.target.value)} className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none placeholder-gray-400 bg-white" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'financial' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={10} /> Tax Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="GSTIN" value={formData.gstin || ''} placeholder="e.g. 33AAACI2345C1Z1" onChange={(e) => updateField('gstin', e.target.value)} />
                        <Input label="PAN" value={formData.pan || ''} placeholder="e.g. AAACI2345C" onChange={(e) => updateField('pan', e.target.value)} />
                      </div>
                      <Select label="Payment Terms" options={[
                        { value: '15', label: '15 Days' },
                        { value: '30', label: '30 Days' },
                        { value: '45', label: '45 Days' },
                        { value: '60', label: '60 Days' },
                      ]} value={formData.payment_terms || '30'} onChange={(e) => updateField('payment_terms', e.target.value)} />
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5"><Building2 size={10} /> Bank Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Bank Name" value={formData.bank_name || ''} placeholder="Enter bank name" onChange={(e) => updateField('bank_name', e.target.value)} />
                        <Input label="Account No." value={formData.bank_account || ''} placeholder="Enter account no." onChange={(e) => updateField('bank_account', e.target.value)} />
                      </div>
                      <Input label="IFSC Code" value={formData.ifsc_code || ''} placeholder="e.g. HDFC0001234" onChange={(e) => updateField('ifsc_code', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={goToPreviousTab}
                    disabled={activeTab === 'basic'}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    ← Previous
                  </button>
                  {activeTab !== 'financial' && (
                    <button
                      onClick={goToNextTab}
                      disabled={!canAccessTab(activeTab === 'basic' ? 'address' : 'financial')}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      Next →
                    </button>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Status</span>
                  <button onClick={() => setStatusToggle(!statusToggle)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${statusToggle ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${statusToggle ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className={`text-xs font-semibold ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>{statusToggle ? '● Active' : '○ Inactive'}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-orange-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedSupplier ? (
                    hasFinancialData(selectedSupplier) ? (
                      <button disabled title="Cannot delete: supplier has financial transaction data" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed opacity-60"><Trash2 size={13} /> Delete</button>
                    ) : (
                      <button onClick={() => selectedSupplier?.id && handleDelete(selectedSupplier.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95"><Trash2 size={13} /> Delete</button>
                    )
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95" onClick={() => setShowPanel(false)}><RotateCcw size={13} /> Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-lg shadow-md shadow-orange-200 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"><Save size={13} /> {saving ? 'Saving...' : selectedSupplier ? 'Update' : 'Save'}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
