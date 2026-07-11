import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, RotateCcw, Save,
  X, FlaskConical, ChevronsUpDown, ArrowUp, ArrowDown, Upload, Paperclip,
  RefreshCw, CheckSquare,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useDebounce } from '../lib/useDebounce';
import api from '../lib/api';

interface Supplier { id: number; name: string; code: string; }
interface Material {
  id?: number;
  code: string;
  name: string;
  type: string;
  uom: string;
  category: string;
  chemical_group: string;
  appearance: string;
  color: string;
  ph_value: string;
  flash_point: string;
  hsn_code: string;
  cas_number: string;
  shelf_life: string;
  storage_condition: string;
  hazardous: boolean;
  default_warehouse: string;
  opening_stock: string;
  opening_stock_uom: string;
  current_stock: string;
  reorder_level: string;
  maximum_level: string;
  standard_cost: string;
  last_purchase_price: string;
  preferred_supplier_id: string;
  lead_time: string;
  description: string;
  application: string;
  remarks: string;
  attachment_path: string;
  status: string;
}

const empty: Material = {
  code: '', name: '', type: 'Chemical', uom: '', category: '', chemical_group: '',
  appearance: '', color: '', ph_value: '', flash_point: '', hsn_code: '', cas_number: '',
  shelf_life: '', storage_condition: '', hazardous: false, default_warehouse: '',
  opening_stock: '0.00', opening_stock_uom: '', current_stock: '0.00',
  reorder_level: '0.00', maximum_level: '0.00', standard_cost: '0.00',
  last_purchase_price: '0.00', preferred_supplier_id: '', lead_time: '',
  description: '', application: '', remarks: '', attachment_path: '', status: 'Active',
};

const TYPE_COLORS: Record<string, string> = {
  Chemical: 'bg-blue-50 text-blue-700 border border-blue-200',
  Auxiliary: 'bg-green-50 text-green-700 border border-green-200',
  'Packing Material': 'bg-orange-50 text-orange-700 border border-orange-200',
};

const MATERIAL_TYPES = ['Chemical', 'Auxiliary', 'Packing Material'];
const STORAGE_CONDITIONS = ['Room Temperature', 'Cool & Dry', 'Refrigerated', 'Flammable Storage', 'Ventilated Area'];
const CHEMICAL_GROUPS = ['Acids', 'Alkalis', 'Dyes', 'Solvents', 'Fatliquors', 'Resins', 'Tanning Agents', 'Others'];
const WAREHOUSES = ['Main Warehouse', 'Chemical Store', 'Finished Goods Store', 'Raw Material Store'];

