import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, FlaskConical, Upload, Paperclip } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';
import { useDropdowns } from '../lib/useDropdowns';

interface Supplier { id: number; name: string; code: string; }
interface GroupOption { id: number; code: string; name: string; category_id: number; hsn_code: string; gst_rate: number; }

interface MaterialData {
  id?: number;
  code: string;
  name: string;
  category: string;
  group_id: string;
  type: string;
  uom: string;
  primary_uom_id: string;
  secondary_uom_id: string;
  currency: string;
  chemical_group: string;
  color: string;
  ph_value: string;
  flash_point: string;
  hsn_code: string;
  hsn_code_display: string;
  cas_number: string;
  shelf_life: string;
  storage_condition: string;
  hazardous: boolean;
  default_warehouse: string;
  opening_stock: string;
  opening_stock_uom: string;
  standard_cost: string;
  current_stock: string;
  reorder_level: string;
  maximum_level: string;
  preferred_supplier_id: string;
  lead_time: string;
  description: string;
  application: string;
  remarks: string;
  attachment_path: string;
  status: string;
}

const empty: MaterialData = {
  code: '', name: '', category: '', group_id: '', type: 'Wet-end', uom: '',
  primary_uom_id: '', secondary_uom_id: '', currency: 'INR', chemical_group: '',
  color: '', ph_value: '', flash_point: '', hsn_code: '', hsn_code_display: '', cas_number: '',
  shelf_life: '', storage_condition: '', hazardous: false, default_warehouse: '',
  opening_stock: '0', opening_stock_uom: '', standard_cost: '0',
  current_stock: '0.00', reorder_level: '0.00', maximum_level: '0.00',
  preferred_supplier_id: '', lead_time: '',
  description: '', application: '', remarks: '', attachment_path: '', status: 'Active',
};

const MATERIAL_TYPES = ['Wet-end', 'Finishing'];
const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];
const STORAGE_CONDITIONS = ['Room Temperature', 'Cool & Dry', 'Refrigerated', 'Flammable Storage', 'Ventilated Area'];

interface Warehouse { id: number; name: string; code?: string; }

