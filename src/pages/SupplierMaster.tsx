import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';

interface Supplier {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  status: string;
}

interface PricingEntry {
  materialCode: string;
  materialName: string;
  uom: string;
  price: number;
  validFrom: string;
  validTo: string;
  approvedBy: string;
  status: string;
}

const initialSuppliers: Supplier[] = [
  { code: 'SUP-00021', name: 'Indian Chemical Co.', contactPerson: 'Mr. Suresh', phone: '+91 98410 54321', city: 'Chennai', status: 'Active' },
  { code: 'SUP-00020', name: 'Sri Traders', contactPerson: 'Mr. Ravi', phone: '+91 97900 11223', city: 'Coimbatore', status: 'Active' },
  { code: 'SUP-00019', name: 'Global Suppliers', contactPerson: 'Mr. Vignesh', phone: '+91 96000 33445', city: 'Mumbai', status: 'Active' },
  { code: 'SUP-00018', name: 'Value Chemicals', contactPerson: 'Mr. Karthik', phone: '+91 94400 66778', city: 'Chennai', status: 'Inactive' },
  { code: 'SUP-00017', name: 'Star Enterprises', contactPerson: 'Mr. Mohan', phone: '+91 96000 77554', city: 'Erode', status: 'Active' },
];

const initialPricing: PricingEntry[] = [
  { materialCode: 'MAT-00052', materialName: 'Chrome Powder 33%', uom: 'Kg', price: 76.00, validFrom: '01-05-2024', validTo: '31-05-2024', approvedBy: 'Admin', status: 'Approved' },
  { materialCode: 'MAT-00051', materialName: 'Sodium Sulphide (60%)', uom: 'Kg', price: 62.00, validFrom: '01-05-2024', validTo: '31-05-2024', approvedBy: 'Admin', status: 'Approved' },
  { materialCode: 'MAT-00050', materialName: 'Formic Acid', uom: 'Ltr', price: 28.00, validFrom: '01-05-2024', validTo: '31-05-2024', approvedBy: 'Admin', status: 'Approved' },
  { materialCode: 'MAT-00049', materialName: 'Syntan A 10%', uom: 'Kg', price: 85.00, validFrom: '01-05-2024', validTo: '31-05-2024', approvedBy: 'Admin', status: 'Pending' },
  { materialCode: 'MAT-00047', materialName: 'Fatliquor DP', uom: 'Ltr', price: 140.00, validFrom: '15-04-2024', validTo: '30-04-2024', approvedBy: 'Admin', status: 'Approved' },
  { materialCode: 'MAT-00046', materialName: 'Acrylic Finishing Resin', uom: 'Kg', price: 120.00, validFrom: '15-04-2024', validTo: '30-04-2024', approvedBy: 'Admin', status: 'Approved' },
];

