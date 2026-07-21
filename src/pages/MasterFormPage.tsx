import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface FormFieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

interface MasterFormPageProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  apiEndpoint: string;
  listRoute: string;
  formFields: FormFieldDef[];
  emptyData: Record<string, any>;
}

export default function MasterFormPage({ title, icon, iconColor, apiEndpoint, listRoute, formFields, emptyData }: MasterFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<Record<string, any>>(emptyData);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRecord = useCallback(async () => {
    if (isNew) {
      // Fetch next auto-generated code
      try {
        const res = await api<{ data: { next_code: string } }>(`${apiEndpoint}/next-code`);
        if (res.data?.next_code) {
          setForm(prev => ({ ...prev, code: res.data.next_code }));
        }
      } catch { /* API may not support this, code will be generated server-side */ }
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`${apiEndpoint}/${id}`);
      setForm({ ...emptyData, ...res.data });
    } catch { toast.error(`Failed to load ${title.toLowerCase()}`); navigate(listRoute); }
    finally { setLoading(false); }
  }, [id, isNew, navigate, apiEndpoint, listRoute, title]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const update = (key: string, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const field of formFields) {
      if (field.required && !String(form[field.key] || '').trim()) {
        errs[field.key] = `${field.label} is required`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      const payload = { ...form, status: form.status || 'Active' };
      if (isNew) {
        const res = await api<{ message: string }>(apiEndpoint, { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || `${title} created!`);
      } else {
        const res = await api<{ message: string }>(`${apiEndpoint}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || `${title} updated!`);
      }
      navigate(listRoute);
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
          <button onClick={() => navigate(listRoute)} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconColor} shadow-xl shadow-blue-500/30 ring-2 ring-white/50`}>
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? `New ${title}` : `Edit ${title}`}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">{title} Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formFields.map((field) => {
            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-900 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    value={form[field.key] || ''}
                    onChange={(e) => update(field.key, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${errors[field.key] ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors[field.key] && <p className="mt-1 text-xs text-red-500">{errors[field.key]}</p>}
                </div>
              );
            }
            if (field.type === 'select') {
              return (
                <Select
                  key={field.key}
                  label={field.label}
                  required={field.required}
                  options={field.options || []}
                  value={form[field.key] || ''}
                  onChange={(e) => update(field.key, e.target.value)}
                  error={errors[field.key]}
                />
              );
            }
            // For disabled code fields, show the value or indicate auto-generation
            if (field.disabled && field.key === 'code') {
              return (
                <div key={field.key} className="w-full">
                  <label className="block text-xs font-medium text-gray-900 mb-1">{field.label}</label>
                  <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
                    {form[field.key] || <span className="italic">Will be auto-generated on save</span>}
                  </div>
                </div>
              );
            }
            return (
              <Input
                key={field.key}
                label={field.label}
                required={field.required}
                value={form[field.key] || ''}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                onChange={(e) => update(field.key, e.target.value)}
                error={errors[field.key]}
                disabled={field.disabled}
                readOnly={field.disabled}
              />
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">Status</h2>
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
        <button onClick={() => navigate(listRoute)} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
