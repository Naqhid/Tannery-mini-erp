import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Package } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';
import { useDropdowns } from '../lib/useDropdowns';

interface ProductData {
  id?: number;
  code: string;
  name: string;
  category_id: string;
  leather_type_id: string;
  primary_uom_id: string;
  secondary_uom_id: string;
  thickness_id: string;
  standard_size_id: string;
  color_id: string;
  finish_type_id: string;
  grade_id: string;
  hsn_code_id: string;
  description: string;
  status: string;
}

const empty: ProductData = {
  code: '', name: '', category_id: '', leather_type_id: '', primary_uom_id: '', secondary_uom_id: '',
  thickness_id: '', standard_size_id: '', color_id: '', finish_type_id: '', grade_id: '',
  hsn_code_id: '', description: '', status: 'Active',
};

export default function ProductMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const dropdowns = useDropdowns([
    'product-categories', 'leather-types', 'uom', 'thickness',
    'standard-sizes', 'colors', 'finish-types', 'grades', 'hsn-codes',
  ]);

  const [form, setForm] = useState<ProductData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchProduct = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: ProductData }>(`/products/${id}`);
      setForm({ ...empty, ...res.data });
    } catch { toast.error('Failed to load product'); navigate('/product-master'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const update = (key: keyof ProductData, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
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
      const payload = { ...form };
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
          <Input label="Product Name" required value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} placeholder="Enter product name" />
          <Select label="Category" required options={[{ value: '', label: 'Select category' }, ...(dropdowns['product-categories']?.options || [])]} value={form.category_id} onChange={(e) => update('category_id', e.target.value)} error={errors.category_id} />
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
          <Select label="HSN Code" options={[{ value: '', label: 'Select HSN Code' }, ...(dropdowns['hsn-codes']?.options || [])]} value={form.hsn_code_id} onChange={(e) => update('hsn_code_id', e.target.value)} />
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
