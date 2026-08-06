import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus, Save, X, Edit2, Trash2, ArrowLeft, ClipboardList, Download, Search,
  RotateCcw, Copy, FileText, Paperclip, MessageSquare,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import SearchableSelect from '../components/ui/SearchableSelect';
import { useDropdowns } from '../lib/useDropdowns';
import { usePermission } from '../lib/usePermission';
import api from '../lib/api';

interface BOMItemRow {
  id: number;
  material_id: number;
  material_code: string;
  material_name: string;
  type: string;
  uom: string;
  qty: number;
  unit_cost: number;
  amount: number;
  scrap_percent: number;
  effective_from: string;
  effective_to: string;
  remarks: string;
  supplier_id?: number | null;
  supplier_name?: string;
}

interface BOMVersion {
  id: number;
  version: string;
  revision: string;
  effective_from: string;
  effective_to: string;
  status: string;
  released_by: string;
  released_on: string;
  is_current: boolean;
}

interface Supplier { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; type: string; standard_cost?: number; last_purchase_price?: number; preferred_supplier_id?: number; }

interface BOM {
  id?: number;
  code: string;
  name: string;
  product_id?: number | null;
  product_name?: string;
  leather_type: string;
  leather_type_id?: number | null;
  process_type: string;
  thickness: string;
  thickness_id?: number | null;
  uom: string;
  uom_id?: number | null;
  valid_from: string;
  valid_to: string;
  status: string;
  description: string;
  version?: number;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
  items?: BOMItemRow[];
}

const emptyBOM: BOM = {
  code: '', name: '', product_id: null, leather_type: '', process_type: 'manufacturing',
  thickness: '', uom: '', valid_from: '', valid_to: '',
  status: 'Active', description: '', version: 1,
};

