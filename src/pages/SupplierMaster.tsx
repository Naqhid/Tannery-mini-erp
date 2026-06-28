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
  Truck,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Save,
  X,
  Download,
  Users,
  Globe,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface Supplier {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: string;
  category?: string;
  supplyType?: string;
  address?: string;
  altPhone?: string;
  pincode?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  paymentTerms?: string;
  bankName?: string;
  bankAccount?: string;
  ifscCode?: string;
  notes?: string;
}

const initialSuppliers: Supplier[] = [
  { code: 'SUP-00021', name: 'Indian Chemical Co.', contactPerson: 'Mr. Suresh', phone: '+91 98410 54321', email: 'suresh@indchem.com', city: 'Chennai', state: 'Tamil Nadu', status: 'Active', category: 'chemical', supplyType: 'chemical', address: 'No.45, Chemical Complex, Chennai', altPhone: '+91 98700 11223', pincode: '600001', website: 'www.indchem.com', gstin: '33AAACI2345C1Z1', pan: 'AAACI2345C', paymentTerms: '30', bankName: 'HDFC Bank', bankAccount: '50200012345678', ifscCode: 'HDFC0001234', notes: 'Preferred supplier for chemicals.' },
  { code: 'SUP-00020', name: 'Sri Traders', contactPerson: 'Mr. Ravi', phone: '+91 97900 11223', email: 'ravi@sritraders.com', city: 'Coimbatore', state: 'Tamil Nadu', status: 'Active', category: 'raw', supplyType: 'raw', address: '12, Industrial Area, Coimbatore', pincode: '641001', gstin: '33BBBST5678D2Z2', pan: 'BBBST5678D', paymentTerms: '45' },
  { code: 'SUP-00019', name: 'Global Suppliers', contactPerson: 'Mr. Vignesh', phone: '+91 96000 33445', email: 'vignesh@globalsup.com', city: 'Mumbai', state: 'Maharashtra', status: 'Active', category: 'finishing', supplyType: 'finishing', address: '78, Andheri East, Mumbai', pincode: '400069', gstin: '27CCCGS9012E3Z3', pan: 'CCCGS9012E', paymentTerms: '30' },
  { code: 'SUP-00018', name: 'Value Chemicals', contactPerson: 'Mr. Karthik', phone: '+91 94400 66778', email: 'karthik@valuechem.com', city: 'Chennai', state: 'Tamil Nadu', status: 'Inactive', category: 'chemical', supplyType: 'chemical', address: '34, Ambattur Ind. Estate, Chennai', pincode: '600058', gstin: '33DDDVC3456F4Z4', pan: 'DDDVC3456F', paymentTerms: '15' },
  { code: 'SUP-00017', name: 'Star Enterprises', contactPerson: 'Mr. Mohan', phone: '+91 96000 77554', email: 'mohan@starent.com', city: 'Erode', state: 'Tamil Nadu', status: 'Active', category: 'dye', supplyType: 'dye', address: '56, Textile Park, Erode', pincode: '638001', gstin: '33EEESE7890G5Z5', pan: 'EEESE7890G', paymentTerms: '30' },
  { code: 'SUP-00016', name: 'Ambur Hides Corp', contactPerson: 'Mr. Arjun', phone: '+91 97500 88991', email: 'arjun@amburhides.com', city: 'Ambur', state: 'Tamil Nadu', status: 'Active', category: 'raw', supplyType: 'raw', address: '23, Leather Complex, Ambur', pincode: '635802', gstin: '33FFFAH1234H6Z6', pan: 'FFFAH1234H', paymentTerms: '45' },
  { code: 'SUP-00015', name: 'Ranipet Chemicals', contactPerson: 'Mr. Dinesh', phone: '+91 98420 22334', email: 'dinesh@ranipetchem.com', city: 'Ranipet', state: 'Tamil Nadu', status: 'Active', category: 'chemical', supplyType: 'chemical', address: '99, SIPCOT, Ranipet', pincode: '632401', gstin: '33GGGRC5678I7Z7', pan: 'GGGRC5678I', paymentTerms: '30' },
  { code: 'SUP-00014', name: 'Vellore Dye Works', contactPerson: 'Mr. Kumar', phone: '+91 94400 55667', email: 'kumar@velloredye.com', city: 'Vellore', state: 'Tamil Nadu', status: 'Active', category: 'dye', supplyType: 'dye', address: '67, Sathuvachari, Vellore', pincode: '632009', gstin: '33HHHVD9012J8Z8', pan: 'HHHVD9012J', paymentTerms: '30' },
];

