import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Package } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';
import { useDropdowns } from '../lib/useDropdowns';

interface GroupOption {
  id: number;
  code: string;
  name: string;
  category_id: number;
  hsn_code: string;
  gst_rate: number;
}

interface ProductData {
  id?: number;
  code: string;
  name: string;
  category_id: string;
  group_id: string;
  leather_type_id: string;
  primary_uom_id: string;
  secondary_uom_id: string;
  thickness_id: string;
  standard_size_id: string;
  color_id: string;
  finish_type_id: string;
  grade_id: string;
  hsn_code_id: string;
  hsn_code_display: string;
  description: string;
  status: string;
}

const empty: ProductData = {
  code: '', name: '', category_id: '', group_id: '', leather_type_id: '', primary_uom_id: '', secondary_uom_id: '',
  thickness_id: '', standard_size_id: '', color_id: '', finish_type_id: '', grade_id: '',
  hsn_code_id: '', hsn_code_display: '', description: '', status: 'Active',
};

export default function ProductMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const dropdowns = useDropdowns([
    'product-categories', 'leather-types', 'uom', 'thickness',
    'standard-sizes', 'colors', 'finish-types', 'grades', 'hsn-codes', 'group-master',
  ]);

  const [form, setForm] = useState<ProductData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredGroups, setFilteredGroups] = useState<GroupOption[]>([]);

  const fetchProduct = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { code: string } }>('/products/next-code');
        if (res.data?.code) setForm((p) => ({ ...p, code: res.data.code }));
      } catch { /* ignore preview failure */ }
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/products/${id}`);
      const d = res.data;
      setForm({
        ...empty,
        ...d,
        category_id: d.category_id ? String(d.category_id) : '',
        group_id: d.group_id ? String(d.group_id) : '',
        leather_type_id: d.leather_type_id ? String(d.leather_type_id) : '',
        primary_uom_id: d.uom_id ? String(d.uom_id) : '',
        secondary_uom_id: d.secondary_uom_id ? String(d.secondary_uom_id) : '',
        thickness_id: d.thickness_id ? String(d.thickness_id) : '',
        standard_size_id: d.standard_size_id ? String(d.standard_size_id) : '',
        color_id: d.color_id ? String(d.color_id) : '',
        finish_type_id: d.finish_type_id ? String(d.finish_type_id) : '',
        grade_id: d.grade_id ? String(d.grade_id) : '',
        hsn_code_id: d.hsn_code_id ? String(d.hsn_code_id) : '',
        hsn_code_display: d.group_hsn_code || '',
      });
    } catch { toast.error('Failed to load product'); navigate('/product-master'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  // Auto-populate product name = leather type + finish type + color
  useEffect(() => {
    const leather = dropdowns['leather-types']?.data?.find((o: any) => String(o.id) === form.leather_type_id);
    const finish = dropdowns['finish-types']?.data?.find((o: any) => String(o.id) === form.finish_type_id);
    const color = dropdowns['colors']?.data?.find((o: any) => String(o.id) === form.color_id);
    const parts = [leather?.name, finish?.name, color?.name].filter(Boolean);
    const autoName = parts.join(' ');
    setForm(p => (p.name === autoName ? p : { ...p, name: autoName }));
  }, [
    form.leather_type_id, form.finish_type_id, form.color_id,
    dropdowns['leather-types']?.data, dropdowns['finish-types']?.data, dropdowns['colors']?.data,
  ]);

  // Filter groups by selected category (show all if no category selected)
  useEffect(() => {
    if (dropdowns['group-master']?.data) {
      if (form.category_id) {
        const filtered = dropdowns['group-master'].data.filter(
          (g: any) => !g.category_id || String(g.category_id) === form.category_id
        );
        setFilteredGroups(filtered as unknown as GroupOption[]);
      } else {
        setFilteredGroups(dropdowns['group-master'].data as unknown as GroupOption[]);
      }
    } else {
      setFilteredGroups([]);
    }
  }, [form.category_id, dropdowns['group-master']?.data]);

  const update = (key: keyof ProductData, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  // When category changes, reset group and HSN
  const handleCategoryChange = (value: string) => {
    setForm(p => ({ ...p, category_id: value, group_id: '', hsn_code_display: '' }));
    setErrors(p => { const n = { ...p }; delete n['category_id']; return n; });
  };

  // When group changes, auto-populate HSN
  const handleGroupChange = (value: string) => {
    setForm(p => {
      const updated = { ...p, group_id: value };
      if (value) {
        const group = filteredGroups.find(g => String(g.id) === value);
        if (group) {
          updated.hsn_code_display = `${group.hsn_code} (GST: ${group.gst_rate}%)`;
        }
      } else {
        updated.hsn_code_display = '';
      }
      return updated;
    });
    setErrors(p => { const n = { ...p }; delete n['group_id']; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.category_id) errs.category_id = 'Category is required';
    if (!form.leather_type_id) errs.leather_type_id = 'Leather type is required';
    if (!form.primary_uom_id) errs.primary_uom_id = 'Primary UOM is required';
    if (!form.thickness_id) errs.thickness_id = 'Thickness is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      const payload: any = { ...form };
      delete payload.hsn_code_display;
      // Map frontend field names to backend field names
      payload.uom_id = payload.primary_uom_id || null;
      delete payload.primary_uom_id;
      if (isNew) {
        const res = await api<{ message: string }>('/products', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Product created!');
      } else {
        const res = await api<{ message: string }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Product updated!');
      }
      navigate('/product-master');
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
          <button onClick={() => navigate('/product-master')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Product' : 'Edit Product'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Product Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Product Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Product Name" required value={form.name} disabled readOnly error={errors.name} placeholder="Auto: Leather Type + Finish Type + Color" />
          <Select label="Category" required options={[{ value: '', label: 'Select category' }, ...(dropdowns['product-categories']?.options || [])]} value={form.category_id} onChange={(e) => handleCategoryChange(e.target.value)} error={errors.category_id} />
          <Select
            label="Group"
            options={[
              { value: '', label: form.category_id ? 'Select group' : 'Select category first' },
              ...filteredGroups.map(g => ({ value: String(g.id), label: g.name })),
            ]}
            value={form.group_id}
            onChange={(e) => handleGroupChange(e.target.value)}
          />
          <Select label="Leather Type" required options={[{ value: '', label: 'Select leather type' }, ...(dropdowns['leather-types']?.options || [])]} value={form.leather_type_id} onChange={(e) => update('leather_type_id', e.target.value)} error={errors.leather_type_id} />
          <Select label="Primary UOM" required options={[{ value: '', label: 'Select Primary UOM' }, ...(dropdowns['uom']?.options || [])]} value={form.primary_uom_id} onChange={(e) => update('primary_uom_id', e.target.value)} error={errors.primary_uom_id} />
          <Select label="Secondary UOM" options={[{ value: '', label: 'Select Secondary UOM' }, ...(dropdowns['uom']?.options || [])]} value={form.secondary_uom_id} onChange={(e) => update('secondary_uom_id', e.target.value)} />
          <Select label="Thickness" required options={[{ value: '', label: 'Select thickness' }, ...(dropdowns['thickness']?.options || [])]} value={form.thickness_id} onChange={(e) => update('thickness_id', e.target.value)} error={errors.thickness_id} />
        </div>
      </div>

      {/* Section 2: Specifications */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">2. Specifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select label="Standard Size" options={[{ value: '', label: 'Select size' }, ...(dropdowns['standard-sizes']?.options || [])]} value={form.standard_size_id} onChange={(e) => update('standard_size_id', e.target.value)} />
          <Select label="Color" options={[{ value: '', label: 'Select color' }, ...(dropdowns['colors']?.options || [])]} value={form.color_id} onChange={(e) => update('color_id', e.target.value)} />
          <Select label="Finish Type" options={[{ value: '', label: 'Select finish type' }, ...(dropdowns['finish-types']?.options || [])]} value={form.finish_type_id} onChange={(e) => update('finish_type_id', e.target.value)} />
          <Select label="Grade" options={[{ value: '', label: 'Select grade' }, ...(dropdowns['grades']?.options || [])]} value={form.grade_id} onChange={(e) => update('grade_id', e.target.value)} />
          {/* HSN auto-populated from group */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">HSN Code <span className="text-gray-400">(from Group)</span></label>
            <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-h-[38px] flex items-center">
              {form.hsn_code_display || <span className="italic text-gray-400">Select a group to auto-populate</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Additional Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Additional Details</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Enter product description..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Section 4: Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">4. Status</h2>
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
        <button onClick={() => navigate('/product-master')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
