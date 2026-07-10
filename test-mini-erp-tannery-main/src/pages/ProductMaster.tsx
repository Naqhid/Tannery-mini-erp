import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
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
  Tag,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportMenu from '../components/ui/ExportMenu';
import { previewPDF, downloadPDF } from '../lib/pdfExport';
import { exportToExcel } from '../lib/excelExport';
import { useDropdowns } from '../lib/useDropdowns';
import api from '../lib/api';

interface Product {
  id?: number;
  code: string;
  name: string;
  category: string;
  category_id?: number | null;
  leather_type: string;
  leather_type_id?: number | null;
  uom: string;
  uom_id?: number | null;
  thickness: string;
  thickness_id?: number | null;
  status: string;
  color?: string;
  color_id?: number | null;
  finish_type?: string;
  finish_type_id?: number | null;
  description?: string;
  standard_size?: string;
  standard_size_id?: number | null;
  grade?: string;
  grade_id?: number | null;
  hsn_code?: string;
  hsn_code_id?: number | null;
  category_name?: string;
  leather_type_name?: string;
  uom_name?: string;
  thickness_name?: string;
  color_name?: string;
  finish_type_name?: string;
  grade_name?: string;
  hsn_name?: string;
  standard_size_name?: string;
}

type SortField = 'code' | 'name' | 'category' | 'leather_type' | 'thickness' | 'status';
type SortOrder = 'asc' | 'desc';

const emptyProduct: Product = {
  code: '', name: '', category: '', leather_type: '', uom: '', thickness: '',
  status: 'Active', color: '', finish_type: '', description: '',
  standard_size: '', grade: '', hsn_code: '',
};

