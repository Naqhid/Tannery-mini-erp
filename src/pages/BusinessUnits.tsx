import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight,
  RotateCcw, Save, X, Building, ChevronsUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../lib/api';

interface Company { id: number; name: string; code: string; }
interface BusinessUnit {
  id?: number;
  code: string;
  name: string;
  company_id: number | null;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  status: string;
}

const empty: BusinessUnit = { code: '', name: '', company_id: null, address: '', city: '', state: '', phone: '', email: '', status: 'Active' };

export default function BusinessUnits() {
  const [data, setData] = useState<BusinessUnit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BusinessUnit | null>(null);
  const [formData, setFormData] = useState<BusinessUnit>(empty);
  const [saving, setSaving] = useState(false);
  const [statusToggle, setStatusToggle] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await api<{ data: Company[] }>('/companies?limit=500');
      setCompanies(res.data || []);
    } catch { setCompanies([]); }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) { params.set('sortBy', sortBy); params.set('sortOrder', sortOrder); }
      const res = await api<{ data: BusinessUnit[]; total: number; totalPages: number }>(`/business-units?${params}`);
      setData(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch { setData([]); } finally { setLoading(false); }
  }, [searchQuery, currentPage, pageSize, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number } }>('/business-units/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, sortOrder, pageSize]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} />;
    return sortOrder === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />;
  };

  const openPanel = (item?: BusinessUnit) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ ...empty, ...item });
      setStatusToggle(item.status === 'Active');
    } else {
      setSelectedItem(null);
      setFormData(empty);
      setStatusToggle(true);
    }
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formData.name) { toast.error('Business Unit Name is required'); return; }
    if (!formData.company_id) { toast.error('Parent Company is required'); return; }
    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'Active' : 'Inactive' };
      if (selectedItem?.id) {
        const res = await api(`/business-units/${selectedItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Business Unit updated!');
      } else {
        const res = await api('/business-units', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Business Unit created!');
      }
      setShowPanel(false);
      setSearchQuery('');
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
      const res = await api(`/business-units/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Deleted successfully!');
      setShowPanel(false);
      fetchData();
      fetchStats();
    } catch (err) { toast.error('Failed to delete: ' + (err as Error).message); }
  };

  const companyOptions = [
    { value: '', label: 'Select company *' },
    ...companies.map(c => ({ value: String(c.id), label: `${c.code} - ${c.name}` })),
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 shadow-lg">
            <Building size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Business Units</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage business units (must belong to a Company)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100 shadow-sm">
            <span className="text-xs text-teal-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-teal-800">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active: {stats.active}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/30">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
            <input
              type="text"
              placeholder="Search business units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 bg-white"
            />
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} /> Add Business Unit
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-teal-50/40 border-b border-teal-100/50">
                {[['code', 'Code'], ['name', 'Name'], ['company_name', 'Company'], ['city', 'City'], ['phone', 'Phone'], ['status', 'Status']].map(([key, header]) => (
                  <th key={key} onClick={() => handleSort(key)} className="text-left py-3 px-4 text-[11px] font-semibold text-teal-600 uppercase tracking-wider cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">{header} <SortIcon field={key} /></span>
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">No business units found</td></tr>
              ) : data.map((row, i) => (
                <tr key={row.id || i} className={`hover:bg-teal-50/50 transition-all cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(row)}>
                  <td className="py-3 px-4 font-mono text-xs text-teal-700">{row.code}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{row.company_name || '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{row.city || '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{row.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(row); }} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); row.id && setDeleteConfirm({ open: true, id: row.id }); }} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-teal-100/50 bg-gradient-to-r from-slate-50 to-teal-50/30">
          <p className="text-xs text-teal-500 font-medium">
            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-white text-teal-300 border border-transparent hover:border-teal-200 transition-all disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === p ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md' : 'hover:bg-white text-teal-600 border border-transparent hover:border-teal-200'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg hover:bg-white text-teal-300 border border-transparent hover:border-teal-200 transition-all disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {showPanel && createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
          <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-teal-100/50 bg-gradient-to-r from-teal-50 via-cyan-50 to-slate-50 shrink-0 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 shadow-lg">
                    <Building size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{selectedItem ? 'Edit Business Unit' : 'New Business Unit'}</h2>
                    <p className="text-[11px] text-teal-600 font-medium mt-0.5">Parent Company is required</p>
                  </div>
                </div>
                <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100/50">
                <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider mb-3">Parent Company</p>
                <Select
                  label="Company"
                  required
                  options={companyOptions}
                  value={String(formData.company_id || '')}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value ? Number(e.target.value) : null }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Code" value={formData.code || ''} placeholder="Auto-generated" onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} />
                <Input label="Business Unit Name" required value={formData.name || ''} placeholder="Enter name" onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-900 mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none bg-white"
                  />
                </div>
                <Input label="City" value={formData.city || ''} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} />
                <Input label="State" value={formData.state || ''} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} />
                <Input label="Phone" value={formData.phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                <Input label="Email" value={formData.email || ''} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-700">Status</span>
                <button onClick={() => setStatusToggle(!statusToggle)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${statusToggle ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${statusToggle ? 'translate-x-5' : ''}`} />
                </button>
                <span className={`text-xs font-semibold ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>{statusToggle ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-teal-50/30 shrink-0 rounded-b-2xl">
              <div className="flex items-center justify-between">
                {selectedItem ? (
                  <button onClick={() => selectedItem?.id && setDeleteConfirm({ open: true, id: selectedItem.id })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
                    <Trash2 size={13} /> Delete
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowPanel(false)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                    <RotateCcw size={13} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                    <Save size={13} /> {saving ? 'Saving...' : selectedItem ? 'Update' : 'Save'}
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
        title="Delete Business Unit"
        message="Are you sure you want to delete this business unit? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