export default function MaterialMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const dropdowns = useDropdowns(['uom', 'product-categories', 'group-master']);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form, setForm] = useState<MaterialData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filteredGroups, setFilteredGroups] = useState<GroupOption[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api<{ data: Supplier[] }>('/suppliers?limit=500');
      setSuppliers(res.data || []);
    } catch { setSuppliers([]); }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api<{ data: Warehouse[] }>('/warehouses/dropdown');
      setWarehouses(res.data || []);
    } catch { setWarehouses([]); }
  }, []);

  const fetchMaterial = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: MaterialData }>(`/materials/${id}`);
      setForm({
        ...empty, ...res.data,
        hazardous: !!(res.data as any).hazardous,
        opening_stock: String((res.data as any).opening_stock ?? '0'),
        opening_stock_uom: String((res.data as any).opening_stock_uom ?? ''),
        standard_cost: String((res.data as any).standard_cost ?? '0'),
        current_stock: String((res.data as any).current_stock ?? '0.00'),
        reorder_level: String((res.data as any).reorder_level ?? '0.00'),
        maximum_level: String((res.data as any).maximum_level ?? '0.00'),
        shelf_life: String((res.data as any).shelf_life ?? ''),
        lead_time: String((res.data as any).lead_time ?? ''),
        preferred_supplier_id: String((res.data as any).preferred_supplier_id ?? ''),
        group_id: String((res.data as any).group_id ?? ''),
        primary_uom_id: String((res.data as any).primary_uom_id ?? ''),
        secondary_uom_id: String((res.data as any).secondary_uom_id ?? ''),
        currency: (res.data as any).currency || 'INR',
      });
    } catch { toast.error('Failed to load material'); navigate('/chemical-master'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchMaterial(); fetchSuppliers(); fetchWarehouses(); }, [fetchMaterial, fetchSuppliers, fetchWarehouses]);

  // Filter groups based on category selection
  useEffect(() => {
    if (form.category && dropdowns['group-master']?.data) {
      // Find category_id from name
      const cat = dropdowns['product-categories']?.data?.find((c: any) => c.name === form.category || String(c.id) === form.category);
      if (cat) {
        const filtered = dropdowns['group-master'].data.filter(
          (g: any) => String(g.category_id) === String(cat.id)
        );
        setFilteredGroups(filtered as unknown as GroupOption[]);
      } else {
        // Show all groups if category not matched
        setFilteredGroups(dropdowns['group-master'].data as unknown as GroupOption[]);
      }
    } else {
      setFilteredGroups(dropdowns['group-master']?.data as unknown as GroupOption[] || []);
    }
  }, [form.category, dropdowns['group-master']?.data, dropdowns['product-categories']?.data]);

  // Auto-populate HSN when group changes
  useEffect(() => {
    if (form.group_id && dropdowns['group-master']?.data) {
      const group = dropdowns['group-master'].data.find((g: any) => String(g.id) === form.group_id) as any;
      if (group) {
        setForm(p => ({ ...p, hsn_code_display: `${group.hsn_code} (GST: ${group.gst_rate}%)` }));
      }
    } else {
      setForm(p => ({ ...p, hsn_code_display: '' }));
    }
  }, [form.group_id, dropdowns['group-master']?.data]);

  const update = (key: keyof MaterialData, value: any) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const handleGroupChange = (value: string) => {
    setForm(p => ({ ...p, group_id: value }));
    setErrors(p => { const n = { ...p }; delete n['group_id']; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Material name is required';
    if (!form.type) errs.type = 'Material type is required';
    if (!form.primary_uom_id) errs.primary_uom_id = 'Primary UOM is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      const payload = { ...form, hazardous: form.hazardous ? 1 : 0 };
      delete (payload as any).hsn_code_display;
      if (isNew) {
        const res = await api<{ message: string }>('/materials', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material created!');
      } else {
        const res = await api<{ message: string }>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material updated!');
      }
      navigate('/chemical-master');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handleFileUpload = async (file: File) => {
    if (!form.id) {
      toast.info('Save the material first before uploading an attachment.');
      return;
    }
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('tannery_token');
      const res = await fetch(`/api/materials/${form.id}/attachment`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
      const data = await res.json();
      setForm(prev => ({ ...prev, attachment_path: data.data.file_path }));
      toast.success('Attachment uploaded!');
    } catch (err) {
      toast.error('Upload failed: ' + (err as Error).message);
    } finally { setUploadingFile(false); }
  };

  const supplierOptions = [
    { value: '', label: 'Select supplier' },
    ...suppliers.map(s => ({ value: String(s.id), label: `${s.code} - ${s.name}` })),
  ];

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
          <button onClick={() => navigate('/chemical-master')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <FlaskConical size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Material' : 'Edit Material'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Material Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Material Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Material Name" required value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} placeholder="Enter material name" />
          <Select label="Category" options={[{ value: '', label: 'Select Category' }, ...(dropdowns['product-categories']?.options || [])]} value={form.category} onChange={(e) => update('category', e.target.value)} />
          <Select label="Material Type" required options={[{ value: '', label: 'Select type' }, ...MATERIAL_TYPES.map(t => ({ value: t, label: t }))]} value={form.type} onChange={(e) => { update('type', e.target.value); }} error={errors.type} />
          <Select
            label="Group"
            options={[
              { value: '', label: 'Select group' },
              ...filteredGroups.map(g => ({ value: String(g.id), label: g.name })),
            ]}
            value={form.group_id}
            onChange={(e) => handleGroupChange(e.target.value)}
          />
          <Select label="Primary UOM" required options={[{ value: '', label: 'Select Primary UOM' }, ...(dropdowns['uom']?.options || [])]} value={form.primary_uom_id} onChange={(e) => update('primary_uom_id', e.target.value)} error={errors.primary_uom_id} />
          <Select label="Secondary UOM" options={[{ value: '', label: 'NA' }, ...(dropdowns['uom']?.options || [])]} value={form.secondary_uom_id} onChange={(e) => update('secondary_uom_id', e.target.value)} />
          <Select label="Currency" options={CURRENCY_OPTIONS} value={form.currency} onChange={(e) => update('currency', e.target.value)} />
          {/* HSN auto-populated from group */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">HSN Code <span className="text-gray-400">(from Group)</span></label>
            <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-h-[38px] flex items-center">
              {form.hsn_code_display || <span className="italic text-gray-400">Select a group to auto-populate</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Properties */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">2. Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Color" value={form.color} onChange={(e) => update('color', e.target.value)} placeholder="Enter color" />
          <Input label="pH Value" value={form.ph_value} onChange={(e) => update('ph_value', e.target.value)} placeholder="Enter pH value" />
          <Input label="Flash Point (°C)" value={form.flash_point} onChange={(e) => update('flash_point', e.target.value)} placeholder="Enter flash point" />
          <Input label="CAS No." value={form.cas_number} onChange={(e) => update('cas_number', e.target.value)} placeholder="Enter CAS number" />
          <Input label="Shelf Life (Months)" type="number" value={form.shelf_life} onChange={(e) => update('shelf_life', e.target.value)} placeholder="Enter shelf life" />
          <Select label="Storage Condition" options={[{ value: '', label: 'Select storage condition' }, ...STORAGE_CONDITIONS.map(s => ({ value: s, label: s }))]} value={form.storage_condition} onChange={(e) => update('storage_condition', e.target.value)} />
          <Select label="Hazardous" options={[{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }]} value={String(form.hazardous)} onChange={(e) => update('hazardous', e.target.value === 'true')} />
        </div>
      </div>

      {/* Section 3: Inventory */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Opening Stock Quantity" type="number" value={form.opening_stock} onChange={(e) => update('opening_stock', e.target.value)} placeholder="0" />
          <Select label="Opening Stock UOM" options={[{ value: '', label: 'Same as Primary UOM' }, ...(dropdowns['uom']?.options || [])]} value={form.opening_stock_uom} onChange={(e) => update('opening_stock_uom', e.target.value)} />
          <Input label="Average Rate" type="number" value={form.standard_cost} onChange={(e) => update('standard_cost', e.target.value)} placeholder="0.00" />
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Opening Stock Value</label>
            <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
              {(parseFloat(form.opening_stock || '0') * parseFloat(form.standard_cost || '0')).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <Select label="Default Warehouse" options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map(w => ({ value: w.name, label: w.name }))]} value={form.default_warehouse} onChange={(e) => update('default_warehouse', e.target.value)} />
          <Input label="Reorder Level" type="number" value={form.reorder_level} onChange={(e) => update('reorder_level', e.target.value)} placeholder="0.00" />
          <Input label="Maximum Level" type="number" value={form.maximum_level} onChange={(e) => update('maximum_level', e.target.value)} placeholder="0.00" />
          <Select label="Preferred Supplier" options={supplierOptions} value={form.preferred_supplier_id} onChange={(e) => update('preferred_supplier_id', e.target.value)} />
          <Input label="Lead Time (Days)" type="number" value={form.lead_time} onChange={(e) => update('lead_time', e.target.value)} placeholder="Enter lead time" />
        </div>
      </div>

      {/* Section 4: Additional Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">4. Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Enter description" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Application / Use</label>
            <textarea rows={4} value={form.application} onChange={(e) => update('application', e.target.value)} placeholder="Enter application or use" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Remarks</label>
            <textarea rows={4} value={form.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Enter remarks" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
        </div>

        {/* Attachment */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-900 mb-2">Attachment (SDS / Specification / COA)</label>
          {form.attachment_path ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Paperclip size={14} className="text-gray-400" />
              <span className="text-xs text-blue-600 font-medium truncate">{form.attachment_path.split('/').pop()}</span>
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

      {/* Section 5: Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">5. Status</h2>
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
        <button onClick={() => navigate('/chemical-master')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
