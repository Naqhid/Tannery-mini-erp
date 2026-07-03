import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  History,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  RotateCcw,
  ClipboardList,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import api from '../lib/api';

interface BOMItemRow {
  id: number;
  material_code: string;
  material_name: string;
  type: string;
  uom: string;
  qty: number;
  unit_cost: number;
  amount: number;
  remarks: string;
}

interface BOM {
  id?: number;
  code: string;
  name: string;
  leather_type: string;
  process_type: string;
  thickness: string;
  uom: string;
  valid_from: string;
  valid_to: string;
  status: string;
  description: string;
  version?: number;
  items?: BOMItemRow[];
}

const emptyBOM: BOM = {
  code: '', name: '', leather_type: 'cow', process_type: 'finishing',
  thickness: '1.2-1.4', uom: 'sqft', valid_from: '', valid_to: '',
  status: 'Active', description: '', version: 1,
};

export default function BOM() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [formData, setFormData] = useState<BOM>(emptyBOM);
  const [items, setItems] = useState<BOMItemRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusToggle, setStatusToggle] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const fetchBOMs = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await api<{ data: BOM[]; total: number }>(`/boms${params}`);
      setBoms(res.data || []);
    } catch {
      setBoms([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number } }>('/boms/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchBOMs(); }, [fetchBOMs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const openPanel = async (bom?: BOM) => {
    if (bom) {
      setSelectedBOM(bom);
      setFormData({
        ...emptyBOM,
        ...bom,
        valid_from: formatDate(bom.valid_from),
        valid_to: formatDate(bom.valid_to),
      });
      setStatusToggle(bom.status === 'Active' || bom.status === 'active');
      try {
        const detail = await api<{ data: BOM & { items: BOMItemRow[] } }>(`/boms/${bom.id}`);
        setItems(detail.data.items || []);
      } catch {
        setItems([]);
      }
    } else {
      setSelectedBOM(null);
      setFormData(emptyBOM);
      setStatusToggle(true);
      setItems([]);
    }
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'Active' : 'Inactive' };
      if (selectedBOM?.id) {
        const res = await api(`/boms/${selectedBOM.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'BOM updated successfully!', { position: 'top-right', autoClose: 3000 });
      } else {
        const res = await api('/boms', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'BOM created successfully!', { position: 'top-right', autoClose: 3000 });
      }
      setShowPanel(false);
      setSearchQuery('');
      fetchBOMs();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save BOM: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
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
      const res = await api(`/boms/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'BOM deleted successfully!', { position: 'top-right', autoClose: 3000 });
      setShowPanel(false);
      setSearchQuery('');
      fetchBOMs();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete BOM: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    }
  };

  const updateField = (field: keyof BOM, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const itemColumns = [
    { key: 'checkbox', header: '', width: '30px', render: () => (
      <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
    )},
    { key: 'id', header: '#', width: '35px' },
    { key: 'material_code', header: 'Material Code', width: '110px' },
    { key: 'material_name', header: 'Material Name', width: '180px' },
    { key: 'type', header: 'Type', width: '80px' },
    { key: 'uom', header: 'UOM', width: '55px' },
    { key: 'qty', header: 'Qty / Sq. Ft.', width: '95px', render: (row: BOMItemRow) => (
      <span>{row.qty.toFixed(3)}</span>
    )},
    { key: 'unit_cost', header: 'Unit Cost (Rs)', width: '100px', render: (row: BOMItemRow) => (
      <span>{row.unit_cost.toFixed(2)}</span>
    )},
    { key: 'amount', header: 'Amount (Rs)', width: '95px', render: (row: BOMItemRow) => (
      <span>{row.amount.toFixed(2)}</span>
    )},
    { key: 'remarks', header: 'Remarks', width: '140px' },
    { key: 'actions', header: 'Action', width: '60px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200/50">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Bill of Materials (BOM)</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your BOMs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-100 shadow-sm">
            <div className="p-1 rounded-md bg-teal-100">
              <ClipboardList size={12} className="text-teal-600" />
            </div>
            <span className="text-xs text-teal-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-teal-800">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* BOM List */}
      <div className="bg-white rounded-xl border border-teal-100 shadow-sm shadow-teal-100/50 overflow-hidden ring-1 ring-teal-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
              <input
                type="text"
                placeholder="Search BOMs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white"
              />
            </div>
            <button className="p-2 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-all">
              <Filter size={15} />
            </button>
            <button className="hidden sm:flex p-2 rounded-lg border border-sky-200 text-sky-500 hover:bg-sky-50 hover:border-sky-300 transition-all">
              <Download size={15} />
            </button>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-lg shadow-md shadow-teal-200 hover:shadow-lg hover:shadow-teal-300 transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add BOM
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-teal-50/40 border-b border-teal-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-purple-500 uppercase tracking-wider">BOM Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Leather Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-sky-500 uppercase tracking-wider hidden lg:table-cell">Process Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-amber-500 uppercase tracking-wider hidden lg:table-cell">Thickness</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-violet-500 uppercase tracking-wider hidden xl:table-cell">UOM</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : boms.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No BOMs found</td></tr>
              ) : boms.map((b, index) => (
                <tr key={b.id || b.code} className={`hover:bg-teal-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(b)}>
                  <td className="py-3 px-4 relative">
                    <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${b.status === 'Active' || b.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-teal-600 font-medium">{b.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        ['bg-teal-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-purple-500'][index % 8]
                      }`}>
                        {b.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{b.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-blue-700 font-medium text-xs capitalize">{b.leather_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-sky-600 font-medium text-xs capitalize">{b.process_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">{b.thickness}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-violet-600 font-medium text-xs uppercase">{b.uom}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                      b.status === 'Active' || b.status === 'active'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Active' || b.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(b); }} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); b.id && handleDelete(b.id); }} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {boms.map((b) => (
            <div key={b.id || b.code} className="p-4 hover:bg-teal-50/30 transition-colors" onClick={() => openPanel(b)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-teal-500 bg-teal-50 px-1.5 py-0.5 rounded">{b.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      b.status === 'Active' || b.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${b.status === 'Active' || b.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1.5">{b.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="capitalize">{b.leather_type}</span>
                    <span className="capitalize">{b.process_type}</span>
                    <span>{b.thickness}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openPanel(b); }} className="p-2 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); b.id && handleDelete(b.id); }} className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-teal-100/50 bg-gradient-to-r from-slate-50 to-teal-50/30">
          <p className="text-xs text-teal-500 font-medium">Showing {boms.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-teal-300 border border-transparent hover:border-teal-200 transition-all"><ChevronLeft size={14} /></button>
            <button className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-medium shadow-md shadow-teal-200">1</button>
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-teal-300 border border-transparent hover:border-teal-200 transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className="w-full max-w-[1000px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-teal-100/50 bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200/50">
                      <ClipboardList size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedBOM ? 'Edit BOM' : 'New BOM'}</h2>
                      <p className="text-[11px] text-teal-600 font-medium mt-0.5">{selectedBOM ? selectedBOM.code : 'Add a new BOM record'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" icon={<History size={14} />}>Revision History</Button>
                    <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all"><X size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-white to-slate-50/50">
                {/* BOM Header + Summary */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
                  {/* BOM Header Form */}
                  <Card title="BOM Header">
                    <div className="space-y-3">
                      {/* Row 1 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Input label="BOM / Recipe Code" required value={formData.code || ''} placeholder="Auto-generated" onChange={(e) => updateField('code', e.target.value)} />
                        <Input label="BOM / Recipe Name" required value={formData.name || ''} placeholder="Enter name" onChange={(e) => updateField('name', e.target.value)} />
                        <Input label="Product / Leather" required value={formData.name || ''} placeholder="Enter product" onChange={(e) => updateField('name', e.target.value)} />
                        <Select
                          label="Leather Type"
                          options={[
                            { value: 'cow', label: 'Cow' },
                            { value: 'buffalo', label: 'Buffalo' },
                            { value: 'goat', label: 'Goat' },
                          ]}
                          value={formData.leather_type || 'cow'}
                          onChange={(e) => updateField('leather_type', e.target.value)}
                        />
                      </div>
                      {/* Row 2 */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Select
                          label="Process Type"
                          required
                          options={[
                            { value: 'finishing', label: 'Finishing' },
                            { value: 'tanning', label: 'Tanning' },
                            { value: 'dyeing', label: 'Dyeing' },
                          ]}
                          value={formData.process_type || 'finishing'}
                          onChange={(e) => updateField('process_type', e.target.value)}
                        />
                        <Select
                          label="Thickness"
                          options={[
                            { value: '1.2-1.4', label: '1.2 - 1.4 mm' },
                            { value: '1.4-1.6', label: '1.4 - 1.6 mm' },
                          ]}
                          value={formData.thickness || '1.2-1.4'}
                          onChange={(e) => updateField('thickness', e.target.value)}
                        />
                        <Select
                          label="UOM"
                          options={[
                            { value: 'sqft', label: 'Sq. Ft.' },
                            { value: 'sqm', label: 'Sq. M.' },
                          ]}
                          value={formData.uom || 'sqft'}
                          onChange={(e) => updateField('uom', e.target.value)}
                        />
                      </div>
                      {/* Row 3 */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input label="Valid From" required type="date" value={formData.valid_from || ''} onChange={(e) => updateField('valid_from', e.target.value)} />
                        <Input label="Valid To" type="date" value={formData.valid_to || ''} onChange={(e) => updateField('valid_to', e.target.value)} />
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Status</label>
                          <span className={`inline-flex px-3 py-2 text-xs font-medium rounded-lg ${statusToggle ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
                            {statusToggle ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      {/* Description */}
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-1">Description / Notes</label>
                        <textarea
                          rows={2}
                          value={formData.description || ''}
                          onChange={(e) => updateField('description', e.target.value)}
                          placeholder="Enter description or notes..."
                          className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* BOM Summary */}
                  <Card title="BOM Summary">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Total Items</span>
                        <span className="text-xs font-semibold text-gray-900">:</span>
                        <span className="text-xs font-semibold text-gray-900">{items.length}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Total Qty</span>
                        <span className="text-xs font-semibold text-gray-900">:</span>
                        <span className="text-xs font-semibold text-gray-900">{totalQty.toFixed(3)} (per Sq. Ft.)</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Total Chemical Cost</span>
                        <span className="text-xs font-semibold text-gray-900">:</span>
                        <span className="text-xs font-semibold text-gray-900">Rs 38.42 / Sq. Ft.</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-500">Total Other Cost</span>
                        <span className="text-xs font-semibold text-gray-900">:</span>
                        <span className="text-xs font-semibold text-gray-900">Rs 2.80 / Sq. Ft.</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs font-bold text-gray-900">Total Cost</span>
                        <span className="text-xs font-bold text-gray-900">:</span>
                        <span className="text-xs font-bold text-gray-900">Rs {totalAmount.toFixed(2)} / Sq. Ft.</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* BOM Items Table */}
                <Card>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">BOM Items</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="teal" icon={<Plus size={14} />}>Add Item</Button>
                      <Button size="sm" variant="outline" icon={<Upload size={14} />}>Import from Template</Button>
                      <Button size="sm" variant="danger" icon={<Trash2 size={14} />}>Remove</Button>
                    </div>
                  </div>

                  <Table columns={itemColumns} data={items} />

                  {/* Total Row */}
                  <div className="flex items-center justify-end gap-6 border-t border-gray-200 mt-1 pt-2 text-xs font-semibold text-gray-900">
                    <span>Total Qty: {totalQty.toFixed(3)}</span>
                    <span>Total Amount: ₹{totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Footer note */}
                  <p className="text-[10px] text-amber-600 mt-4">* Qty / Sq. Ft. indicates quantity required per Square Feet</p>
                </Card>

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
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-teal-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedBOM ? (
                    <button onClick={() => selectedBOM?.id && handleDelete(selectedBOM.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95"><Trash2 size={13} /> Delete</button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95" onClick={() => setShowPanel(false)}><RotateCcw size={13} /> Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-lg shadow-md shadow-teal-200 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"><Save size={13} /> {saving ? 'Saving...' : selectedBOM ? 'Update' : 'Save BOM'}</button>
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
        title="Delete BOM"
        message="Are you sure you want to delete this BOM? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
