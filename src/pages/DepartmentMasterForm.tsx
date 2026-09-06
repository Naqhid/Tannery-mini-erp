import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Building2 } from 'lucide-react';
import Input from '../components/ui/Input';
import api from '../lib/api';

export default function DepartmentMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({ code: '', name: '', description: '', status: 'Active' });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchRecord = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { next_code: string } }>('/departments/next-code');
        if (res.data?.next_code) setForm(p => ({ ...p, code: res.data.next_code }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/departments/${id}`);
      setForm({
        code: res.data.code || '',
        name: res.data.name || '',
        description: res.data.description || '',
        status: res.data.status || 'Active',
      });
    } catch {
      toast.error('Failed to load');
      navigate('/department-master');
    } finally {
      setLoading(false);
    }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (isNew) {
        await api('/departments', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Department created!');
      } else {
        await api(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Department updated!');
      }
      navigate('/department-master');
    } catch (err) {
      toast.error('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/department-master')}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl shadow-indigo-500/30 ring-2 ring-white/50">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {isNew ? 'New Department' : 'Edit Department'}
            </h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {form.code || 'Auto-generated code'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">Department Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Code</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {form.code || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Enter department name"
          />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Enter description"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">Status</h2>
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
          <span className={`text-xs font-bold uppercase ${form.status === 'Active' ? 'text-emerald-600' : 'text-gray-500'}`}>
            {form.status}
          </span>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
