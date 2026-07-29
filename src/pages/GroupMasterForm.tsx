import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Layers } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';
import { useDropdowns } from '../lib/useDropdowns';

interface GroupData {
  id?: number;
  code: string;
  name: string;
  category_id: string;
  hsn_code: string;
  gst_rate: string;
  description: string;
  status: string;
}

const empty: GroupData = {
  code: '', name: '', category_id: '', hsn_code: '', gst_rate: '18', description: '', status: 'Active',
};

export default function GroupMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const dropdowns = useDropdowns(['product-categories']);

  const [form, setForm] = useState<GroupData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRecord = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: GroupData }>(`/group-master/${id}`);
      setForm({ ...empty, ...res.data, category_id: String(res.data.category_id || ''), gst_rate: String(res.data.gst_rate || '18') });
    } catch { toast.error('Failed to load group'); navigate('/group-master'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const update = (key: keyof GroupData, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Group name is required';
    if (!form.category_id) errs.category_id = 'Product category is required';
    if (!form.hsn_code.trim()) errs.hsn_code = 'HSN code is required';
    if (!form.gst_rate.trim()) errs.gst_rate = 'GST rate is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (isNew) {
        const res = await api<{ message: string }>('/group-master', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Group created!');
      } else {
        const res = await api<{ message: string }>(`/group-master/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Group updated!');
      }
      navigate('/group-master');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/group-master')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30 ring-2 ring-white/50">
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Group' : 'Edit Group'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-violet-700 uppercase tracking-wide mb-4">Group Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Group Code</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {form.code || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Input label="Group Name" required value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} placeholder="Enter group name" />
          <Select label="Product Category" required options={[{ value: '', label: 'Select category' }, ...(dropdowns['product-categories']?.options || [])]} value={form.category_id} onChange={(e) => update('category_id', e.target.value)} error={errors.category_id} />
          <Input label="HSN Code" required value={form.hsn_code} onChange={(e) => update('hsn_code', e.target.value)} error={errors.hsn_code} placeholder="Enter HSN code" />
          <Input label="GST Rate (%)" required value={form.gst_rate} onChange={(e) => update('gst_rate', e.target.value)} error={errors.gst_rate} placeholder="e.g. 18" />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-violet-700 uppercase tracking-wide mb-4">Additional Details</h2>
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Enter description..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none" />
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-violet-700 uppercase tracking-wide mb-4">Status</h2>
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
        <button onClick={() => navigate('/group-master')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
