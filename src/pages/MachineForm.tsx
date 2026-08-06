import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Factory } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Supplier { id: number; code: string; name: string; }

interface MachineData {
  id?: number;
  code: string;
  name: string;
  machine_type: string;
  uom_type: string;
  rate_indian: string;
  rate_imported: string;
  supplier_id: string;
  description: string;
  status: string;
}

const empty: MachineData = {
  code: '', name: '', machine_type: '', uom_type: '', rate_indian: '', rate_imported: '', supplier_id: '', description: '', status: 'Active',
};

export default function MachineForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<MachineData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api<{ data: Supplier[] }>('/suppliers?limit=500');
      setSuppliers(res.data || []);
    } catch { setSuppliers([]); }
  }, []);

  const fetchMachine = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/machines/${id}`);
      const d = res.data;
      setForm({
        ...empty,
        ...d,
        rate_indian: d.rate_indian != null ? String(d.rate_indian) : '',
        rate_imported: d.rate_imported != null ? String(d.rate_imported) : '',
        supplier_id: d.supplier_id ? String(d.supplier_id) : '',
      });
    } catch { toast.error('Failed to load machine'); navigate('/machine'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchMachine(); fetchSuppliers(); }, [fetchMachine, fetchSuppliers]);

  const update = (key: keyof MachineData, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Machine name is required';
    if (!form.machine_type) errs.machine_type = 'Machine type is required';
    if (!form.uom_type) errs.uom_type = 'UOM is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (isNew) {
        const res = await api<{ message: string }>('/machines', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Machine created!');
      } else {
        const res = await api<{ message: string }>(`/machines/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Machine updated!');
      }
      navigate('/machine');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/machine')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-700 shadow-xl shadow-gray-500/30 ring-2 ring-white/50">
            <Factory size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Machine / Equipment' : 'Edit Machine / Equipment'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Machine Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Machine Code" value={form.code} disabled onChange={() => {}} placeholder="Auto-generated" />
          <Input label="Machine Name" required value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} placeholder="Enter machine name" />
          <Select label="Machine Type" required options={[
            { value: '', label: 'Select Machine Type' },
            { value: 'Wet End', label: 'Wet End' },
            { value: 'Finishing', label: 'Finishing' },
          ]} value={form.machine_type} onChange={(e) => update('machine_type', e.target.value)} error={errors.machine_type} />
          <Select label="UOM" required options={[
            { value: '', label: 'Select UOM' },
            { value: 'Per Hour', label: 'Per Hour' },
            { value: 'Per Pcs', label: 'Per Pcs' },
          ]} value={form.uom_type} onChange={(e) => update('uom_type', e.target.value)} error={errors.uom_type} />
          <Input label="Rate (Indian)" value={form.rate_indian} onChange={(e) => update('rate_indian', e.target.value)} placeholder="e.g. 150.00" />
          <Input label="Rate (Imported)" value={form.rate_imported} onChange={(e) => update('rate_imported', e.target.value)} placeholder="e.g. 250.00" />
          <Select label="Supplier / Vendor" options={[
            { value: '', label: 'Select supplier' },
            ...suppliers.map(s => ({ value: String(s.id), label: `${s.code} - ${s.name}` })),
          ]} value={form.supplier_id} onChange={(e) => update('supplier_id', e.target.value)} />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Enter description..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</span>
          <button
            onClick={() => update('status', form.status === 'Active' ? 'Inactive' : 'Active')}
            className={`relative w-12 h-6 rounded-full transition-all ${form.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}
            role="switch"
            aria-checked={form.status === 'Active'}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${form.status === 'Active' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-xs font-bold uppercase ${form.status === 'Active' ? 'text-emerald-600' : 'text-gray-500'}`}>
            {form.status}
          </span>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/machine')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-slate-600 to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
