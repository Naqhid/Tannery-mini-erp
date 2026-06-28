import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';

interface Product {
  code: string;
  name: string;
  category: string;
  leatherType: string;
  uom: string;
  thickness: string;
  status: string;
}

const initialProducts: Product[] = [
  { code: 'PRD-00018', name: 'Finished Leather - Black (1.2-1.4mm)', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active' },
  { code: 'PRD-00017', name: 'Finished Leather - Brown (1.2-1.4mm)', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active' },
  { code: 'PRD-00016', name: 'Finished Leather - Tan (1.0-1.2mm)', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Active' },
  { code: 'PRD-00015', name: 'Suede Leather - Grey', category: 'Finished Leather', leatherType: 'Goat', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Active' },
  { code: 'PRD-00014', name: 'Nubuck Leather - Brown', category: 'Finished Leather', leatherType: 'Buffalo', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active' },
  { code: 'PRD-00013', name: 'Patent Leather - Black', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Inactive' },
  { code: 'PRD-00012', name: 'Pull Up Leather - Dark Brown', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active' },
  { code: 'PRD-00011', name: 'Crust Leather', category: 'Semi Finished', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.4 - 1.6 mm', status: 'Active' },
  { code: 'PRD-00010', name: 'Wet Blue', category: 'Semi Finished', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.4 - 1.6 mm', status: 'Active' },
  { code: 'PRD-00009', name: 'Split Leather', category: 'Semi Finished', leatherType: 'Buffalo', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Active' },
];

export default function ProductMaster() {
  const [products] = useState<Product[]>(initialProducts);
  const [statusToggle, setStatusToggle] = useState(true);

  const productColumns = [
    { key: 'code', header: 'Product Code', width: '100px' },
    { key: 'name', header: 'Product Name' },
    { key: 'category', header: 'Category', width: '110px' },
    { key: 'leatherType', header: 'Leather Type', width: '90px' },
    { key: 'uom', header: 'UOM', width: '60px' },
    { key: 'thickness', header: 'Thickness', width: '100px' },
    { key: 'status', header: 'Status', width: '80px', render: (row: Product) => (
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
          <h1 className="text-xl font-bold text-gray-900">Product Master</h1>
          <p className="text-xs text-gray-500 mt-0.5">Masters &gt; Product Master</p>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] gap-5">
        {/* Left - Product Details Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 inline-block border-b-2 border-blue-600 pb-2">Product Details</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Product Code" required defaultValue="PRD-00018" />
                <Input label="Product Name" required defaultValue="Finished Leather - Black (1.2-1.4mm)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Category"
                  required
                  options={[
                    { value: 'finished', label: 'Finished Leather' },
                    { value: 'semi', label: 'Semi Finished' },
                    { value: 'raw', label: 'Raw Material' },
                  ]}
                  defaultValue="finished"
                />
                <Select
                  label="Leather Type"
                  required
                  options={[
                    { value: 'cow', label: 'Cow' },
                    { value: 'buffalo', label: 'Buffalo' },
                    { value: 'goat', label: 'Goat' },
                    { value: 'sheep', label: 'Sheep' },
                  ]}
                  defaultValue="cow"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="UOM"
                  required
                  options={[
                    { value: 'sqft', label: 'Sq. Ft.' },
                    { value: 'sqm', label: 'Sq. M.' },
                    { value: 'kg', label: 'Kg' },
                  ]}
                  defaultValue="sqft"
                />
                <Select
                  label="Thickness (mm)"
                  options={[
                    { value: '1.2-1.4', label: '1.2 - 1.4 mm' },
                    { value: '1.0-1.2', label: '1.0 - 1.2 mm' },
                    { value: '1.4-1.6', label: '1.4 - 1.6 mm' },
                    { value: '0.8-1.0', label: '0.8 - 1.0 mm' },
                  ]}
                  defaultValue="1.2-1.4"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Color / Shade" defaultValue="Black" />
                <Select
                  label="Finish Type"
                  options={[
                    { value: 'semi-aniline', label: 'Semi Aniline' },
                    { value: 'full-grain', label: 'Full Grain' },
                    { value: 'nappa', label: 'Nappa' },
                    { value: 'suede', label: 'Suede' },
                    { value: 'pull-up', label: 'Pull-Up' },
                  ]}
                  defaultValue="semi-aniline"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Description</label>
                <textarea
                  rows={3}
                  defaultValue="Semi aniline finished leather, Black color, Thickness 1.2-1.4 mm"
                  className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Standard Size" defaultValue="As per Customer Requirement" />
                <Select
                  label="Grade"
                  options={[
                    { value: 'a', label: 'A Grade' },
                    { value: 'b', label: 'B Grade' },
                    { value: 'c', label: 'C Grade' },
                  ]}
                  defaultValue="a"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Sales Price (Rs / Sq. Ft.)" defaultValue="125.00" />
                <Input label="HSN Code" defaultValue="4107" />
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

        {/* Right - Product List */}
        <Card
          title="Product List"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product..."
                  className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                />
              </div>
              <Button variant="outline" size="sm" icon={<Filter size={14} />}>{''}</Button>
              <Button size="sm" icon={<Plus size={14} />} variant="teal">Add Product</Button>
            </div>
          }
        >
          <Table columns={productColumns} data={products} />
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing 1 to 10 of 32 entries</p>
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
  );
}
