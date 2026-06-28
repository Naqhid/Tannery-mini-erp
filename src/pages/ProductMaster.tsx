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
  Package,
  Box,
  Layers,
  Palette,
  Ruler,
  Save,
  X,
  Download,
  Tag,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface Product {
  code: string;
  name: string;
  category: string;
  leatherType: string;
  uom: string;
  thickness: string;
  status: string;
  color?: string;
  finishType?: string;
  description?: string;
  standardSize?: string;
  grade?: string;
  salesPrice?: string;
  hsnCode?: string;
}

const initialProducts: Product[] = [
  { code: 'PRD-00018', name: 'Finished Leather - Black', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active', color: 'Black', finishType: 'semi-aniline', description: 'Semi aniline finished leather, Black color', standardSize: 'As per Customer Requirement', grade: 'a', salesPrice: '125.00', hsnCode: '4107' },
  { code: 'PRD-00017', name: 'Finished Leather - Brown', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active', color: 'Brown', finishType: 'full-grain', salesPrice: '130.00', hsnCode: '4107', grade: 'a' },
  { code: 'PRD-00016', name: 'Finished Leather - Tan', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Active', color: 'Tan', finishType: 'nappa', salesPrice: '140.00', hsnCode: '4107', grade: 'a' },
  { code: 'PRD-00015', name: 'Suede Leather - Grey', category: 'Finished Leather', leatherType: 'Goat', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Active', color: 'Grey', finishType: 'suede', salesPrice: '110.00', hsnCode: '4107', grade: 'b' },
  { code: 'PRD-00014', name: 'Nubuck Leather - Brown', category: 'Finished Leather', leatherType: 'Buffalo', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active', color: 'Brown', finishType: 'full-grain', salesPrice: '150.00', hsnCode: '4107', grade: 'a' },
  { code: 'PRD-00013', name: 'Patent Leather - Black', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Inactive', color: 'Black', finishType: 'full-grain', salesPrice: '160.00', hsnCode: '4107', grade: 'a' },
  { code: 'PRD-00012', name: 'Pull Up Leather - Dark Brown', category: 'Finished Leather', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.2 - 1.4 mm', status: 'Active', color: 'Dark Brown', finishType: 'pull-up', salesPrice: '135.00', hsnCode: '4107', grade: 'a' },
  { code: 'PRD-00011', name: 'Crust Leather', category: 'Semi Finished', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.4 - 1.6 mm', status: 'Active', color: 'Natural', finishType: 'semi-aniline', salesPrice: '85.00', hsnCode: '4104', grade: 'b' },
  { code: 'PRD-00010', name: 'Wet Blue', category: 'Semi Finished', leatherType: 'Cow', uom: 'Sq. Ft.', thickness: '1.4 - 1.6 mm', status: 'Active', color: 'Blue', salesPrice: '60.00', hsnCode: '4104', grade: 'b' },
  { code: 'PRD-00009', name: 'Split Leather', category: 'Semi Finished', leatherType: 'Buffalo', uom: 'Sq. Ft.', thickness: '1.0 - 1.2 mm', status: 'Active', color: 'Natural', salesPrice: '45.00', hsnCode: '4104', grade: 'c' },
];

export default function ProductMaster() {
  const [products] = useState<Product[]>(initialProducts);
  const [statusToggle, setStatusToggle] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'pricing'>('basic');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPanel = (product?: Product) => {
    setSelectedProduct(product || null);
    setStatusToggle(product ? product.status === 'Active' : true);
    setActiveTab('basic');
    setShowPanel(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200/50">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Product Master</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your product catalog</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-100 shadow-sm">
            <div className="p-1 rounded-md bg-teal-100">
              <Package size={12} className="text-teal-600" />
            </div>
            <span className="text-xs text-teal-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-teal-800">32</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">29</span>
          </div>
        </div>
      </div>

      {/* Product List - Full Width */}
      <div className="bg-white rounded-xl border border-teal-100 shadow-sm shadow-teal-100/50 overflow-hidden ring-1 ring-teal-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-white"
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
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-lg shadow-md shadow-teal-200 hover:shadow-lg hover:shadow-teal-300 transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-teal-50/40 border-b border-teal-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Product Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-amber-500 uppercase tracking-wider hidden lg:table-cell">Leather Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-sky-500 uppercase tracking-wider hidden xl:table-cell">Thickness</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p, index) => (
                <tr key={p.code} className={`hover:bg-teal-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(p)}>
                  <td className="py-3 px-4 relative">
                    <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${p.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-teal-600 font-medium">{p.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        ['bg-teal-500', 'bg-amber-500', 'bg-violet-500', 'bg-sky-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-orange-500', 'bg-emerald-500', 'bg-pink-500'][index % 10]
                      }`}>
                        {p.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-amber-700 font-medium text-xs">{p.leatherType}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-sky-600 text-xs font-medium">{p.thickness}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                      p.status === 'Active'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(p); }} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all">
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
          {filteredProducts.map((p) => (
            <div key={p.code} className="p-4 hover:bg-teal-50/30 transition-colors active:bg-teal-50" onClick={() => openPanel(p)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-teal-500 bg-teal-50 px-1.5 py-0.5 rounded">{p.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1.5">{p.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded text-blue-600 text-[10px] font-medium">{p.category}</span>
                    <span className="text-amber-600 font-medium">{p.leatherType}</span>
                    <span className="text-sky-600">{p.thickness}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openPanel(p); }} className="p-2 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-teal-100/50 bg-gradient-to-r from-slate-50 to-teal-50/30">
          <p className="text-xs text-teal-500 font-medium">Showing 1–10 of 32 entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-teal-300 border border-transparent hover:border-teal-200 transition-all"><ChevronLeft size={14} /></button>
            <button className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-medium shadow-md shadow-teal-200">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-teal-600 border border-transparent hover:border-teal-200 transition-all">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-teal-600 border border-transparent hover:border-teal-200 transition-all">3</button>
            <button className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm text-xs text-teal-600 border border-transparent hover:border-teal-200 items-center justify-center transition-all">4</button>
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-teal-300 border border-transparent hover:border-teal-200 transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {showPanel && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center"
            onClick={() => setShowPanel(false)}
          >
            <div
              className="w-full max-w-[850px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-teal-100/50 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-200/50">
                      <Package size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {selectedProduct ? 'Edit Product' : 'New Product'}
                      </h2>
                      <p className="text-[11px] text-teal-600 font-medium mt-0.5">
                        {selectedProduct ? selectedProduct.code : 'Add a new product record'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all">
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mt-4">
                  {[
                    { id: 'basic' as const, label: 'Basic Info', icon: <Box size={13} />, color: 'from-teal-500 to-emerald-600' },
                    { id: 'specs' as const, label: 'Specifications', icon: <Ruler size={13} />, color: 'from-violet-500 to-purple-600' },
                    { id: 'pricing' as const, label: 'Pricing & Grade', icon: <Tag size={13} />, color: 'from-amber-500 to-orange-600' },
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

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Package size={10} /> Product Identity
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Product Code" required defaultValue={selectedProduct?.code || ''} placeholder="Auto-generated" />
                        <Input label="Product Name" required defaultValue={selectedProduct?.name || ''} placeholder="Enter product name" />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={10} /> Classification
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Select label="Category" required options={[
                          { value: '', label: 'Select category' },
                          { value: 'finished', label: 'Finished Leather' },
                          { value: 'semi', label: 'Semi Finished' },
                          { value: 'raw', label: 'Raw Material' },
                        ]} defaultValue={selectedProduct?.category === 'Finished Leather' ? 'finished' : selectedProduct?.category === 'Semi Finished' ? 'semi' : ''} />
                        <Select label="Leather Type" required options={[
                          { value: '', label: 'Select type' },
                          { value: 'cow', label: 'Cow' },
                          { value: 'buffalo', label: 'Buffalo' },
                          { value: 'goat', label: 'Goat' },
                          { value: 'sheep', label: 'Sheep' },
                        ]} defaultValue={selectedProduct?.leatherType?.toLowerCase() || ''} />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-50/80 to-sky-50/80 border border-cyan-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider flex items-center gap-1.5">
                        📝 Description
                      </p>
                      <textarea
                        rows={3}
                        defaultValue={selectedProduct?.description || ''}
                        placeholder="Product description..."
                        className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none placeholder-gray-400 bg-white"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-violet-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Ruler size={10} /> Dimensions
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Select label="UOM" required options={[
                          { value: 'sqft', label: 'Sq. Ft.' },
                          { value: 'sqm', label: 'Sq. M.' },
                          { value: 'kg', label: 'Kg' },
                        ]} defaultValue={selectedProduct?.uom === 'Sq. Ft.' ? 'sqft' : 'sqm'} />
                        <Select label="Thickness (mm)" options={[
                          { value: '1.2-1.4', label: '1.2 - 1.4 mm' },
                          { value: '1.0-1.2', label: '1.0 - 1.2 mm' },
                          { value: '1.4-1.6', label: '1.4 - 1.6 mm' },
                          { value: '0.8-1.0', label: '0.8 - 1.0 mm' },
                        ]} defaultValue={selectedProduct?.thickness?.includes('1.2') ? '1.2-1.4' : selectedProduct?.thickness?.includes('1.0') ? '1.0-1.2' : '1.4-1.6'} />
                      </div>
                      <Input label="Standard Size" defaultValue={selectedProduct?.standardSize || ''} placeholder="e.g. As per Customer Requirement" />
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Palette size={10} /> Finish & Appearance
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Color / Shade" defaultValue={selectedProduct?.color || ''} placeholder="e.g. Black, Brown" />
                        <Select label="Finish Type" options={[
                          { value: '', label: 'Select finish' },
                          { value: 'semi-aniline', label: 'Semi Aniline' },
                          { value: 'full-grain', label: 'Full Grain' },
                          { value: 'nappa', label: 'Nappa' },
                          { value: 'suede', label: 'Suede' },
                          { value: 'pull-up', label: 'Pull-Up' },
                        ]} defaultValue={selectedProduct?.finishType || ''} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={10} /> Pricing
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Sales Price (₹ / Sq. Ft.)" defaultValue={selectedProduct?.salesPrice || ''} placeholder="e.g. 125.00" />
                        <Input label="HSN Code" defaultValue={selectedProduct?.hsnCode || ''} placeholder="e.g. 4107" />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-100/50 space-y-3">
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={10} /> Quality Grade
                      </p>
                      <Select label="Grade" options={[
                        { value: 'a', label: 'A Grade (Premium)' },
                        { value: 'b', label: 'B Grade (Standard)' },
                        { value: 'c', label: 'C Grade (Economy)' },
                      ]} defaultValue={selectedProduct?.grade || 'a'} />
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200">
                      <p className="text-xs text-teal-700 font-semibold flex items-center gap-1.5">💡 Info</p>
                      <p className="text-[11px] text-teal-600 mt-1">Sales price is per unit (Sq. Ft.). HSN code is used for GST invoicing.</p>
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

              {/* Modal Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-teal-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedProduct ? (
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95">
                      <Trash2 size={13} /> Delete
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                      onClick={() => setShowPanel(false)}
                    >
                      <RotateCcw size={13} /> Cancel
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-lg shadow-md shadow-teal-200 hover:shadow-lg transition-all active:scale-95">
                      <Save size={13} /> {selectedProduct ? 'Update' : 'Save'}
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