interface PricingEntry {
  materialCode: string;
  materialName: string;
  uom: string;
  price: number;
  validFrom: string;
  validTo: string;
  status: string;
}

const pricingData: PricingEntry[] = [
  { materialCode: 'MAT-00052', materialName: 'Chrome Powder 33%', uom: 'Kg', price: 76.00, validFrom: '01-05-2024', validTo: '31-05-2024', status: 'Approved' },
  { materialCode: 'MAT-00051', materialName: 'Sodium Sulphide (60%)', uom: 'Kg', price: 62.00, validFrom: '01-05-2024', validTo: '31-05-2024', status: 'Approved' },
  { materialCode: 'MAT-00050', materialName: 'Formic Acid', uom: 'Ltr', price: 28.00, validFrom: '01-05-2024', validTo: '31-05-2024', status: 'Approved' },
  { materialCode: 'MAT-00049', materialName: 'Syntan A 10%', uom: 'Kg', price: 85.00, validFrom: '01-05-2024', validTo: '31-05-2024', status: 'Pending' },
  { materialCode: 'MAT-00047', materialName: 'Fatliquor DP', uom: 'Ltr', price: 140.00, validFrom: '15-04-2024', validTo: '30-04-2024', status: 'Approved' },
  { materialCode: 'MAT-00046', materialName: 'Acrylic Finishing Resin', uom: 'Kg', price: 120.00, validFrom: '15-04-2024', validTo: '30-04-2024', status: 'Approved' },
];

