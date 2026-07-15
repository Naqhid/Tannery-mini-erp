import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Truck } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import AddressFields from '../components/ui/AddressFields';
import api from '../lib/api';
import { validateGSTIN, validatePAN, validateEmail, validatePhone } from '../lib/validators';

interface SupplierData {
  id?: number;
  code: string;
  name: string;
  contact_person: string;
  phone: string;
  alt_phone: string;
  email: string;
  category: string;
  supply_type: string;
  website: string;
  notes: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gstin: string;
  pan: string;
  payment_terms: string;
  bank_name: string;
  bank_account: string;
  ifsc_code: string;
  status: string;
}

const empty: SupplierData = {
  code: '', name: '', contact_person: '', phone: '', alt_phone: '', email: '',
  category: 'domestic', supply_type: '', website: '', notes: '', address: '',
  country: '', state: '', city: '', pincode: '', gstin: '', pan: '',
  payment_terms: '', bank_name: '', bank_account: '', ifsc_code: '', status: 'Active',
};

export default function SupplierMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<SupplierData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchSupplier = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: SupplierData }>(`/suppliers/${id}`);
      setForm({ ...empty, ...res.data });
    } catch { toast.error('Failed to load supplier'); navigate('/supplier-master'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchSupplier(); }, [fetchSupplier]);

  const update = (key: keyof SupplierData, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Supplier name is required';
    if (!form.contact_person.trim()) errs.contact_person = 'Contact person is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const gstinErr = validateGSTIN(form.gstin);
    if (gstinErr) errs.gstin = gstinErr;
    const panErr = validatePAN(form.pan);
    if (panErr) errs.pan = panErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const res = await api<{ message: string }>('/suppliers', { method: 'POST', body: JSON.stringify(form) });
        toast.success(res.message || 'Supplier created!');
      } else {
        const res = await api<{ message: string }>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success(res.message || 'Supplier updated!');
      }
      navigate('/supplier-master');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/supplier-master')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-xl shadow-orange-500/30 ring-2 ring-white/50">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Supplier' : 'Edit Supplier'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-4">1. Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Supplier Name" required value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} placeholder="Enter supplier name" />
          <Input label="Contact Person" required value={form.contact_person} onChange={(e) => update('contact_person', e.target.value)} error={errors.contact_person} placeholder="Enter contact person" />
          <Input label="Phone" required value={form.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} placeholder="+91 9876543210" />
          <Input label="Alt. Phone" value={form.alt_phone} onChange={(e) => update('alt_phone', e.target.value)} placeholder="Alternate phone" />
          <Input label="Email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} placeholder="email@example.com" />
          <Select label="Category" options={[{ value: 'domestic', label: 'Domestic' }, { value: 'international', label: 'International' }]} value={form.category} onChange={(e) => update('category', e.target.value)} />
          <Select label="Supply Type" options={[{ value: '', label: 'Select' }, { value: 'chemicals', label: 'Chemicals' }, { value: 'raw_material', label: 'Raw Material' }, { value: 'packing', label: 'Packing' }, { value: 'services', label: 'Services' }]} value={form.supply_type} onChange={(e) => update('supply_type', e.target.value)} />
          <Input label="Website" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="www.example.com" />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Additional notes..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Section 2: Address Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-4">2. Address Details</h2>
        <AddressFields
          value={{
            address: form.address,
            country: form.country,
            state: form.state,
            city: form.city,
            pin_code: form.pincode,
          }}
          onChange={(data) => {
            setForm(p => ({
              ...p,
              address: data.address || '',
              country: data.country || '',
              state: data.state || '',
              city: data.city || '',
              pincode: data.pin_code || '',
            }));
          }}
          showBillingShipping={false}
          showAddressTextarea={true}
          addressLabel="Address"
        />
      </div>

      {/* Section 3: Financial Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-4">3. Financial Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="GSTIN" value={form.gstin} onChange={(e) => update('gstin', e.target.value)} error={errors.gstin} placeholder="e.g. 27AAPFU0939F1ZV" />
          <Input label="PAN" value={form.pan} onChange={(e) => update('pan', e.target.value)} error={errors.pan} placeholder="e.g. ABCDE1234F" />
          <Input label="Payment Terms" value={form.payment_terms} onChange={(e) => update('payment_terms', e.target.value)} placeholder="e.g. 30 days" />
          <Input label="Bank Name" value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} placeholder="Enter bank name" />
          <Input label="Bank Account" value={form.bank_account} onChange={(e) => update('bank_account', e.target.value)} placeholder="Account number" />
          <Input label="IFSC Code" value={form.ifsc_code} onChange={(e) => update('ifsc_code', e.target.value)} placeholder="e.g. SBIN0001234" />
        </div>
      </div>

      {/* Section 4: Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-4">4. Status</h2>
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
        <button onClick={() => navigate('/supplier-master')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
