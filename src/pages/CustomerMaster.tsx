import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Users,
  Building2,
  Phone,
  MapPin,
  CreditCard,
  Save,
  X,
  Download,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface Customer {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  status: string;
  alternatePhone?: string;
  category?: string;
  currency?: string;
  notes?: string;
  billingAddress?: string;
  shippingAddress?: string;
  state?: string;
  pinCode?: string;
  gstin?: string;
  pan?: string;
  paymentTerms?: string;
  creditLimit?: string;
}

const initialCustomers: Customer[] = [
  { code: 'CUST-00045', name: 'ABC Leather Exports', contactPerson: 'Mr. Rajesh Kumar', phone: '+91 98400 12345', email: 'rajesh@abcleather.com', city: 'Vellore', status: 'Active', alternatePhone: '+91 98700 56789', category: 'export', currency: 'inr', notes: 'Regular customer. High quality finishing required.', billingAddress: 'No.12, Industrial Estate, Vellore - 632001, Tamil Nadu, India', shippingAddress: 'No.12, Industrial Estate, Vellore - 632001, Tamil Nadu, India', state: 'tamilnadu', pinCode: '632001', gstin: '33AAACA1234A1Z5', pan: 'AAACA1234A', paymentTerms: '30', creditLimit: '5,00,000' },
  { code: 'CUST-00044', name: 'Global Leathers', contactPerson: 'Mr. Suresh Babu', phone: '+91 97900 56789', email: 'suresh@globalleathers.com', city: 'Chennai', status: 'Active', category: 'domestic', currency: 'inr', billingAddress: '45, Anna Salai, Chennai - 600002', state: 'tamilnadu', gstin: '33BBBCA5678B2Z3', pan: 'BBBCA5678B', paymentTerms: '45', creditLimit: '3,00,000' },
  { code: 'CUST-00043', name: 'Metro Footwear Pvt Ltd', contactPerson: 'Mr. Prakash M.', phone: '+91 97100 11122', email: 'prakash@metrofootwear.com', city: 'Ambur', status: 'Active', category: 'export', currency: 'usd', billingAddress: '78, Leather Complex, Ambur', state: 'tamilnadu', gstin: '33CCCDA9012C3Z4', pan: 'CCCDA9012C', paymentTerms: '60', creditLimit: '8,00,000' },
  { code: 'CUST-00042', name: 'Premium Leathers', contactPerson: 'Mr. Karthik R.', phone: '+91 94400 54321', email: 'karthik@premiumleathers.com', city: 'Ranipet', status: 'Active', category: 'wholesale', currency: 'inr', billingAddress: '22, Industrial Area, Ranipet', state: 'tamilnadu', paymentTerms: '30', creditLimit: '4,00,000' },
  { code: 'CUST-00041', name: 'Style Shoes Co.', contactPerson: 'Mr. Imran Khan', phone: '+91 98800 22233', email: 'imran@styleshoes.com', city: 'Mumbai', status: 'Inactive', category: 'domestic', currency: 'inr', billingAddress: '15, Dharavi Leather Market, Mumbai', state: 'maharashtra', paymentTerms: '15', creditLimit: '2,00,000' },
  { code: 'CUST-00040', name: 'Star Exports', contactPerson: 'Mr. Mohan Raj', phone: '+91 96000 33344', email: 'mohan@starexports.com', city: 'Bangalore', status: 'Active', category: 'export', currency: 'eur', billingAddress: '99, Peenya Industrial Area, Bangalore', state: 'karnataka', paymentTerms: '45', creditLimit: '6,00,000' },
  { code: 'CUST-00039', name: 'Royal Footwears', contactPerson: 'Mr. Vignesh', phone: '+91 97500 44455', email: 'vignesh@royalfootwears.com', city: 'Vellore', status: 'Active', category: 'domestic', currency: 'inr', billingAddress: '34, Sathuvachari, Vellore', state: 'tamilnadu', paymentTerms: '30', creditLimit: '3,50,000' },
  { code: 'CUST-00038', name: 'Classic Leathers', contactPerson: 'Mr. Arvind', phone: '+91 97890 55566', email: 'arvind@classicleathers.com', city: 'Chennai', status: 'Active', category: 'export', currency: 'usd', billingAddress: '56, Chromepet, Chennai', state: 'tamilnadu', paymentTerms: '60', creditLimit: '7,00,000' },
  { code: 'CUST-00037', name: 'Leather World', contactPerson: 'Mr. Naveen', phone: '+91 97901 66677', email: 'naveen@leatherworld.com', city: 'Ambur', status: 'Active', category: 'wholesale', currency: 'inr', billingAddress: '11, Main Road, Ambur', state: 'tamilnadu', paymentTerms: '30', creditLimit: '2,50,000' },
  { code: 'CUST-00036', name: 'National Exports', contactPerson: 'Mr. Ramesh', phone: '+91 98420 77788', email: 'ramesh@nationalexports.com', city: 'Ranipet', status: 'Active', category: 'export', currency: 'inr', billingAddress: '67, SIPCOT, Ranipet', state: 'tamilnadu', paymentTerms: '45', creditLimit: '5,50,000' },
];