export default function BOMForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const { canWrite, isReadOnly } = usePermission();

  const [formData, setFormData] = useState<BOM>(emptyBOM);
  const [items, setItems] = useState<BOMItemRow[]>([]);
  const [versions, setVersions] = useState<BOMVersion[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<'components' | 'routings' | 'attachments' | 'notes'>('components');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [componentSearch, setComponentSearch] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  // Item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BOMItemRow | null>(null);
  const [itemForm, setItemForm] = useState({
    material_id: '', qty: '', unit_cost: '', effective_from: '', effective_to: '', remarks: '', supplier_id: ''
  });

  // Import BOM modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [importType, setImportType] = useState<'product' | 'bom'>('product');
  const [importList, setImportList] = useState<BOM[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  const dropdowns = useDropdowns(['products', 'leather-types', 'uom', 'thickness']);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await api<{ data: any[] }>('/machines/dropdown');
      const machines = (res.data || []).map((m: any) => ({
        id: m.id, code: m.code, name: m.name, uom: m.uom_type || 'Per Hour', type: m.machine_type || 'Machine',
        standard_cost: Number(m.rate_indian) || 0, last_purchase_price: Number(m.rate_indian) || 0,
        preferred_supplier_id: m.supplier_id || null,
      }));
      setMaterials(machines);
    }
    catch { setMaterials([]); }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try { const res = await api<{ data: Supplier[] }>('/suppliers?limit=500'); setSuppliers(res.data || []); }
    catch { setSuppliers([]); }
  }, []);

  useEffect(() => { fetchMaterials(); fetchSuppliers(); }, [fetchMaterials, fetchSuppliers]);

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fetchBOM = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const detail = await api<{ data: BOM & { items: BOMItemRow[]; versions: Array<{ id: number; version_no: number; revision_no: number; effective_from: string; effective_to: string; status: string; released_by: string; released_on: string }> } }>(`/boms/${id}`);
      const bom = detail.data;
      setFormData({
        ...emptyBOM,
        ...bom,
        process_type: String(bom.process_type || 'manufacturing').toLowerCase(),
        valid_from: formatDate(bom.valid_from),
        valid_to: formatDate(bom.valid_to),
      });
      setItems((detail.data.items || []).map(item => ({
        ...item,
        qty: Number(item.qty) || 0,
        unit_cost: Number(item.unit_cost) || 0,
        amount: Number(item.amount) || 0,
        scrap_percent: Number(item.scrap_percent) || 0,
        effective_from: item.effective_from || bom.valid_from || '',
        effective_to: item.effective_to || bom.valid_to || '',
      })));
      setSelectedItemIds([]);
      const loadedVersions = (detail.data.versions || []).map((version) => ({
        id: version.id,
        version: `V${String(version.version_no).padStart(2, '0')}`,
        revision: `R${String(version.revision_no).padStart(2, '0')}`,
        effective_from: formatDisplayDate(version.effective_from),
        effective_to: formatDisplayDate(version.effective_to),
        status: version.status,
        released_by: version.released_by || 'Admin User',
        released_on: formatDisplayDate(version.released_on),
        is_current: version.status === 'Active',
      }));
      setVersions(loadedVersions);
      setSelectedVersion(String(loadedVersions.find((version) => version.is_current)?.id || ''));
    } catch { toast.error('Failed to load BOM'); navigate('/bom'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchBOM(); }, [fetchBOM]);

  const updateField = (field: keyof BOM, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (productId: string) => {
    const product = dropdowns['products']?.data.find((p: any) => p.id === Number(productId));
    if (product) {
      setFormData(prev => ({
        ...prev, product_id: product.id,
        name: prev.name || product.name,
        leather_type: product.leather_type || prev.leather_type,
        leather_type_id: product.leather_type_id || prev.leather_type_id,
        thickness: product.thickness || prev.thickness,
        thickness_id: product.thickness_id || prev.thickness_id,
        uom: product.uom || prev.uom,
        uom_id: product.uom_id || prev.uom_id,
      }));
    } else { setFormData(prev => ({ ...prev, product_id: null })); }
  };

  const handleSave = async () => {
    if (!formData.name) { toast.error('BOM Name is required'); return; }
    if (!formData.product_id) { toast.error('Product / Article is required'); return; }
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!isNew) {
        const res = await api(`/boms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'BOM updated successfully!');
        navigate('/bom');
      } else {
        const res = await api<{ data: { id: number }; message?: string }>('/boms', { method: 'POST', body: JSON.stringify(payload) });
        await Promise.all(items.map((item) => api(`/boms/${res.data.id}/items`, {
          method: 'POST',
          body: JSON.stringify({
            material_id: item.material_id,
            type: item.type,
            uom: item.uom,
            qty: item.qty,
            unit_cost: item.unit_cost,
            amount: item.amount,
            remarks: item.remarks,
            supplier_id: item.supplier_id || null,
          }),
        })));
        toast.success(res.message || 'BOM created successfully!');
        navigate('/bom');
      }
    } catch (err) { toast.error('Failed to save BOM: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    navigate('/bom');
  };

  const handleNewRevision = async () => {
    if (isNew || !id) {
      toast.info('Save the BOM before creating a revision.');
      return;
    }
    try {
      await api(`/boms/${id}/revisions`, { method: 'POST', body: JSON.stringify({ change_reason: 'Manual revision' }) });
      toast.success('New BOM revision created.');
      fetchBOM();
    } catch (err) {
      toast.error('Failed to create BOM revision: ' + (err as Error).message);
    }
  };

  // Component CRUD
  const openAddItem = () => {
    setSelectedItem(null);
    setItemForm({ material_id: '', qty: '', unit_cost: '', effective_from: formData.valid_from || '', effective_to: formData.valid_to || '', remarks: '', supplier_id: '' });
    setShowItemModal(true);
  };

  const openEditItem = (item: BOMItemRow) => {
    setSelectedItem(item);
    setItemForm({
      material_id: String(item.material_id), qty: String(item.qty), unit_cost: String(item.unit_cost),
      effective_from: formatDate(item.effective_from),
      effective_to: formatDate(item.effective_to), remarks: item.remarks || '', supplier_id: String(item.supplier_id || ''),
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.material_id || !itemForm.qty) { toast.error('Product and Qty are required'); return; }
    const material = materials.find(m => m.id === Number(itemForm.material_id));
    if (!material) return;
    const qty = parseFloat(itemForm.qty) || 0;
    const unitCost = parseFloat(itemForm.unit_cost) || 0;
    const amount = qty * unitCost;
    const supplier = suppliers.find(s => s.id === Number(itemForm.supplier_id));

    try {
      if (!isNew && formData.id) {
        const payload = {
          material_id: Number(itemForm.material_id), type: material.type, uom: 'Kg',
          qty, unit_cost: unitCost, amount, scrap_percent: 0,
          effective_from: itemForm.effective_from, effective_to: itemForm.effective_to,
          remarks: itemForm.remarks, supplier_id: itemForm.supplier_id ? Number(itemForm.supplier_id) : null,
        };
        if (selectedItem?.id) {
          await api(`/boms/${formData.id}/items/${selectedItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          toast.success('Product updated!');
        } else {
          await api(`/boms/${formData.id}/items`, { method: 'POST', body: JSON.stringify(payload) });
          toast.success('Product added!');
        }
        const detail = await api<{ data: BOM & { items: BOMItemRow[] } }>(`/boms/${formData.id}`);
        setItems(detail.data.items || []);
      } else {
        const newItem: BOMItemRow = {
          id: Date.now(), material_id: material.id, material_code: material.code, material_name: material.name,
          type: material.type, uom: 'Kg', qty, unit_cost: unitCost, amount,
          scrap_percent: 0,
          effective_from: itemForm.effective_from, effective_to: itemForm.effective_to,
          remarks: itemForm.remarks, supplier_id: itemForm.supplier_id ? Number(itemForm.supplier_id) : null,
          supplier_name: supplier?.name || '',
        };
        if (selectedItem?.id) { setItems(prev => prev.map(i => i.id === selectedItem.id ? newItem : i)); }
        else { setItems(prev => [...prev, newItem]); }
      }
      setShowItemModal(false);
    } catch (err) { toast.error('Failed to save product: ' + (err as Error).message); }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      if (!isNew && formData.id) {
        await api(`/boms/${formData.id}/items/${itemId}`, { method: 'DELETE' });
        const detail = await api<{ data: BOM & { items: BOMItemRow[] } }>(`/boms/${formData.id}`);
        setItems(detail.data.items || []);
      } else { setItems(prev => prev.filter(i => i.id !== itemId)); }
      toast.success('Product deleted!');
      setSelectedItemIds((current) => current.filter((selectedId) => selectedId !== itemId));
    } catch (err) { toast.error('Failed to delete: ' + (err as Error).message); }
  };

  const filteredItems = items.filter((item) => {
    const query = componentSearch.trim().toLowerCase();
    return !query || item.material_code.toLowerCase().includes(query) || item.material_name.toLowerCase().includes(query);
  });

  const productOptions = [
    { value: '', label: dropdowns['products']?.loading ? 'Loading...' : 'Select product' },
    ...(formData.product_id && !dropdowns['products']?.options.some((option: { value: string }) => option.value === String(formData.product_id))
      ? [{ value: String(formData.product_id), label: formData.product_name || `Product #${formData.product_id}` }]
      : []),
    ...(dropdowns['products']?.options || []),
  ];

  const toggleItemSelection = (itemId: number) => {
    setSelectedItemIds((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
  };

  const toggleAllItems = () => {
    const visibleIds = filteredItems.map((item) => item.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedItemIds.includes(id));
    setSelectedItemIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };

  const handleBulkDelete = async () => {
    if (!selectedItemIds.length) { toast.error('Select products to delete'); return; }
    try {
      await Promise.all(selectedItemIds.map((itemId) => handleDeleteItem(itemId)));
      setSelectedItemIds([]);
    } catch { /* individual delete errors are already shown */ }
  };

  // Import BOM
  const openImportModal = () => { setImportSearch(''); setImportType('product'); setImportList([]); setShowImportModal(true); };

  const handleImportSearch = async () => {
    if (!importSearch.trim()) return;
    setImportLoading(true);
    try { const res = await api<{ data: BOM[] }>(`/boms?search=${importSearch}&limit=20`); setImportList(res.data || []); }
    catch { setImportList([]); } finally { setImportLoading(false); }
  };

  const handleImportByProduct = async (productId: string) => {
    if (!productId) { setImportList([]); return; }
    setImportLoading(true);
    try { const res = await api<{ data: BOM[] }>(`/boms?limit=20`); setImportList((res.data || []).filter((b: any) => String(b.product_id) === productId)); }
    catch { setImportList([]); } finally { setImportLoading(false); }
  };

  const handleImportBOM = async (sourceBOM: BOM) => {
    try {
      const detail = await api<{ data: BOM & { items: BOMItemRow[] } }>(`/boms/${sourceBOM.id}`);
      const sourceItems = detail.data.items || [];
      setFormData({ ...emptyBOM, name: `Copy of ${sourceBOM.name}`, product_id: sourceBOM.product_id || null,
        leather_type: sourceBOM.leather_type || '', process_type: sourceBOM.process_type || 'Manufacturing',
        uom: sourceBOM.uom || '', description: sourceBOM.description || '' });
      setItems(sourceItems.map(item => ({ ...item, id: Date.now() + Math.random(), scrap_percent: item.scrap_percent || 0, effective_from: item.effective_from || '', effective_to: item.effective_to || '' })));
      setShowImportModal(false);
      toast.success(`Imported ${sourceItems.length} products from ${sourceBOM.name}`);
    } catch (err) { toast.error('Failed to import: ' + (err as Error).message); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/bom')} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{isNew ? 'Create Bill of Materials' : 'Edit Bill of Materials'}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{isNew ? 'Create a BOM and its components' : 'Update the BOM, components, and version details'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isNew ? (
            <>
              <button onClick={handleCancel} disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50">
                <X size={14} /> Cancel
              </button>
              <button onClick={canWrite ? handleSave : undefined} disabled={saving || isReadOnly}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95">
                <Save size={14} /> {saving ? 'Saving...' : 'Save BOM'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/bom/new')} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                <Plus size={14} /> New BOM
              </button>
              <button onClick={openImportModal} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                <Download size={14} /> Import
              </button>
              <button onClick={canWrite ? handleSave : undefined} disabled={saving || isReadOnly}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95">
                <Save size={14} /> {saving ? 'Saving...' : 'Save BOM'}
              </button>
              <button onClick={handleCancel} disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50">
                <X size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Top Section: BOM Header (Left) + BOM Versions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BOM Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-blue-700 mb-4">BOM Header</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">BOM Code <span className="text-red-500">*</span></label>
                <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-h-[34px] flex items-center font-mono">
                  {formData.code || <span className="italic text-gray-400">Auto-generated</span>}
                </div>
              </div>
              <Input label="BOM Name *" value={formData.name || ''} placeholder="Enter BOM name" onChange={(e) => updateField('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Product / Article <span className="text-red-500">*</span></label>
              <Select
                options={productOptions}
                value={String(formData.product_id || '')}
                onChange={(e) => handleProductChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">UOM</label>
                <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[34px] flex items-center">
                  {formData.uom || '-'}
                </div>
              </div>
              <Select
                label="BOM Type"
                options={[
                  { value: 'manufacturing', label: 'Manufacturing' },
                  { value: 'finishing', label: 'Finishing' },
                  { value: 'tanning', label: 'Tanning' },
                  { value: 'dyeing', label: 'Dyeing' },
                ]}
                value={formData.process_type || 'manufacturing'}
                onChange={(e) => updateField('process_type', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${formData.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                  {formData.status || 'Active'}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Description..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOM Version & Validity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-blue-700 mb-4">Version & Validity</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Version</label>
                <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[34px] flex items-center font-bold">
                  {formData.version || 1}
                  <span className="ml-2 text-[10px] text-gray-400 font-normal">(auto-increments on save)</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Status</label>
                <Select
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  value={formData.status || 'Active'}
                  onChange={(e) => updateField('status', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Effective From" type="date" value={formData.valid_from || ''} onChange={(e) => updateField('valid_from', e.target.value)} />
              <Input label="Effective To" type="date" value={formData.valid_to || ''} onChange={(e) => updateField('valid_to', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-gray-200 px-5">
          {[
            { id: 'components' as const, label: 'BOM Products' },
            { id: 'routings' as const, label: 'Routings' },
            { id: 'attachments' as const, label: 'Attachments' },
            { id: 'notes' as const, label: 'Notes' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'components' && (
            <div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={openAddItem} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                    <Plus size={12} /> Add Product
                  </button>
                  <button onClick={openImportModal} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">
                    <Plus size={12} /> Add From Template
                  </button>
                  <button onClick={handleBulkDelete} disabled={!selectedItemIds.length}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                    <Trash2 size={12} /> Delete
                  </button>
                  <button onClick={openImportModal} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                    <Download size={12} /> Import
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span>Compare with</span>
                    <select className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white">
                      <option>-- Select Version --</option>
                      {versions.map(v => <option key={v.id} value={v.id}>{v.version} {v.revision}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={componentSearch} onChange={(event) => setComponentSearch(event.target.value)} placeholder="Search Product" className="pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>

              {/* Components Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200">
                      <th className="py-2.5 px-2 w-8"><input type="checkbox" checked={filteredItems.length > 0 && filteredItems.every((item) => selectedItemIds.includes(item.id))} onChange={toggleAllItems} className="w-3.5 h-3.5 rounded border-gray-300" /></th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-8">#</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">Product Code</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">Product Description</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">Specification</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">UOM</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">Quantity</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">Cost</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">Vendor</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600">Remarks</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.length === 0 ? (
                      <tr><td colSpan={11} className="py-8 text-center text-gray-400 text-xs">No products added yet. Click "Add Product" to start.</td></tr>
                    ) : filteredItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-2 px-2"><input type="checkbox" checked={selectedItemIds.includes(item.id)} onChange={() => toggleItemSelection(item.id)} className="w-3.5 h-3.5 rounded border-gray-300" /></td>
                        <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-2 font-mono text-blue-600 font-medium">{item.material_code}</td>
                        <td className="py-2 px-2 text-gray-900">{item.material_name}</td>
                        <td className="py-2 px-2 text-gray-600">{item.type || '-'}</td>
                        <td className="py-2 px-2 text-gray-600">{item.uom}</td>
                        <td className="py-2 px-2 font-medium text-gray-900">{Number(item.qty || 0).toFixed(4)}</td>
                        <td className="py-2 px-2 text-gray-600">₹{Number(item.unit_cost || 0).toFixed(2)}</td>
                        <td className="py-2 px-2 text-blue-600">{item.supplier_name || '-'}</td>
                        <td className="py-2 px-2 text-gray-500 italic">{item.remarks || '-'}</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => openEditItem(item)} className="p-1 text-blue-400 hover:text-blue-600"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {items.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-2">Showing {filteredItems.length} of {items.length} products</p>
              )}
            </div>
          )}

          {activeTab === 'routings' && (
            <div className="py-8 text-center text-gray-400 text-xs">
              <FileText size={24} className="mx-auto mb-2 text-gray-300" />
              <p>Routings will be available in a future update.</p>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Paperclip size={24} className="mx-auto mb-2 text-gray-300" />
              <p>No attachments uploaded yet.</p>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Enter notes or additional information..."
                className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer - Audit Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
          <div>
            <span className="text-gray-500">Created By</span>
            <p className="font-medium text-gray-800 mt-0.5">{formData.created_by || 'Admin User'}</p>
          </div>
          <div>
            <span className="text-gray-500">Created Date</span>
            <p className="font-medium text-gray-800 mt-0.5">{formatDisplayDate(formData.created_at) || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Modified By</span>
            <p className="font-medium text-gray-800 mt-0.5">{formData.updated_by || 'Admin User'}</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-gray-500">Last Modified Date</span>
              <p className="font-medium text-gray-800 mt-0.5">{formatDisplayDate(formData.updated_at) || '-'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-gray-500">Current Version</span>
                <p className="mt-0.5"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">V0{formData.version || 1} (R0{formData.version || 1})</span></p>
              </div>
              <div className="text-right">
                <span className="text-gray-500">Status</span>
                <p className="mt-0.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${formData.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>{formData.status}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {showItemModal && createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center" onClick={() => setShowItemModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl mx-3 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 mb-4">{selectedItem ? 'Edit Product' : 'Add Product'}</h3>
            <div className="space-y-3">
              {/* Searchable Product/Material dropdown */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Product (Material/Machine) <span className="text-red-500">*</span></label>
                <SearchableSelect
                  options={materials.map(m => ({ value: String(m.id), label: `${m.code} - ${m.name}` }))}
                  value={itemForm.material_id}
                  onChange={(val) => {
                    const material = materials.find(m => m.id === Number(val));
                    setItemForm(prev => ({
                      ...prev,
                      material_id: val,
                      unit_cost: material
                        ? String(material.last_purchase_price != null && material.last_purchase_price > 0
                            ? material.last_purchase_price
                            : (material.standard_cost != null && material.standard_cost > 0 ? material.standard_cost : 0))
                        : prev.unit_cost,
                      supplier_id: material?.preferred_supplier_id ? String(material.preferred_supplier_id) : '',
                    }));
                  }}
                  placeholder="Search product/material/machine..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Quantity *" type="number" value={itemForm.qty} onChange={(e) => setItemForm(prev => ({ ...prev, qty: e.target.value }))} />
                <Input label="Unit Cost" type="number" value={itemForm.unit_cost} onChange={(e) => setItemForm(prev => ({ ...prev, unit_cost: e.target.value }))} />
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">UOM</label>
                  <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[34px] flex items-center">
                    Kg
                  </div>
                </div>
              </div>
              <Select
                label="Vendor (Supplier)"
                options={[
                  { value: '', label: 'Select vendor (optional)' },
                  ...suppliers.map(s => ({ value: String(s.id), label: s.name })),
                ]}
                value={itemForm.supplier_id}
                onChange={(e) => setItemForm(prev => ({ ...prev, supplier_id: e.target.value }))}
              />
              <Input label="Remarks" value={itemForm.remarks} onChange={(e) => setItemForm(prev => ({ ...prev, remarks: e.target.value }))} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowItemModal(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveItem} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{selectedItem ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Import/Copy BOM Modal */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center" onClick={() => setShowImportModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl mx-3" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Copy BOM / Import Template</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500">Select an existing BOM to use as a template.</p>
              <div className="flex gap-2">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button onClick={() => { setImportType('product'); setImportList([]); }} className={`px-3 py-1.5 font-medium transition-colors ${importType === 'product' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>By Product</button>
                  <button onClick={() => { setImportType('bom'); setImportList([]); }} className={`px-3 py-1.5 font-medium transition-colors ${importType === 'bom' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>By BOM Name</button>
                </div>
              </div>
              {importType === 'product' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Product</label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white" onChange={(e) => handleImportByProduct(e.target.value)} defaultValue="">
                    <option value="">-- Select a product --</option>
                    {(dropdowns['products']?.options || []).map((opt: any) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search BOM..." value={importSearch} onChange={(e) => setImportSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleImportSearch()} className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <button onClick={handleImportSearch} className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Search</button>
                </div>
              )}
              <div className="min-h-[100px] max-h-[200px] overflow-y-auto border border-gray-100 rounded-lg">
                {importLoading ? (
                  <div className="flex items-center justify-center py-8 text-xs text-gray-400">Searching...</div>
                ) : importList.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-xs text-gray-400">{importType === 'product' ? 'Select a product above.' : (importSearch ? 'No BOMs found.' : 'Enter a search term.')}</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0"><tr><th className="text-left py-2 px-3 font-semibold text-gray-600">Code</th><th className="text-left py-2 px-3 font-semibold text-gray-600">Name</th><th className="text-left py-2 px-3 font-semibold text-gray-600">Product</th><th className="py-2 px-3"></th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {importList.map(b => (<tr key={b.id} className="hover:bg-blue-50/50"><td className="py-2 px-3 font-mono text-blue-600">{b.code}</td><td className="py-2 px-3 text-gray-800">{b.name}</td><td className="py-2 px-3 text-gray-500">{b.product_name || '-'}</td><td className="py-2 px-3"><button onClick={() => handleImportBOM(b)} className="px-2 py-1 text-[11px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Import</button></td></tr>))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