export default function SupplierMaster() {
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [statusToggle, setStatusToggle] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'financial'>('basic');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPanel = (supplier?: Supplier) => {
    setSelectedSupplier(supplier || null);
    setStatusToggle(supplier ? supplier.status === 'Active' : true);
    setActiveTab('basic');
    setShowPanel(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-200/50">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Supplier Master</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your supplier network</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100 shadow-sm">
            <div className="p-1 rounded-md bg-orange-100">
              <Truck size={12} className="text-orange-600" />
            </div>
            <span className="text-xs text-orange-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-orange-800">18</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">15</span>
          </div>
        </div>
      </div>

      {/* Supplier List */}
      <div className="bg-white rounded-xl border border-orange-100 shadow-sm shadow-orange-100/50 overflow-hidden ring-1 ring-orange-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-orange-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all bg-white"
              />
            </div>
            <button className="p-2 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-all">
              <Filter size={15} />
            </button>
            <button className="hidden sm:flex p-2 rounded-lg border border-sky-200 text-sky-500 hover:bg-sky-50 hover:border-sky-300 transition-all">
              <Download size={15} />
            </button>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-lg shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add Supplier
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-orange-50/40 border-b border-orange-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-orange-600 uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Supplier Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-teal-500 uppercase tracking-wider">Contact Person</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-purple-500 uppercase tracking-wider hidden xl:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-sky-500 uppercase tracking-wider hidden lg:table-cell">City</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSuppliers.map((s, index) => (
                <tr key={s.code} className={`hover:bg-orange-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(s)}>
                  <td className="py-3 px-4 relative">
                    <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${s.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-orange-600 font-medium">{s.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        ['bg-orange-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500'][index % 8]
                      }`}>
                        {s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-teal-700 font-medium text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      {s.contactPerson}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-blue-600 font-medium text-xs">{s.phone}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-purple-500 text-xs hover:text-purple-700 hover:underline cursor-pointer">{s.email}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-100">{s.city}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                      s.status === 'Active'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(s); }} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"><Edit2 size={14} /></button>
                      <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredSuppliers.map((s) => (
            <div key={s.code} className="p-4 hover:bg-orange-50/30 transition-colors" onClick={() => openPanel(s)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">{s.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1.5">{s.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users size={11} className="text-teal-400" />{s.contactPerson}</span>
                    <span className="flex items-center gap-1"><Phone size={11} className="text-blue-400" />{s.phone}</span>
                    <span className="text-sky-600">{s.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openPanel(s); }} className="p-2 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                  <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-orange-100/50 bg-gradient-to-r from-slate-50 to-orange-50/30">
          <p className="text-xs text-orange-500 font-medium">Showing 1–8 of 18 entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-orange-300 border border-transparent hover:border-orange-200 transition-all"><ChevronLeft size={14} /></button>
            <button className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-medium shadow-md shadow-orange-200">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-orange-600 border border-transparent hover:border-orange-200 transition-all">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-orange-600 border border-transparent hover:border-orange-200 transition-all">3</button>
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-orange-300 border border-transparent hover:border-orange-200 transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Pricing History */}
      <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-amber-100/50 bg-gradient-to-r from-amber-50/50 to-yellow-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <CreditCard size={14} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Pricing History</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select className="px-2 py-1.5 border border-amber-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-300 focus:border-amber-400">
                <option>All Materials</option>
                <option>Chrome Powder 33%</option>
                <option>Sodium Sulphide</option>
              </select>
              <input type="date" defaultValue="2024-04-01" className="px-2 py-1.5 border border-amber-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-300" />
              <input type="date" defaultValue="2024-05-31" className="px-2 py-1.5 border border-amber-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
        </div>
        {/* Desktop pricing table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Material Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Material Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">UOM</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Price (₹)</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Valid From</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Valid To</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pricingData.map((p, i) => (
                <tr key={p.materialCode + i} className={`hover:bg-amber-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <td className="py-2.5 px-4 font-mono text-xs text-amber-600 font-medium">{p.materialCode}</td>
                  <td className="py-2.5 px-4 text-gray-900 font-medium text-xs">{p.materialName}</td>
                  <td className="py-2.5 px-4 text-gray-500 text-xs">{p.uom}</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold text-xs">₹{p.price.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-gray-500 text-xs hidden lg:table-cell">{p.validFrom}</td>
                  <td className="py-2.5 px-4 text-gray-500 text-xs hidden lg:table-cell">{p.validTo}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile pricing cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {pricingData.map((p, i) => (
            <div key={p.materialCode + i} className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{p.materialCode}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>{p.status}</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{p.materialName}</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">{p.uom} | {p.validFrom} – {p.validTo}</span>
                <span className="text-emerald-700 font-bold">₹{p.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className="w-full max-w-[850px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-orange-100/50 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-200/50">
                      <Truck size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedSupplier ? 'Edit Supplier' : 'New Supplier'}</h2>
                      <p className="text-[11px] text-orange-600 font-medium mt-0.5">{selectedSupplier ? selectedSupplier.code : 'Add a new supplier record'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all"><X size={18} /></button>
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-1 mt-4">
                  {[
                    { id: 'basic' as const, label: 'Basic Info', icon: <Building2 size={13} />, color: 'from-orange-500 to-amber-600' },
                    { id: 'address' as const, label: 'Address & Contact', icon: <MapPin size={13} />, color: 'from-violet-500 to-purple-600' },
                    { id: 'financial' as const, label: 'Financial', icon: <CreditCard size={13} />, color: 'from-emerald-500 to-teal-600' },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white shadow-md` : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                    }`}>
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><Truck size={10} /> Supplier Identity</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Supplier Code" required defaultValue={selectedSupplier?.code || ''} placeholder="Auto-generated" />
                        <Input label="Supplier Name" required defaultValue={selectedSupplier?.name || ''} placeholder="Enter name" />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1.5"><Layers size={10} /> Classification</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Select label="Supplier Category" options={[
                          { value: '', label: 'Select category' },
                          { value: 'chemical', label: 'Chemical Supplier' },
                          { value: 'raw', label: 'Raw Material Supplier' },
                          { value: 'dye', label: 'Dye Supplier' },
                          { value: 'finishing', label: 'Finishing Supplier' },
                        ]} defaultValue={selectedSupplier?.category || ''} />
                        <Select label="Type of Supply" options={[
                          { value: '', label: 'Select type' },
                          { value: 'raw', label: 'Raw Material' },
                          { value: 'chemical', label: 'Chemical' },
                          { value: 'dye', label: 'Dye' },
                          { value: 'finishing', label: 'Finishing Material' },
                        ]} defaultValue={selectedSupplier?.supplyType || ''} />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5"><Phone size={10} /> Contact</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Contact Person" defaultValue={selectedSupplier?.contactPerson || ''} placeholder="Contact name" />
                        <Input label="Phone" defaultValue={selectedSupplier?.phone || ''} placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Email" defaultValue={selectedSupplier?.email || ''} placeholder="email@domain.com" />
                        <Input label="Alternate Phone" defaultValue={selectedSupplier?.altPhone || ''} placeholder="Optional" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'address' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-violet-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={10} /> Address</p>
                      <textarea rows={3} defaultValue={selectedSupplier?.address || ''} placeholder="Enter full address..." className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none placeholder-gray-400 bg-white" />
                      <div className="grid grid-cols-3 gap-3">
                        <Input label="City" defaultValue={selectedSupplier?.city || ''} placeholder="City" />
                        <Input label="State" defaultValue={selectedSupplier?.state || ''} placeholder="State" />
                        <Input label="Pincode" defaultValue={selectedSupplier?.pincode || ''} placeholder="Pincode" />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-50/80 to-sky-50/80 border border-cyan-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider flex items-center gap-1.5"><Globe size={10} /> Web & Notes</p>
                      <Input label="Website" defaultValue={selectedSupplier?.website || ''} placeholder="www.example.com" />
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
                        <textarea rows={2} defaultValue={selectedSupplier?.notes || ''} placeholder="Any notes..." className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none placeholder-gray-400 bg-white" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'financial' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={10} /> Tax Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="GSTIN" defaultValue={selectedSupplier?.gstin || ''} placeholder="e.g. 33AAACI2345C1Z1" />
                        <Input label="PAN" defaultValue={selectedSupplier?.pan || ''} placeholder="e.g. AAACI2345C" />
                      </div>
                      <Select label="Payment Terms" options={[
                        { value: '15', label: '15 Days' },
                        { value: '30', label: '30 Days' },
                        { value: '45', label: '45 Days' },
                        { value: '60', label: '60 Days' },
                      ]} defaultValue={selectedSupplier?.paymentTerms || '30'} />
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5"><Building2 size={10} /> Bank Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Bank Name" defaultValue={selectedSupplier?.bankName || ''} placeholder="Enter bank name" />
                        <Input label="Account No." defaultValue={selectedSupplier?.bankAccount || ''} placeholder="Enter account no." />
                      </div>
                      <Input label="IFSC Code" defaultValue={selectedSupplier?.ifscCode || ''} placeholder="e.g. HDFC0001234" />
                    </div>
                  </div>
                )}

                {/* Status Toggle */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Status</span>
                  <button onClick={() => setStatusToggle(!statusToggle)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${statusToggle ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${statusToggle ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className={`text-xs font-semibold ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>{statusToggle ? '● Active' : '○ Inactive'}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-orange-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedSupplier ? (
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95"><Trash2 size={13} /> Delete</button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95" onClick={() => setShowPanel(false)}><RotateCcw size={13} /> Cancel</button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-lg shadow-md shadow-orange-200 hover:shadow-lg transition-all active:scale-95"><Save size={13} /> {selectedSupplier ? 'Update' : 'Save'}</button>
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