export default function CustomerMaster() {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [statusToggle, setStatusToggle] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'financial'>('basic');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPanel = (customer?: Customer) => {
    setSelectedCustomer(customer || null);
    setStatusToggle(customer ? customer.status === 'Active' : true);
    setActiveTab('basic');
    setShowPanel(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">Customer Master</h1>
            <p className="text-xs text-purple-400 font-medium mt-0.5">Manage your customer database</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
            <div className="p-1 rounded-md bg-blue-100">
              <Users size={12} className="text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-blue-800">45</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">42</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-xs text-red-600 font-medium">Inactive:</span>
            <span className="text-sm font-bold text-red-800">3</span>
          </div>
        </div>
      </div>

      {/* Customer List - Full Width */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm shadow-indigo-100/50 overflow-hidden ring-1 ring-indigo-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
              />
            </div>
            <button className="p-2 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-all">
              <Filter size={15} />
            </button>
            <button className="hidden sm:flex p-2 rounded-lg border border-teal-200 text-teal-500 hover:bg-teal-50 hover:border-teal-300 transition-all">
              <Download size={15} />
            </button>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add Customer
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-blue-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Customer Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Contact Person</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider hidden xl:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider hidden lg:table-cell">City</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((c, index) => (
                <tr key={c.code} className={`hover:bg-blue-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(c)}>
                  <td className="py-3 px-4 font-mono text-xs text-indigo-500 font-medium relative">
                    <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${c.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {c.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        ['bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-pink-500', 'bg-emerald-500', 'bg-orange-500'][index % 10]
                      }`}>
                        {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-teal-700 font-medium text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      {c.contactPerson}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-blue-600 font-medium text-xs">{c.phone}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-purple-500 text-xs hover:text-purple-700 hover:underline cursor-pointer">{c.email}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-100">
                      {c.city}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                      c.status === 'Active'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openPanel(c); }}
                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredCustomers.map((c) => (
            <div key={c.code} className="p-4 hover:bg-gray-50/50 transition-colors active:bg-gray-100" onClick={() => openPanel(c)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{c.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1.5">{c.name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={11} className="text-gray-400" />
                      {c.contactPerson}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={11} className="text-gray-400" />
                      {c.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openPanel(c); }}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-blue-100/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <p className="text-xs text-indigo-400 font-medium">Showing 1–10 of 45 entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-indigo-300 border border-transparent hover:border-indigo-200 transition-all">
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium shadow-md shadow-blue-200">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-indigo-600 border border-transparent hover:border-indigo-200 transition-all">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-indigo-600 border border-transparent hover:border-indigo-200 transition-all">3</button>
            <button className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-indigo-600 border border-transparent hover:border-indigo-200 items-center justify-center transition-all">4</button>
            <button className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-indigo-600 border border-transparent hover:border-indigo-200 items-center justify-center transition-all">5</button>
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-indigo-300 border border-transparent hover:border-indigo-200 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Panel */}
      {showPanel && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center"
            onClick={() => setShowPanel(false)}
          >
            {/* Panel */}
            <div
              className="w-full max-w-[560px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-4"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shrink-0 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200/50">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      {selectedCustomer ? 'Edit Customer' : 'New Customer'}
                    </h2>
                    <p className="text-[11px] text-indigo-500 font-medium mt-0.5">
                      {selectedCustomer ? selectedCustomer.code : 'Add a new customer record'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mt-4">
                {[
                  { id: 'basic' as const, label: 'Basic Info', icon: <Users size={13} />, color: 'from-blue-500 to-blue-600' },
                  { id: 'address' as const, label: 'Address', icon: <MapPin size={13} />, color: 'from-violet-500 to-purple-600' },
                  { id: 'financial' as const, label: 'Financial', icon: <CreditCard size={13} />, color: 'from-emerald-500 to-teal-600' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Input label="Customer Code" required defaultValue={selectedCustomer?.code || ''} placeholder="Auto-generated" />
                      <span className="absolute top-0 right-0 text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg font-semibold">Auto</span>
                    </div>
                    <Input label="Customer Name" required defaultValue={selectedCustomer?.name || ''} placeholder="Enter name" />
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 space-y-3">
                    <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={10} /> Contact Information
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Contact Person" defaultValue={selectedCustomer?.contactPerson || ''} placeholder="Contact name" />
                      <Input label="Phone" required defaultValue={selectedCustomer?.phone || ''} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Email" defaultValue={selectedCustomer?.email || ''} placeholder="email@domain.com" />
                      <Input label="Alternate Phone" defaultValue={selectedCustomer?.alternatePhone || ''} placeholder="Optional" />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-violet-100/50 space-y-3">
                    <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={10} /> Classification
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Customer Category"
                        options={[
                          { value: '', label: 'Select category' },
                          { value: 'export', label: 'Export Customer' },
                          { value: 'domestic', label: 'Domestic Customer' },
                          { value: 'wholesale', label: 'Wholesale' },
                        ]}
                        defaultValue={selectedCustomer?.category || ''}
                      />
                      <Select
                        label="Currency"
                        options={[
                          { value: 'inr', label: 'INR - Indian Rupee' },
                          { value: 'usd', label: 'USD - US Dollar' },
                          { value: 'eur', label: 'EUR - Euro' },
                        ]}
                        defaultValue={selectedCustomer?.currency || 'inr'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      defaultValue={selectedCustomer?.notes || ''}
                      placeholder="Any additional notes..."
                      className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'address' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100/50 space-y-3">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={10} /> Billing
                    </p>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">
                        Billing Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={selectedCustomer?.billingAddress || ''}
                        placeholder="Enter billing address..."
                        className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50/80 to-cyan-50/80 border border-sky-100/50 space-y-3">
                    <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={10} /> Shipping
                    </p>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Shipping Address</label>
                      <textarea
                        rows={3}
                        defaultValue={selectedCustomer?.shippingAddress || ''}
                        placeholder="Enter shipping address (or same as billing)..."
                        className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all resize-none placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-100/50 space-y-3">
                    <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={10} /> Location
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="State"
                        options={[
                          { value: '', label: 'Select state' },
                          { value: 'tamilnadu', label: 'Tamil Nadu' },
                          { value: 'karnataka', label: 'Karnataka' },
                          { value: 'maharashtra', label: 'Maharashtra' },
                          { value: 'kerala', label: 'Kerala' },
                        ]}
                        defaultValue={selectedCustomer?.state || ''}
                      />
                      <Select
                        label="City"
                        options={[
                          { value: '', label: 'Select city' },
                          { value: 'vellore', label: 'Vellore' },
                          { value: 'chennai', label: 'Chennai' },
                          { value: 'ranipet', label: 'Ranipet' },
                          { value: 'ambur', label: 'Ambur' },
                        ]}
                        defaultValue={selectedCustomer?.city?.toLowerCase() || ''}
                      />
                    </div>
                    <Input label="Pin Code" defaultValue={selectedCustomer?.pinCode || ''} placeholder="Enter pin code" />
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-pink-50/80 to-rose-50/80 border border-pink-100/50 space-y-3">
                    <p className="text-[10px] font-semibold text-pink-600 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard size={10} /> Tax Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="GSTIN" defaultValue={selectedCustomer?.gstin || ''} placeholder="e.g. 33AAACA1234A1Z5" />
                      <Input label="PAN" defaultValue={selectedCustomer?.pan || ''} placeholder="e.g. AAACA1234A" />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50/80 to-cyan-50/80 border border-teal-100/50 space-y-3">
                    <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard size={10} /> Credit & Payment
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Payment Terms"
                        options={[
                          { value: '15', label: '15 Days' },
                          { value: '30', label: '30 Days' },
                          { value: '45', label: '45 Days' },
                          { value: '60', label: '60 Days' },
                        ]}
                        defaultValue={selectedCustomer?.paymentTerms || '30'}
                      />
                      <Input label="Credit Limit (₹)" defaultValue={selectedCustomer?.creditLimit || ''} placeholder="e.g. 5,00,000" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                    <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">⚠️ Note</p>
                    <p className="text-[11px] text-amber-600 mt-1">Credit limit and payment terms will be applied to all new sales orders for this customer.</p>
                  </div>
                </div>
              )}

              {/* Status Toggle */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-700">Status</span>
                <button
                  onClick={() => setStatusToggle(!statusToggle)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${statusToggle ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${statusToggle ? 'translate-x-5' : ''}`} />
                </button>
                <span className={`text-xs font-semibold ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {statusToggle ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 shrink-0 rounded-b-2xl">
              <div className="flex items-center justify-between">
                {selectedCustomer ? (
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95">
                    <Trash2 size={13} /> Delete
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                    onClick={() => setShowPanel(false)}
                  >
                    <RotateCcw size={13} /> Cancel
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95">
                    <Save size={13} /> {selectedCustomer ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
