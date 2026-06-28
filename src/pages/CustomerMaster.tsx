import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';

interface Customer {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  status: string;
}

const initialCustomers: Customer[] = [
  { code: 'CUST-00045', name: 'ABC Leather Exports', contactPerson: 'Mr. Rajesh Kumar', phone: '+91 98400 12345', status: 'Active' },
  { code: 'CUST-00044', name: 'Global Leathers', contactPerson: 'Mr. Suresh Babu', phone: '+91 97900 56789', status: 'Active' },
  { code: 'CUST-00043', name: 'Metro Footwear Pvt Ltd', contactPerson: 'Mr. Prakash M.', phone: '+91 97100 11122', status: 'Active' },
  { code: 'CUST-00042', name: 'Premium Leathers', contactPerson: 'Mr. Karthik R.', phone: '+91 94400 54321', status: 'Active' },
  { code: 'CUST-00041', name: 'Style Shoes Co.', contactPerson: 'Mr. Imran Khan', phone: '+91 98800 22233', status: 'Inactive' },
  { code: 'CUST-00040', name: 'Star Exports', contactPerson: 'Mr. Mohan Raj', phone: '+91 96000 33344', status: 'Active' },
  { code: 'CUST-00039', name: 'Royal Footwears', contactPerson: 'Mr. Vignesh', phone: '+91 97500 44455', status: 'Active' },
  { code: 'CUST-00038', name: 'Classic Leathers', contactPerson: 'Mr. Arvind', phone: '+91 97890 55566', status: 'Active' },
  { code: 'CUST-00037', name: 'Leather World', contactPerson: 'Mr. Naveen', phone: '+91 97901 66677', status: 'Active' },
  { code: 'CUST-00036', name: 'National Exports', contactPerson: 'Mr. Ramesh', phone: '+91 98420 77788', status: 'Active' },
];

export default function CustomerMaster() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [statusToggle, setStatusToggle] = useState(true);

  const customerColumns = [
    { key: 'code', header: 'Customer Code', width: '110px' },
    { key: 'name', header: 'Customer Name' },
    { key: 'contactPerson', header: 'Contact Person' },
    { key: 'phone', header: 'Phone', width: '130px' },
    { key: 'status', header: 'Status', width: '80px', render: (row: Customer) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
      }`}>{row.status}</span>
    )},
    { key: 'actions', header: 'Action', width: '70px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Master</h1>
          <p className="text-xs text-gray-500 mt-0.5">Masters &gt; Customer Master</p>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] gap-5">
        {/* Left - Customer Details Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 inline-block border-b-2 border-blue-600 pb-2">Customer Details</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Customer Code" required defaultValue="CUST-00045" />
                <Input label="Customer Name" required defaultValue="ABC Leather Exports" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Contact Person" defaultValue="Mr. Rajesh Kumar" />
                <Input label="Phone" required defaultValue="+91 98400 12345" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" defaultValue="rajesh@abcleather.com" />
                <Input label="Alternate Phone" defaultValue="+91 98700 56789" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1">Billing Address <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    defaultValue="No.12, Industrial Estate, Vellore - 632001, Tamil Nadu, India"
                    className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1">Shipping Address</label>
                  <textarea
                    rows={3}
                    defaultValue="No.12, Industrial Estate, Vellore - 632001, Tamil Nadu, India"
                    className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="GSTIN" defaultValue="33AAACA1234A1Z5" />
                <Input label="PAN" defaultValue="AAACA1234A" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="State"
                  options={[
                    { value: 'tamilnadu', label: 'Tamil Nadu' },
                    { value: 'karnataka', label: 'Karnataka' },
                    { value: 'maharashtra', label: 'Maharashtra' },
                    { value: 'kerala', label: 'Kerala' },
                  ]}
                  defaultValue="tamilnadu"
                />
                <Select
                  label="City"
                  options={[
                    { value: 'vellore', label: 'Vellore' },
                    { value: 'chennai', label: 'Chennai' },
                    { value: 'ranipet', label: 'Ranipet' },
                    { value: 'ambur', label: 'Ambur' },
                  ]}
                  defaultValue="vellore"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Payment Terms (Days)"
                  options={[
                    { value: '15', label: '15 Days' },
                    { value: '30', label: '30 Days' },
                    { value: '45', label: '45 Days' },
                    { value: '60', label: '60 Days' },
                  ]}
                  defaultValue="30"
                />
                <Input label="Credit Limit (Rs)" defaultValue="5,00,000.00" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Customer Category"
                  options={[
                    { value: 'export', label: 'Export Customer' },
                    { value: 'domestic', label: 'Domestic Customer' },
                    { value: 'wholesale', label: 'Wholesale' },
                  ]}
                  defaultValue="export"
                />
                <Select
                  label="Currency"
                  options={[
                    { value: 'inr', label: 'INR - Indian Rupee' },
                    { value: 'usd', label: 'USD - US Dollar' },
                    { value: 'eur', label: 'EUR - Euro' },
                  ]}
                  defaultValue="inr"
                />
              </div>
              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
                <textarea
                  rows={2}
                  defaultValue="Regular customer. High quality finishing required."
                  className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
              {/* Status Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-900">Status</span>
                <button
                  onClick={() => setStatusToggle(!statusToggle)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${statusToggle ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${statusToggle ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-xs text-gray-900">{statusToggle ? 'Active' : 'Inactive'}</span>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                <Button variant="teal">Save</Button>
                <Button variant="outline" icon={<RotateCcw size={14} />}>Reset</Button>
                <Button variant="danger" icon={<Trash2 size={14} />}>Delete</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Customer List */}
        <Card
          title="Customer List"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customer..."
                  className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                />
              </div>
              <Button variant="outline" size="sm" icon={<Filter size={14} />}>{''}</Button>
              <Button size="sm" icon={<Plus size={14} />} variant="teal">Add Customer</Button>
            </div>
          }
        >
          <Table columns={customerColumns} data={customers} />
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing 1 to 10 of 45 entries</p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><ChevronLeft size={14} /></button>
              <button className="w-7 h-7 rounded bg-blue-600 text-white text-xs font-medium">1</button>
              <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">2</button>
              <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">3</button>
              <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">4</button>
              <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">5</button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><ChevronRight size={14} /></button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