export default function ProductMaster() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [statusToggle, setStatusToggle] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Fetch all dropdowns
  const dropdowns = useDropdowns([
    'product-categories',
    'leather-types',
    'uom',
    'thickness',
    'colors',
    'finish-types',
    'grades',
    'hsn-codes',
    'standard-sizes',
  ]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) {
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
      }
      const res = await api<{ data: Product[]; total: number; page: number; totalPages: number }>(`/products?${params.toString()}`);
      setProducts(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, pageSize, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number } }>('/products/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, sortOrder, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-700 group-hover:text-gray-900" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="text-teal-600" />
      : <ArrowDown size={12} className="text-teal-600" />;
  };

  const openPanel = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({ ...emptyProduct, ...product });
      setStatusToggle(product.status === 'Active');
    } else {
      setSelectedProduct(null);
      setFormData(emptyProduct);
      setStatusToggle(true);
    }
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'Active' : 'Inactive' };
      if (selectedProduct?.id) {
        const res = await api(`/products/${selectedProduct.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Product updated successfully!', { position: 'top-right', autoClose: 3000 });
      } else {
        const res = await api('/products', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Product created successfully!', { position: 'top-right', autoClose: 3000 });
      }
      setShowPanel(false);
      setSearchQuery('');
      setCurrentPage(1);
      fetchProducts();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save product: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api(`/products/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Product deleted successfully!', { position: 'top-right', autoClose: 3000 });
      setShowPanel(false);
      setSearchQuery('');
      setCurrentPage(1);
      fetchProducts();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete product: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    }
  };

  const updateField = (field: keyof Product, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateDropdownField = (field: keyof Product, idField: keyof Product, nameField: keyof Product, value: string) => {
    const selectedId = value ? Number(value) : null;
    const dropdownType = field === 'category' ? 'product-categories' :
                         field === 'leather_type' ? 'leather-types' :
                         field === 'uom' ? 'uom' :
                         field === 'thickness' ? 'thickness' :
                         field === 'color' ? 'colors' :
                         field === 'finish_type' ? 'finish-types' :
                         field === 'grade' ? 'grades' : 'hsn-codes';
    const selectedItem = dropdowns[dropdownType]?.data.find((item: any) => item.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      [idField]: selectedId,
      [field]: selectedItem?.name || '',
    }));
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
            <span className="text-sm font-bold text-teal-800">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* Product List */}
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
            <ExportMenu
              onPreview={() => {
                const columns = ['Code', 'Name', 'Category', 'Leather Type', 'UOM', 'Thickness', 'Status'];
                const rows = products.map(p => [p.code, p.name, p.category_name || p.category, p.leather_type_name || p.leather_type, p.uom_name || p.uom, p.thickness_name || p.thickness, p.status]);
                previewPDF({ title: 'Product Master', subtitle: `Total: ${products.length} products`, columns, rows, accentColor: [16, 185, 129] });
              }}
              onDownload={() => {
                const columns = ['Code', 'Name', 'Category', 'Leather Type', 'UOM', 'Thickness', 'Status'];
                const rows = products.map(p => [p.code, p.name, p.category_name || p.category, p.leather_type_name || p.leather_type, p.uom_name || p.uom, p.thickness_name || p.thickness, p.status]);
                downloadPDF({ title: 'Product Master', subtitle: `Total: ${products.length} products`, columns, rows, accentColor: [16, 185, 129], fileName: 'Product_Master.pdf' });
              }}
              onExcel={() => {
                exportToExcel({
                  data: products,
                  columns: [
                    { key: 'code', header: 'Code' },
                    { key: 'name', header: 'Name' },
                    { key: 'category_name', header: 'Category' },
                    { key: 'leather_type_name', header: 'Leather Type' },
                    { key: 'uom_name', header: 'UOM' },
                    { key: 'thickness_name', header: 'Thickness' },
                    { key: 'status', header: 'Status' },
                  ],
                  fileName: 'Product_Master',
                });
              }}
            />
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
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-teal-600 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('code')}><span className="inline-flex items-center gap-1">Code <SortIcon field="code" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-violet-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}><span className="inline-flex items-center gap-1">Product Name <SortIcon field="name" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer group select-none" onClick={() => handleSort('category')}><span className="inline-flex items-center gap-1">Category <SortIcon field="category" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-amber-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer group select-none" onClick={() => handleSort('leather_type')}><span className="inline-flex items-center gap-1">Leather Type <SortIcon field="leather_type" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-sky-500 uppercase tracking-wider hidden xl:table-cell cursor-pointer group select-none" onClick={() => handleSort('thickness')}><span className="inline-flex items-center gap-1">Thickness <SortIcon field="thickness" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}><span className="inline-flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No products found</td></tr>
              ) : products.map((p, index) => (
                <tr key={p.id || p.code} className={`hover:bg-teal-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(p)}>
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
                      {p.category_name || p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-amber-700 font-medium text-xs">{p.leather_type_name || p.leather_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-sky-600 text-xs font-medium">{p.thickness_name || p.thickness}</span>
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
                      <button onClick={(e) => { e.stopPropagation(); p.id && handleDelete(p.id); }} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all">
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
          {products.map((p) => (
            <div key={p.id || p.code} className="p-4 hover:bg-gray-50/50 transition-colors active:bg-gray-100" onClick={() => openPanel(p)}>
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
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded text-blue-600 text-[10px] font-medium">{p.category_name || p.category}</span>
                    <span className="text-amber-600 font-medium">{p.leather_type_name || p.leather_type}</span>
                    <span className="text-sky-600">{p.thickness_name || p.thickness}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openPanel(p); }} className="p-2 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); p.id && handleDelete(p.id); }} className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-teal-100/50 bg-gradient-to-r from-slate-50 to-teal-50/30">
          <div className="flex items-center gap-3">
            <p className="text-xs text-teal-500 font-medium">
              Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
            </p>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="text-xs border border-teal-200 rounded-lg px-2 py-1 text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-teal-300 border border-transparent hover:border-teal-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - currentPage) <= 1) return true;
                return false;
              })
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-teal-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      currentPage === item
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-200'
                        : 'hover:bg-white hover:shadow-sm text-teal-600 border border-transparent hover:border-teal-200'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-teal-300 border border-transparent hover:border-teal-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
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
              className="w-full max-w-[900px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3"
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
              </div>

              {/* Modal Body - Single Form with All Fields */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                {/* Product Identity */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Box size={10} /> Product Identity
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Product Code" value={formData.code || ''} placeholder="Auto-generated" onChange={(e) => updateField('code', e.target.value)} />
                    <Input label="Product Name" required value={formData.name || ''} placeholder="Enter product name" onChange={(e) => updateField('name', e.target.value)} />
                  </div>
                </div>

                {/* Classification */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={10} /> Classification
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Category"
                      required
                      options={[
                        { value: '', label: dropdowns['product-categories']?.loading ? 'Loading...' : 'Select category' },
                        ...(dropdowns['product-categories']?.options || []),
                      ]}
                      value={String(formData.category_id || '')}
                      onChange={(e) => updateDropdownField('category', 'category_id', 'category', e.target.value)}
                    />
                    <Select
                      label="Leather Type"
                      required
                      options={[
                        { value: '', label: dropdowns['leather-types']?.loading ? 'Loading...' : 'Select type' },
                        ...(dropdowns['leather-types']?.options || []),
                      ]}
                      value={String(formData.leather_type_id || '')}
                      onChange={(e) => updateDropdownField('leather_type', 'leather_type_id', 'leather_type', e.target.value)}
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-violet-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler size={10} /> Specifications
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Select
                      label="UOM"
                      required
                      options={[
                        { value: '', label: dropdowns['uom']?.loading ? 'Loading...' : 'Select UOM' },
                        ...(dropdowns['uom']?.options || []),
                      ]}
                      value={String(formData.uom_id || '')}
                      onChange={(e) => updateDropdownField('uom', 'uom_id', 'uom', e.target.value)}
                    />
                    <Select
                      label="Thickness"
                      required
                      options={[
                        { value: '', label: dropdowns['thickness']?.loading ? 'Loading...' : 'Select thickness' },
                        ...(dropdowns['thickness']?.options || []),
                      ]}
                      value={String(formData.thickness_id || '')}
                      onChange={(e) => updateDropdownField('thickness', 'thickness_id', 'thickness', e.target.value)}
                    />
                    <Select
                      label="Standard Size"
                      options={[
                        { value: '', label: dropdowns['standard-sizes']?.loading ? 'Loading...' : 'Select size' },
                        ...(dropdowns['standard-sizes']?.options || []),
                      ]}
                      value={String(formData.standard_size_id || '')}
                      onChange={(e) => updateDropdownField('standard_size', 'standard_size_id', 'standard_size', e.target.value)}
                    />
                  </div>
                </div>

                {/* Finish & Appearance */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette size={10} /> Finish & Appearance
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Select
                      label="Color"
                      options={[
                        { value: '', label: dropdowns['colors']?.loading ? 'Loading...' : 'Select color' },
                        ...(dropdowns['colors']?.options || []),
                      ]}
                      value={String(formData.color_id || '')}
                      onChange={(e) => updateDropdownField('color', 'color_id', 'color', e.target.value)}
                    />
                    <Select
                      label="Finish Type"
                      options={[
                        { value: '', label: dropdowns['finish-types']?.loading ? 'Loading...' : 'Select finish' },
                        ...(dropdowns['finish-types']?.options || []),
                      ]}
                      value={String(formData.finish_type_id || '')}
                      onChange={(e) => updateDropdownField('finish_type', 'finish_type_id', 'finish_type', e.target.value)}
                    />
                    <Select
                      label="Grade"
                      options={[
                        { value: '', label: dropdowns['grades']?.loading ? 'Loading...' : 'Select grade' },
                        ...(dropdowns['grades']?.options || []),
                      ]}
                      value={String(formData.grade_id || '')}
                      onChange={(e) => updateDropdownField('grade', 'grade_id', 'grade', e.target.value)}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={10} /> Additional Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="HSN Code"
                      options={[
                        { value: '', label: dropdowns['hsn-codes']?.loading ? 'Loading...' : 'Select HSN' },
                        ...(dropdowns['hsn-codes']?.options || []),
                      ]}
                      value={String(formData.hsn_code_id || '')}
                      onChange={(e) => updateDropdownField('hsn_code', 'hsn_code_id', 'hsn_code', e.target.value)}
                    />
                    <div className="flex items-end">
                      <Input
                        label="Description"
                        value={formData.description || ''}
                        placeholder="Product description"
                        onChange={(e) => updateField('description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

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
                    {statusToggle ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-teal-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedProduct ? (
                    <button onClick={() => selectedProduct?.id && handleDelete(selectedProduct.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95">
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
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-lg shadow-md shadow-teal-200 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                      <Save size={13} /> {saving ? 'Saving...' : selectedProduct ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
