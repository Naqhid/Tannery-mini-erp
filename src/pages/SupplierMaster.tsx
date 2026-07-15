import { useState } from 'react';
import { Truck } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import AddressFields from '../components/ui/AddressFields';

export default function SupplierMaster() {
  const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'financial'>('basic');

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'contact_person', header: 'Contact', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'city', header: 'City', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];

  const formFields = [
    { key: 'name', label: 'Supplier Name', required: true },
    { key: 'contact_person', label: 'Contact Person', required: true },
    { key: 'phone', label: 'Phone', required: true, validate: 'phone' as const },
    { key: 'email', label: 'Email', validate: 'email' as const },
    { key: 'category', label: 'Category', type: 'select' as const, options: [
      { value: 'domestic', label: 'Domestic' },
      { value: 'international', label: 'International' },
    ]},
    { key: 'supply_type', label: 'Supply Type', type: 'select' as const, options: [
      { value: 'chemicals', label: 'Chemicals' },
      { value: 'raw_material', label: 'Raw Material' },
      { value: 'packing', label: 'Packing' },
      { value: 'services', label: 'Services' },
    ]},
    { key: 'gstin', label: 'GSTIN', validate: 'gstin' as const },
    { key: 'pan', label: 'PAN', validate: 'pan' as const },
    { key: 'notes', label: 'Notes', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'contact_person', header: 'Contact Person' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'city', header: 'City' },
    { key: 'status', header: 'Status' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
    { key: 'category', label: 'Category', options: [{ value: 'domestic', label: 'Domestic' }, { value: 'international', label: 'International' }] },
  ];

  const renderCustomForm = ({ formData, setFormData, formErrors, selectedItem, statusToggle, setStatusToggle, setFormDirty }: any) => {
    const updateField = (key: string, value: any) => {
      setFormData((prev: any) => ({ ...prev, [key]: value }));
      setFormDirty(true);
    };

    return (
      <>
        <div className="flex border-b border-gray-200 mb-4">
          {(['basic', 'address', 'financial'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'basic' ? 'Basic Info' : tab === 'address' ? 'Address' : 'Financial'}
            </button>
          ))}
        </div>

        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Supplier Name" required value={formData.name || ''} onChange={(e) => updateField('name', e.target.value)} error={formErrors.name} />
            <Input label="Contact Person" required value={formData.contact_person || ''} onChange={(e) => updateField('contact_person', e.target.value)} error={formErrors.contact_person} />
            <Input label="Phone" required value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} error={formErrors.phone} />
            <Input label="Alt. Phone" value={formData.alt_phone || ''} onChange={(e) => updateField('alt_phone', e.target.value)} />
            <Input label="Email" value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} error={formErrors.email} />
            <Select label="Category" options={[{ value: 'domestic', label: 'Domestic' }, { value: 'international', label: 'International' }]} value={formData.category || 'domestic'} onChange={(e) => updateField('category', e.target.value)} />
            <Select label="Supply Type" options={[{ value: 'chemicals', label: 'Chemicals' }, { value: 'raw_material', label: 'Raw Material' }, { value: 'packing', label: 'Packing' }, { value: 'services', label: 'Services' }]} value={formData.supply_type || ''} onChange={(e) => updateField('supply_type', e.target.value)} />
            <Input label="Website" value={formData.website || ''} onChange={(e) => updateField('website', e.target.value)} />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
              <textarea rows={2} value={formData.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none" />
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="space-y-4">
            <AddressFields
              value={{
                address: formData.address || '',
                country: formData.country || '',
                state: formData.state || '',
                city: formData.city || '',
                pin_code: formData.pincode || '',
              }}
              onChange={(data) => {
                setFormData((prev: any) => ({
                  ...prev,
                  address: data.address || '',
                  country: data.country || '',
                  state: data.state || '',
                  city: data.city || '',
                  pincode: data.pin_code || '',
                }));
                setFormDirty(true);
              }}
              showBillingShipping={false}
              showAddressTextarea={true}
              addressLabel="Address"
            />
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="GSTIN" value={formData.gstin || ''} onChange={(e) => updateField('gstin', e.target.value)} error={formErrors.gstin} />
            <Input label="PAN" value={formData.pan || ''} onChange={(e) => updateField('pan', e.target.value)} error={formErrors.pan} />
            <Input label="Payment Terms" value={formData.payment_terms || ''} onChange={(e) => updateField('payment_terms', e.target.value)} />
            <Input label="Bank Name" value={formData.bank_name || ''} onChange={(e) => updateField('bank_name', e.target.value)} />
            <Input label="Bank Account" value={formData.bank_account || ''} onChange={(e) => updateField('bank_account', e.target.value)} />
            <Input label="IFSC Code" value={formData.ifsc_code || ''} onChange={(e) => updateField('ifsc_code', e.target.value)} />
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 mt-4">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</span>
          <button onClick={() => { setStatusToggle(!statusToggle); setFormDirty(true); }} className={`relative w-12 h-6 rounded-full transition-all ${statusToggle ? 'bg-emerald-500' : 'bg-gray-300'}`} role="switch" aria-checked={statusToggle}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${statusToggle ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-xs font-bold uppercase ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>{statusToggle ? 'Active' : 'Inactive'}</span>
        </div>
      </>
    );
  };

  return (
    <MasterPage
      title="Supplier"
      subtitle="Manage your supplier database"
      icon={<Truck size={20} className="text-white" />}
      iconColor="from-orange-500 to-red-600"
      apiEndpoint="/suppliers"
      columns={columns}
      formFields={formFields}
      emptyData={{
        code: '', name: '', contact_person: '', phone: '', email: '', city: '', status: 'Active',
        alt_phone: '', category: 'domestic', supply_type: '', notes: '', address: '',
        country: '', state: '', pincode: '', website: '', gstin: '', pan: '',
        payment_terms: '', bank_name: '', bank_account: '', ifsc_code: '',
      }}
      exportColumns={exportColumns}
      pdfAccentColor={[249, 115, 22]}
      filterOptions={filterOptions}
      enableArchive={true}
      renderForm={renderCustomForm}
    />
  );
}