export default function SupplierMaster() {
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [pricing] = useState<PricingEntry[]>(initialPricing);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier>(initialSuppliers[0]);
  const [statusToggle, setStatusToggle] = useState(true);

  const supplierColumns = [
    { key: 'code', header: 'Supplier Code', width: '110px' },
    { key: 'name', header: 'Supplier Name' },
    { key: 'contactPerson', header: 'Contact Person' },
    { key: 'phone', header: 'Phone', width: '130px' },
    { key: 'city', header: 'City', width: '100px' },
    { key: 'status', header: 'Status', width: '80px', render: (row: Supplier) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
      }`}>{row.status}</span>
    )},
    { key: 'actions', header: 'Action', width: '70px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  const pricingColumns = [
    { key: 'materialCode', header: 'Material Code', width: '100px' },
    { key: 'materialName', header: 'Material Name' },
    { key: 'uom', header: 'UOM', width: '50px' },
    { key: 'price', header: 'Price (₹ / UOM)', width: '100px', render: (row: PricingEntry) => (
      <span>{row.price.toFixed(2)}</span>
    )},
    { key: 'validFrom', header: 'Valid From', width: '90px' },
    { key: 'validTo', header: 'Valid To', width: '90px' },
    { key: 'approvedBy', header: 'Approved By', width: '90px' },
    { key: 'status', header: 'Status', width: '85px', render: (row: PricingEntry) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}>{row.status}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Supplier Master</h1>
          <p className="text-sm text-gray-500 mt-0.5">Masters &gt; Suppliers &gt; Supplier Master</p>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] gap-5">
        {/* Left - Supplier Details Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 inline-block border-b-2 border-blue-600 pb-2">Supplier Details</h2>
          </div>
          <div className="p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Supplier Code" required placeholder="SUP-00021" defaultValue={selectedSupplier.code} />
              <Select
                label="Supplier Category"
                options={[
                  { value: '', label: 'Select category' },
                  { value: 'chemical', label: 'Chemical Supplier' },
                  { value: 'raw', label: 'Raw Material Supplier' },
                  { value: 'dye', label: 'Dye Supplier' },
                  { value: 'finishing', label: 'Finishing Supplier' },
                ]}
                defaultValue="chemical"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Supplier Name" required placeholder="Enter supplier name" defaultValue={selectedSupplier.name} />
              <Select
                label="Type of Supply"
                options={[
                  { value: '', label: 'Select type' },
                  { value: 'raw', label: 'Raw Material' },
                  { value: 'chemical', label: 'Chemical' },
                  { value: 'dye', label: 'Dye' },
                  { value: 'finishing', label: 'Finishing Material' },
                ]}
                defaultValue="raw"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Contact Person" placeholder="Enter contact person" defaultValue={selectedSupplier.contactPerson} />
              <Input label="City" placeholder="Enter city" defaultValue={selectedSupplier.city} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" placeholder="+91 XXXXX XXXXX" defaultValue={selectedSupplier.phone} />
              <Input label="State" placeholder="Enter state" defaultValue="Tamil Nadu" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" placeholder="email@example.com" defaultValue="suresh@indchem.com" />
              <Input label="Pincode" placeholder="Enter pincode" defaultValue="600001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input label="Address" required placeholder="Enter address" defaultValue="No.45, Chemical Complex," />
                <p className="text-xs text-gray-500 mt-1">Chennai – 600001,<br />Tamil Nadu, India</p>
              </div>
              <Input label="Alternate Phone" placeholder="+91 XXXXX XXXXX" defaultValue="+91 98700 11223" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Website" placeholder="www.example.com" defaultValue="www.indchem.com" />
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            <div className="grid grid-cols-2 gap-3">
              <Input label="GSTIN" placeholder="Enter GSTIN" defaultValue="33AAACI2345C1Z1" />
              <Input label="Bank Name" placeholder="Enter bank name" defaultValue="HDFC Bank" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="PAN" placeholder="Enter PAN" defaultValue="AAACI2345C" />
              <Input label="Bank A/c No." placeholder="Enter account number" defaultValue="50200012345678" />
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
              <Input label="IFSC Code" placeholder="Enter IFSC code" defaultValue="HDFC0001234" />
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

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

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
              <textarea
                className="w-full px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 resize-none"
                rows={3}
                defaultValue="Preferred supplier for chemicals.
Good quality and on-time delivery."
              />
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

        {/* Right - Supplier List + Pricing */}
        <div className="space-y-6">
          {/* Supplier List */}
          <Card
            title="Supplier List"
            action={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search supplier..."
                    className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                  />
                </div>
                <Button variant="outline" size="sm" icon={<Filter size={14} />}>{''}</Button>
                <Button size="sm" icon={<Plus size={14} />} variant="teal">Add Supplier</Button>
              </div>
            }
          >
            <Table columns={supplierColumns} data={suppliers} />
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Showing 1 to 5 of 18 entries</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><ChevronLeft size={14} /></button>
                <button className="w-7 h-7 rounded bg-blue-600 text-white text-xs font-medium">1</button>
                <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">2</button>
                <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">3</button>
                <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">4</button>
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><ChevronRight size={14} /></button>
              </div>
            </div>
          </Card>

          {/* Pricing History */}
          <Card title="Pricing History">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-medium text-gray-500 whitespace-nowrap">Material</label>
                <select className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white">
                  <option>All Materials</option>
                  <option>Chrome Powder 33%</option>
                  <option>Sodium Sulphide (60%)</option>
                  <option>Formic Acid</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-medium text-gray-500 whitespace-nowrap">From Date</label>
                <input type="date" defaultValue="2024-04-01" className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-medium text-gray-500 whitespace-nowrap">To Date</label>
                <input type="date" defaultValue="2024-05-31" className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white" />
              </div>
            </div>
            <Table columns={pricingColumns} data={pricing} />
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Showing 1 to 6 of 24 entries</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><ChevronLeft size={14} /></button>
                <button className="w-7 h-7 rounded bg-blue-600 text-white text-xs font-medium">1</button>
                <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">2</button>
                <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">3</button>
                <button className="w-7 h-7 rounded hover:bg-gray-100 text-xs text-gray-600">4</button>
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><ChevronRight size={14} /></button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
