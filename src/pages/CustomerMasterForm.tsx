import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Users } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import AddressFields from '../components/ui/AddressFields';
import api from '../lib/api';
import { validateGSTIN, validatePAN, validateEmail, validatePhone } from '../lib/validators';

interface CustomerData {
  id?: number;
  code: string;
  name: string;
  contact_person: string;
  phone: string;
  alt_phone: string;
  email: string;
  category: string;
  currency: string;
  notes: string;
  billing_address: string;
  shipping_address: string;
  country: string;
  state: string;
  city: string;
  pin_code: string;
  gstin: string;
  pan: string;
  payment_terms: string;
  credit_limit: string;
  status: string;
}

const empty: CustomerData = {
  code: '', name: '', contact_person: '', phone: '', alt_phone: '', email: '',
  category: 'domestic', currency: 'inr', notes: '', billing_address: '',
  shipping_address: '', country: '', state: '', city: '', pin_code: '',
  gstin: '', pan: '', payment_terms: '30', credit_limit: '', status: 'Active',
};

export default function CustomerMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<CustomerData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomer = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { code: string } }>('/customers/next-code');
        if (res.data?.code) setForm((p) => ({ ...p, code: res.data.code }));
      } catch { /* ignore preview failure */ }
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: CustomerData }>(`/customers/${id}`);
      setForm({ ...empty, ...res.data });
    } catch { toast.error('Failed to load customer'); navigate('/customer-master'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  const update = (key: keyof CustomerData, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Customer name is required';
    if (!form.contact_person.trim()) errs.contact_person = 'Contact person is required';
    if (form.phone) {
      const phoneErr = validatePhone(form.phone);
      if (phoneErr) errs.phone = phoneErr;
    }
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
        const res = await api<{ message: string }>('/customers', { method: 'POST', body: JSON.stringify(form) });
        toast.success(res.message || 'Customer created!');
      } else {
        const res = await api<{ message: string }>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success(res.message || 'Customer updated!');
      }
      navigate('/customer-master');
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
          <button onClick={() => navigate('/customer-master')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 ring-2 ring-white/50">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Customer' : 'Edit Customer'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">1. Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Customer Name" required value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} placeholder="Enter customer name" />
          <Input label="Contact Person" required value={form.contact_person} onChange={(e) => update('contact_person', e.target.value)} error={errors.contact_person} placeholder="Enter contact person" />
          <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} placeholder="+91 9876543210" />
          <Input label="Alt. Phone" value={form.alt_phone} onChange={(e) => update('alt_phone', e.target.value)} placeholder="Alternate phone" />
          <Input label="Email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} placeholder="email@example.com" />
          <Select label="Category" options={[{ value: 'domestic', label: 'Domestic' }, { value: 'international', label: 'International' }]} value={form.category} onChange={(e) => update('category', e.target.value)} />
          <Select label="Currency" options={[{ value: 'inr', label: 'INR (₹)' }, { value: 'usd', label: 'USD ($)' }, { value: 'eur', label: 'EUR (€)' }]} value={form.currency} onChange={(e) => update('currency', e.target.value)} />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Additional notes..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Section 2: Address Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">2. Address Details</h2>
        <AddressFields
          value={{
            billing_address: form.billing_address,
            shipping_address: form.shipping_address,
            country: form.country,
            state: form.state,
            city: form.city,
            pin_code: form.pin_code,
          }}
          onChange={(data) => {
            setForm(p => ({
              ...p,
              billing_address: data.billing_address || '',
              shipping_address: data.shipping_address || '',
              country: data.country || '',
              state: data.state || '',
              city: data.city || '',
              pin_code: data.pin_code || '',
            }));
          }}
          showBillingShipping={true}
          showAddressTextarea={false}
        />
      </div>

      {/* Section 3: Financial Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">3. Financial Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="GSTIN" value={form.gstin} onChange={(e) => update('gstin', e.target.value)} error={errors.gstin} placeholder="e.g. 27AAPFU0939F1ZV" />
          <Input label="PAN" value={form.pan} onChange={(e) => update('pan', e.target.value)} error={errors.pan} placeholder="e.g. ABCDE1234F" />
          <Input label="Payment Terms (days)" value={form.payment_terms} onChange={(e) => update('payment_terms', e.target.value)} placeholder="e.g. 30" />
          <Input label="Credit Limit" value={form.credit_limit} onChange={(e) => update('credit_limit', e.target.value)} placeholder="e.g. 100000" />
        </div>
      </div>

      {/* Section 4: Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-4">4. Status</h2>
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
        <button onClick={() => navigate('/customer-master')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
