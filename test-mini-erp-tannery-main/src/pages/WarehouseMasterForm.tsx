import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save, X, ArrowLeft, Upload, Trash2, FileText, MapPin, Settings,
  Building2, Thermometer, Package, User, Phone, Mail, Calendar,
  Warehouse, Layers, AlertCircle,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse {
  id?: number;
  code: string;
  name: string;
  short_name: string;
  warehouse_type: string;
  parent_warehouse_id: string;
  is_default: string;
  location_address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  store_keeper: string;
  cost_center: string;
  opening_date: string;
  total_area: string;
  usable_area: string;
  storage_condition: string;
  temperature_control: string;
  humidity_control: string;
  handling_equipment: string;
  material_movement_type: string;
  allow_negative_stock: boolean;
  notes: string;
  remarks: string;
  status: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

interface WarehouseOption {
  id: number;
  code: string;
  name: string;
  warehouse_type: string;
}

const empty: Warehouse = {
  code: '', name: '', short_name: '', warehouse_type: 'Raw Material', parent_warehouse_id: '',
  is_default: 'No', location_address: '', city: '', state: '', country: '', pincode: '',
  phone: '', email: '', store_keeper: '', cost_center: '', opening_date: '', total_area: '',
  usable_area: '', storage_condition: 'Dry', temperature_control: 'No', humidity_control: 'No',
  handling_equipment: '', material_movement_type: 'FIFO', allow_negative_stock: false,
  notes: '', remarks: '', status: 'Active',
};

const WH_TYPES = [
  { value: 'Raw Material', label: 'Raw Material' },
  { value: 'Finished Goods', label: 'Finished Goods' },
  { value: 'Semi-Finished', label: 'Semi-Finished' },
  { value: 'WIP', label: 'Work In Progress' },
  { value: 'Consumable', label: 'Consumable' },
  { value: 'Quarantine', label: 'Quarantine' },
];

const STORAGE_CONDITIONS = [
  { value: 'Dry', label: 'Dry' },
  { value: 'Cold', label: 'Cold' },
  { value: 'Humid', label: 'Humid' },
  { value: 'Refrigerated', label: 'Refrigerated' },
  { value: 'Ambient', label: 'Ambient' },
];

const MOVEMENT_TYPES = [
  { value: 'FIFO', label: 'FIFO' },
  { value: 'LIFO', label: 'LIFO' },
  { value: 'FEFO', label: 'FEFO' },
  { value: 'Weighted Average', label: 'Weighted Average' },
];

const YES_NO = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const TABS = [
  { key: 'basic', label: 'Basic Info', icon: Building2 },
  { key: 'address', label: 'Address & Contact', icon: MapPin },
  { key: 'capacity', label: 'Capacity & Settings', icon: Settings },
  { key: 'documents', label: 'Documents', icon: FileText },
];

export default function WarehouseMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<Warehouse>(empty);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [statusActive, setStatusActive] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api<{ data: WarehouseOption[] }>('/warehouses/dropdown');
      setWarehouses((res.data || []).filter((w) => w.id !== Number(id)));
    } catch { setWarehouses([]); }
  }, [id]);

  const fetchWarehouse = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: Warehouse }>(`/warehouses/${id}`);
      const d = res.data;
      setForm({
        ...empty,
        ...d,
        parent_warehouse_id: d.parent_warehouse_id ? String(d.parent_warehouse_id) : '',
        opening_date: d.opening_date?.split('T')[0] || '',
        allow_negative_stock: Boolean(d.allow_negative_stock),
      });
      setStatusActive(d.status === 'Active');
    } catch { toast.error('Failed to load warehouse'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchWarehouse(); fetchWarehouses(); }, [fetchWarehouse, fetchWarehouses]);

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.name) { toast.error('Warehouse name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, status: statusActive ? 'Active' : 'Inactive' };
      if (isNew) {
        const res = await api('/warehouses', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Warehouse created!');
        navigate('/warehouse-master');
      } else {
        const res = await api(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Warehouse updated!');
        navigate('/warehouse-master');
      }
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('tannery_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/warehouses/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      toast.success('File uploaded!');
      fetchWarehouse();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await api(`/warehouses/${id}/attachments/${attachmentId}`, { method: 'DELETE' });
      toast.success('Attachment deleted');
      fetchWarehouse();
    } catch { toast.error('Delete failed'); }
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
          <button onClick={() => navigate('/warehouse-master')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <Warehouse size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Warehouse' : 'Edit Warehouse'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/warehouse-master')} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Warehouse'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-2xl border border-gray-200 p-1.5 shadow-sm overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Warehouse Code" value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="Auto-generated" />
            <Input label="Warehouse Name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter warehouse name" />
            <Input label="Short Name" value={form.short_name} onChange={(e) => update('short_name', e.target.value)} placeholder="Short name" />
            <Select label="Warehouse Type" options={WH_TYPES} value={form.warehouse_type} onChange={(e) => update('warehouse_type', e.target.value)} />
            <Select
              label="Parent Warehouse"
              options={[{ value: '', label: 'None' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]}
              value={form.parent_warehouse_id}
              onChange={(e) => update('parent_warehouse_id', e.target.value)}
            />
            <Select label="Default Warehouse" options={YES_NO} value={form.is_default} onChange={(e) => update('is_default', e.target.value)} />
            <Input label="Store Keeper" value={form.store_keeper} onChange={(e) => update('store_keeper', e.target.value)} placeholder="Store keeper name" />
            <Input label="Cost Center" value={form.cost_center} onChange={(e) => update('cost_center', e.target.value)} placeholder="Cost center" />
            <Input label="Opening Date" type="date" value={form.opening_date} onChange={(e) => update('opening_date', e.target.value)} />
            <div className="sm:col-span-2 lg:col-span-3">
              <Input label="Notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Additional notes" />
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-900 mb-1">Location Address</label>
              <textarea
                rows={2}
                value={form.location_address}
                onChange={(e) => update('location_address', e.target.value)}
                placeholder="Enter full address"
                className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
            <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="City" />
            <Input label="State" value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="State" />
            <Input label="Country" value={form.country} onChange={(e) => update('country', e.target.value)} placeholder="Country" />
            <Input label="Pincode" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} placeholder="Pincode" />
            <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone number" />
            <Input label="Email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email address" />
          </div>
        )}

        {activeTab === 'capacity' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Total Area (sq.ft)" type="number" value={form.total_area} onChange={(e) => update('total_area', e.target.value)} placeholder="0" />
            <Input label="Usable Area (sq.ft)" type="number" value={form.usable_area} onChange={(e) => update('usable_area', e.target.value)} placeholder="0" />
            <Select label="Storage Condition" options={STORAGE_CONDITIONS} value={form.storage_condition} onChange={(e) => update('storage_condition', e.target.value)} />
            <Select label="Temperature Control" options={YES_NO} value={form.temperature_control} onChange={(e) => update('temperature_control', e.target.value)} />
            <Select label="Humidity Control" options={YES_NO} value={form.humidity_control} onChange={(e) => update('humidity_control', e.target.value)} />
            <Input label="Handling Equipment" value={form.handling_equipment} onChange={(e) => update('handling_equipment', e.target.value)} placeholder="e.g. Forklift, Crane" />
            <Select label="Material Movement Type" options={MOVEMENT_TYPES} value={form.material_movement_type} onChange={(e) => update('material_movement_type', e.target.value)} />
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allow_negative_stock}
                  onChange={(e) => update('allow_negative_stock', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-xs font-medium text-gray-700">Allow Negative Stock</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            {!isNew && (
              <>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>

                <div className="space-y-2">
                  {form.attachments && form.attachments.length > 0 ? (
                    form.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <FileText size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{att.file_name}</p>
                            <p className="text-xs text-gray-500">{att.document_type || 'General'} - {new Date(att.uploaded_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {isNew && (
              <div className="py-8 text-center">
                <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Save the warehouse first to upload documents</p>
              </div>
            )}
          </div>
        )}

        {/* Status Toggle */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Status</span>
          <button
            onClick={() => setStatusActive(!statusActive)}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${statusActive ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg shadow-emerald-400/30' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${statusActive ? 'translate-x-7' : ''}`} />
          </button>
          <span className={`text-xs font-bold uppercase tracking-wide ${statusActive ? 'text-emerald-600' : 'text-gray-500'}`}>
            {statusActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}
