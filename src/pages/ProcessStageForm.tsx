import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, GitBranch } from 'lucide-react';
import Input from '../components/ui/Input';
import SearchableSelect from '../components/ui/SearchableSelect';
import api from '../lib/api';

interface UomOption { id: number; code: string; name: string; }

export default function ProcessStageForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({ code: '', name: '', seq: '', uom: '', description: '', status: 'Active' });
  const [uomOptions, setUomOptions] = useState<UomOption[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: UomOption[] }>('/uom/dropdown');
        setUomOptions(res.data || []);
      } catch {}
    })();
  }, []);

  const fetchRecord = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { next_code: string } }>('/process-stages/next-code');
        if (res.data?.next_code) setForm(p => ({ ...p, code: res.data.next_code }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/process-stages/${id}`);
      setForm({ code: res.data.code || '', name: res.data.name || '', seq: String(res.data.seq || ''), uom: res.data.uom || '', description: res.data.description || '', status: res.data.status || 'Active' });
    } catch { toast.error('Failed to load'); navigate('/process-stage'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, status: form.status || 'Active' };
      if (isNew) {
        await api('/process-stages', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Process Stage created!');
      } else {
        await api(`/process-stages/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Process Stage updated!');
      }
      navigate('/process-stage');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/process-stage')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <GitBranch size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Process Stage' : 'Edit Process Stage'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">Process Stage Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Code</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {form.code || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Input label="Name" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter process stage name" />
          <Input label="Sequence" value={form.seq} onChange={(e) => setForm(p => ({ ...p, seq: e.target.value }))} placeholder="Display order" />
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">UOM</label>
            <SearchableSelect
              options={uomOptions.map(u => ({ value: u.name, label: u.name }))}
              value={form.uom}
              onChange={(val) => setForm(p => ({ ...p, uom: val }))}
              placeholder="Search UOM..."
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter description" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">Status</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</span>
          <button
            onClick={() => setForm(p => ({ ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' }))}
            className={`relative w-12 h-6 rounded-full transition-all ${form.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}
            role="switch"
            aria-checked={form.status === 'Active'}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${form.status === 'Active' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-xs font-bold uppercase ${form.status === 'Active' ? 'text-emerald-600' : 'text-gray-500'}`}>{form.status}</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