export default function MaterialMaster() {
  const [data, setData] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, chemicals: 0, auxiliaries: 0, packing: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'Chemical' | 'Auxiliary' | 'Packing Material'>('all');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Material | null>(null);
  const [formData, setFormData] = useState<Material>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api<{ data: Supplier[] }>('/suppliers?limit=500');
      setSuppliers(res.data || []);
    } catch { setSuppliers([]); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: typeof stats }>('/materials/stats');
      setStats(res.data);
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const search = filterCode || filterName || debouncedSearch;
      if (search) params.set('search', search);
      if (filterType || (activeTab !== 'all')) params.set('type', filterType || activeTab);
      if (filterStatus) params.set('status', filterStatus);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      const res = await api<{ data: Material[]; total: number; totalPages: number }>(`/materials?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch { setData([]); } finally { setLoading(false); }
  }, [debouncedSearch, filterCode, filterName, filterType, filterStatus, activeTab, currentPage, pageSize, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); fetchSuppliers(); }, [fetchStats, fetchSuppliers]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterCode, filterName, filterType, filterStatus, activeTab, sortBy, sortOrder, pageSize]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  const openPanel = (item?: Material) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        ...empty, ...item,
        hazardous: !!(item as any).hazardous,
        opening_stock: String((item as any).opening_stock ?? '0.00'),
        current_stock: String((item as any).current_stock ?? '0.00'),
        reorder_level: String((item as any).reorder_level ?? '0.00'),
        maximum_level: String((item as any).maximum_level ?? '0.00'),
        standard_cost: String((item as any).standard_cost ?? '0.00'),
        last_purchase_price: String((item as any).last_purchase_price ?? '0.00'),
        shelf_life: String((item as any).shelf_life ?? ''),
        lead_time: String((item as any).lead_time ?? ''),
        preferred_supplier_id: String((item as any).preferred_supplier_id ?? ''),
      });
    } else {
      setSelectedItem(null);
      setFormData(empty);
    }
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formData.name) { toast.error('Material Name is required'); return; }
    if (!formData.type) { toast.error('Material Type is required'); return; }
    if (!formData.uom) { toast.error('UOM is required'); return; }
    setSaving(true);
    try {
      const payload = { ...formData, hazardous: formData.hazardous ? 1 : 0 };
      if (selectedItem?.id) {
        const res = await api(`/materials/${selectedItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material updated!');
      } else {
        const res = await api('/materials', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material created!');
      }
      setShowPanel(false);
      setCurrentPage(1);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save: ' + (err as Error).message);
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api(`/materials/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Deleted!');
      setShowPanel(false);
      fetchData();
      fetchStats();
    } catch (err) { toast.error('Failed to delete: ' + (err as Error).message); }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedItem?.id) {
      toast.info('Save the material first before uploading an attachment.');
      return;
    }
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('tannery_token');
      const res = await fetch(`/api/materials/${selectedItem.id}/attachment`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
      const data = await res.json();
      setFormData(prev => ({ ...prev, attachment_path: data.data.file_path }));
      toast.success('Attachment uploaded!');
    } catch (err) {
      toast.error('Upload failed: ' + (err as Error).message);
    } finally { setUploadingFile(false); }
  };

  const update = (field: keyof Material, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const tabs = [
    { id: 'all' as const, label: 'All Materials', count: stats.total },
    { id: 'Chemical' as const, label: 'Chemicals', count: stats.chemicals },
    { id: 'Auxiliary' as const, label: 'Auxiliaries', count: stats.auxiliaries },
    { id: 'Packing Material' as const, label: 'Packing Materials', count: stats.packing },
  ];

  const supplierOptions = [
    { value: '', label: 'Select supplier' },
    ...suppliers.map(s => ({ value: String(s.id), label: `${s.code} - ${s.name}` })),
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200/50">
            <FlaskConical size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Chemical / Material Master</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage all chemicals, auxiliaries and packing materials</p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
          onClick={() => openPanel()}
        >
          <Plus size={14} /> Add Material
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Type Tabs */}
        <div className="flex items-center border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 px-4 py-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Material Code</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter code"
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Material Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Material Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
              <option value="">All</option>
              {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="min-w-[100px]">
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white">
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFilterCode(''); setFilterName(''); setFilterType(''); setFilterStatus(''); setSearchInput(''); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button
              onClick={() => fetchData()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
            >
              <Search size={12} /> Search
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : data.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No materials found</div>
          ) : data.map((row, i) => {
            const cardColors = [
              'border-l-blue-500', 'border-l-indigo-500', 'border-l-teal-500',
              'border-l-emerald-500', 'border-l-purple-500', 'border-l-cyan-500',
              'border-l-amber-500', 'border-l-rose-500',
            ];
            const avatarColors = [
              'from-blue-500 to-indigo-600', 'from-indigo-500 to-violet-600',
              'from-teal-500 to-emerald-600', 'from-emerald-500 to-green-600',
              'from-purple-500 to-fuchsia-600', 'from-cyan-500 to-blue-600',
              'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600',
            ];
            return (
              <div
                key={(row as any).id || i}
                className={`p-4 border-l-4 ${cardColors[i % 8]} hover:bg-blue-50/30 transition-all cursor-pointer active:scale-[0.99]`}
                onClick={() => openPanel(row)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % 8]} flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0`}>
                      {(row.name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{row.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{(row as any).code}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLORS[row.type] || 'bg-gray-100 text-gray-600'}`}>
                      {row.type}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {row.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">UOM:</span>
                    <span className="text-[11px] text-gray-700 font-medium">{row.uom || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Category:</span>
                    <span className="text-[11px] text-gray-700 font-medium truncate">{row.category || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Stock:</span>
                    <span className="text-[11px] text-gray-900 font-semibold">{parseFloat(String((row as any).current_stock || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Reorder:</span>
                    <span className="text-[11px] text-gray-700">{parseFloat(String((row as any).reorder_level || 0)).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-gray-100 pt-2">
                  <button onClick={(e) => { e.stopPropagation(); openPanel(row); }} className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 transition-all"><Edit2 size={15} /></button>
                  <button onClick={(e) => { e.stopPropagation(); (row as any).id && setDeleteConfirm({ open: true, id: (row as any).id }); }} className="p-2 rounded-lg text-rose-500 hover:bg-rose-100 transition-all"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[['code', 'Material Code'], ['name', 'Material Name'], ['type', 'Type'], ['uom', 'UOM'], ['category', 'Category'], ['current_stock', 'Current Stock'], ['reorder_level', 'Reorder Level'], ['status', 'Status']].map(([key, label]) => (
                  <th key={key} onClick={() => handleSort(key)} className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">{label} <SortIcon field={key} /></span>
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <SkeletonLoader rows={5} cols={7} />
              ) : data.length === 0 ? (
                <tr><td colSpan={9}><EmptyState title="No materials found" message="Add a new material or adjust your filters" actionLabel="Add Material" onAction={() => openPanel()} /></td></tr>
              ) : data.map((row, i) => (
                <tr key={(row as any).id || i} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => openPanel(row)}>
                  <td className="py-3 px-4 font-mono text-xs text-gray-700 font-medium">{(row as any).code}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${TYPE_COLORS[row.type] || 'bg-gray-100 text-gray-600'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{row.uom}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{row.category || '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-800 font-medium">{parseFloat(String((row as any).current_stock || 0)).toFixed(2)}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{parseFloat(String((row as any).reorder_level || 0)).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} /> {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(row); }} className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); (row as any).id && setDeleteConfirm({ open: true, id: (row as any).id }); }} className="p-1.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium">
            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showPanel && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] overflow-y-auto" onClick={() => setShowPanel(false)}>
          <div className="min-h-screen flex items-start justify-center py-4 sm:py-6 px-2 sm:px-4">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
                      <FlaskConical size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedItem ? 'Edit Material' : 'Add Material'}</h2>
                      <p className="text-[11px] text-gray-500 mt-0.5">{selectedItem ? (selectedItem as any).code : 'Fill in all required fields'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Material Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Material Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <Input label="Material Code" value={formData.code} placeholder="Auto-generated" onChange={(e) => update('code', e.target.value)} />
                    <Input label="Material Name" required value={formData.name} placeholder="Enter material name" onChange={(e) => update('name', e.target.value)} />
                    <Select
                      label="Material Type"
                      required
                      options={[{ value: '', label: 'Select type' }, ...MATERIAL_TYPES.map(t => ({ value: t, label: t }))]}
                      value={formData.type}
                      onChange={(e) => update('type', e.target.value)}
                    />
                    <Input label="UOM" required value={formData.uom} placeholder="e.g. Kg, Ltr" onChange={(e) => update('uom', e.target.value)} />
                    <Input label="Category" value={formData.category} placeholder="e.g. Tanning, Dyeing" onChange={(e) => update('category', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <Select
                      label="Chemical Group"
                      options={[{ value: '', label: 'Select chemical group' }, ...CHEMICAL_GROUPS.map(g => ({ value: g, label: g }))]}
                      value={formData.chemical_group}
                      onChange={(e) => update('chemical_group', e.target.value)}
                    />
                    <Input label="Appearance" value={formData.appearance} placeholder="Enter appearance" onChange={(e) => update('appearance', e.target.value)} />
                    <Input label="Color" value={formData.color} placeholder="Enter color" onChange={(e) => update('color', e.target.value)} />
                    <Input label="pH Value" value={formData.ph_value} placeholder="Enter pH value" onChange={(e) => update('ph_value', e.target.value)} />
                    <Input label="Flash Point (°C)" value={formData.flash_point} placeholder="Enter flash point" onChange={(e) => update('flash_point', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <Input label="HSN Code" value={formData.hsn_code} placeholder="Enter HSN code" onChange={(e) => update('hsn_code', e.target.value)} />
                    <Input label="CAS No." value={formData.cas_number} placeholder="Enter CAS number" onChange={(e) => update('cas_number', e.target.value)} />
                    <Input label="Shelf Life (Months)" type="number" value={formData.shelf_life} placeholder="Enter shelf life" onChange={(e) => update('shelf_life', e.target.value)} />
                    <Select
                      label="Storage Condition"
                      options={[{ value: '', label: 'Select storage condition' }, ...STORAGE_CONDITIONS.map(s => ({ value: s, label: s }))]}
                      value={formData.storage_condition}
                      onChange={(e) => update('storage_condition', e.target.value)}
                    />
                    <Select
                      label="Hazardous"
                      options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]}
                      value={String(formData.hazardous)}
                      onChange={(e) => update('hazardous', e.target.value === 'true')}
                    />
                  </div>
                </div>

                {/* Inventory Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Inventory Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <Select
                      label="Default Warehouse"
                      required
                      options={[{ value: '', label: 'Select warehouse' }, ...WAREHOUSES.map(w => ({ value: w, label: w }))]}
                      value={formData.default_warehouse}
                      onChange={(e) => update('default_warehouse', e.target.value)}
                    />
                    <Input label="Opening Stock" type="number" value={formData.opening_stock} onChange={(e) => update('opening_stock', e.target.value)} />
                    <Input label="Opening Stock UOM" value={formData.opening_stock_uom} placeholder="Select UOM" onChange={(e) => update('opening_stock_uom', e.target.value)} />
                    <Input label="Reorder Level" required type="number" value={formData.reorder_level} onChange={(e) => update('reorder_level', e.target.value)} />
                    <Input label="Maximum Level" type="number" value={formData.maximum_level} onChange={(e) => update('maximum_level', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <Input label="Standard Cost (₹)" type="number" value={formData.standard_cost} onChange={(e) => update('standard_cost', e.target.value)} />
                    <Input label="Last Purchase Price (₹)" type="number" value={formData.last_purchase_price} onChange={(e) => update('last_purchase_price', e.target.value)} />
                    <Select
                      label="Preferred Supplier"
                      options={supplierOptions}
                      value={formData.preferred_supplier_id}
                      onChange={(e) => update('preferred_supplier_id', e.target.value)}
                    />
                    <Input label="Lead Time (Days)" type="number" value={formData.lead_time} placeholder="Enter lead time" onChange={(e) => update('lead_time', e.target.value)} />
                    <div className="flex flex-col justify-end">
                      <label className="block text-xs font-medium text-gray-900 mb-1">Active</label>
                      <button
                        onClick={() => update('status', formData.status === 'Active' ? 'Inactive' : 'Active')}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${formData.status === 'Active' ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 mx-0.5 ${formData.status === 'Active' ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
                      <textarea rows={4} value={formData.description} onChange={(e) => update('description', e.target.value)} placeholder="Enter description" className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Application / Use</label>
                      <textarea rows={4} value={formData.application} onChange={(e) => update('application', e.target.value)} placeholder="Enter application or use" className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Remarks</label>
                      <textarea rows={4} value={formData.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Enter remarks" className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-white" />
                    </div>
                  </div>

                  {/* Attachment */}
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-900 mb-2">Attachment (SDS / Specification / COA)</label>
                    {formData.attachment_path ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Paperclip size={14} className="text-gray-400" />
                        <span className="text-xs text-blue-600 font-medium truncate">{formData.attachment_path.split('/').pop()}</span>
                        <button onClick={() => update('attachment_path', '')} className="ml-auto p-1 text-gray-400 hover:text-red-500"><X size={12} /></button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Drag and drop files here or <span className="text-blue-600 font-medium">click to upload</span></p>
                        <p className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                        {uploadingFile && <p className="text-xs text-blue-600 mt-2 animate-pulse">Uploading...</p>}
                      </div>
                    )}
                    <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }} />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl flex items-center justify-between">
                {selectedItem ? (
                  <button onClick={() => (selectedItem as any).id && setDeleteConfirm({ open: true, id: (selectedItem as any).id })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <Trash2 size={13} /> Delete
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowPanel(false)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                    <RotateCcw size={13} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50">
                    <Save size={13} /> {saving ? 'Saving...' : selectedItem ? 'Update Material' : 'Save Material'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Material"
        message="Are you sure you want to delete this material? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
