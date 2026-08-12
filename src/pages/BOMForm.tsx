import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Save, X, Trash2, ArrowLeft, ClipboardList,
  Paperclip, MessageSquare,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
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

interface Supplier { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; type: string; standard_cost?: number; last_purchase_price?: number; preferred_supplier_id?: number; }
interface Customer { id: number; code: string; name: string; }

interface BOM {
  id?: number;
  code: string;
  name: string;
  product_id?: number | null;
  product_name?: string;
  customer_id?: number | null;
  customer_name?: string;
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
}

const BOM_TYPES = [
  'Wet End',
  'Finishing',
  'Packing',
];

const emptyBOM: BOM = {
  code: '', name: '', product_id: null, customer_id: null, leather_type: '', process_type: 'Wet End Chemicals',
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
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<'components' | 'attachments' | 'notes'>('components');
  const [bomAttachments, setBomAttachments] = useState<{ id: number; file_name: string; file_path: string; file_type: string; file_size: number; uploaded_at: string }[]>([]);

  const dropdowns = useDropdowns(['products', 'leather-types', 'uom', 'thickness']);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await api<{ data: any[] }>('/materials/dropdown');
      const mats = (res.data || []).map((m: any) => ({
        id: m.id, code: m.code, name: m.name, uom: m.primary_uom_name || m.uom || 'Kg', type: m.type || m.category || 'Chemical',
        standard_cost: Number(m.standard_cost) || 0, last_purchase_price: Number(m.last_purchase_price) || 0,
        preferred_supplier_id: m.preferred_supplier_id || null,
      }));
      setMaterials(mats);
    }
    catch { setMaterials([]); }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try { const res = await api<{ data: Supplier[] }>('/suppliers?limit=500'); setSuppliers(res.data || []); }
    catch { setSuppliers([]); }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try { const res = await api<{ data: Customer[] }>('/customers/dropdown'); setCustomers(res.data || []); }
    catch { setCustomers([]); }
  }, []);

  useEffect(() => { fetchMaterials(); fetchSuppliers(); fetchCustomers(); }, [fetchMaterials, fetchSuppliers, fetchCustomers]);

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const fetchBOM = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const detail = await api<{ data: BOM & { items: BOMItemRow[] } }>(`/boms/${id}`);
      const bom = detail.data;
      setFormData({
        ...emptyBOM,
        ...bom,
        process_type: bom.process_type || 'Wet End Chemicals',
        valid_from: formatDate(bom.valid_from),
        valid_to: formatDate(bom.valid_to),
      });
      setItems((detail.data.items || []).map(item => ({
        ...item,
        material_id: item.machine_id || item.material_id,
        qty: Number(item.qty) || 0,
        unit_cost: Number(item.unit_cost) || 0,
        amount: Number(item.amount) || 0,
        scrap_percent: Number(item.scrap_percent) || 0,
        effective_from: item.effective_from || '',
        effective_to: item.effective_to || '',
      })));
      setBomAttachments(detail.data.attachments || []);
    } catch { toast.error('Failed to load BOM'); navigate('/bom'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchBOM(); }, [fetchBOM]);

  const updateField = (field: keyof BOM, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Customer change → auto-generate BOM code
  const handleCustomerChange = async (customerId: string) => {
    const customer = customers.find(c => c.id === Number(customerId));
    setFormData(prev => ({ ...prev, customer_id: customer ? customer.id : null, customer_name: customer?.name || '' }));
    if (customer) {
      try {
        const res = await api<{ data: { code: string } }>(`/boms/generate-code/${encodeURIComponent(customer.name)}`);
        setFormData(prev => ({ ...prev, code: res.data.code }));
      } catch { /* code will be generated on save */ }
    } else {
      setFormData(prev => ({ ...prev, code: '' }));
    }
  };

  const handleProductChange = (productId: string) => {
    const product = dropdowns['products']?.data.find((p: any) => p.id === Number(productId));
    if (product) {
      const version = formData.version || 1;
      const bomName = `${product.name}-V${version}`;
      setFormData(prev => ({
        ...prev, product_id: product.id,
        name: bomName,
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
    if (!formData.customer_id) { toast.error('Customer is required'); return; }
    setSaving(true);
    try {
      const payload: any = { ...formData, customer_name: customers.find(c => c.id === formData.customer_id)?.name || '' };
      if (!isNew) {
        await api(`/boms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('BOM updated successfully!');
        navigate('/bom');
      } else {
        const res = await api<{ data: { id: number }; message?: string }>('/boms', { method: 'POST', body: JSON.stringify(payload) });
        // Save items
        await Promise.all(items.filter(i => i.material_id).map((item) => api(`/boms/${res.data.id}/items`, {
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
        toast.success('BOM created successfully!');
        navigate('/bom');
      }
    } catch (err) { toast.error('Failed to save BOM: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  // --- Inline Grid ---
  const gridRef = useRef<HTMLDivElement>(null);

  const addRow = () => {
    setItems(prev => [...prev, {
      id: Date.now(), material_id: 0, material_code: '', material_name: '',
      type: '', uom: 'Kg', qty: 0, unit_cost: 0, amount: 0, scrap_percent: 0,
      effective_from: '', effective_to: '', remarks: '', supplier_id: null, supplier_name: '',
    }]);
    setTimeout(() => {
      const rows = gridRef.current?.querySelectorAll('tbody tr');
      if (rows && rows.length > 0) {
        rows[rows.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const removeRow = (rowId: number) => {
    if (!isNew && formData.id && typeof rowId === 'number' && rowId < 100000) {
      // Persisted item — delete from server
      api(`/boms/${formData.id}/items/${rowId}`, { method: 'DELETE' }).then(() => {
        setItems(prev => prev.filter(i => i.id !== rowId));
      }).catch(() => toast.error('Failed to delete'));
    } else {
      setItems(prev => prev.filter(i => i.id !== rowId));
    }
  };

  const updateRow = (rowId: number, field: string, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id !== rowId) return item;
      const updated = { ...item, [field]: value };
      if (field === 'material_id') {
        const material = materials.find(m => m.id === Number(value));
        if (material) {
          updated.material_code = material.code;
          updated.material_name = material.name;
          updated.type = material.type;
          updated.uom = material.uom;
          updated.unit_cost = material.last_purchase_price && material.last_purchase_price > 0
            ? material.last_purchase_price
            : (material.standard_cost && material.standard_cost > 0 ? material.standard_cost : 0);
          updated.amount = (Number(updated.qty) || 0) * updated.unit_cost;
          updated.supplier_id = material.preferred_supplier_id || null;
          updated.supplier_name = material.preferred_supplier_id
            ? suppliers.find(s => s.id === material.preferred_supplier_id)?.name || ''
            : '';
        }
      }
      if (field === 'qty' || field === 'unit_cost') {
        updated.amount = (Number(updated.qty) || 0) * (Number(updated.unit_cost) || 0);
      }
      return updated;
    }));
  };

  // Save an inline-edited item to server (for edit mode)
  const saveRowToServer = async (item: BOMItemRow) => {
    if (!formData.id) return;
    const payload = {
      material_id: item.material_id,
      type: item.type,
      uom: 'Kg',
      qty: item.qty,
      unit_cost: item.unit_cost,
      amount: item.amount,
      scrap_percent: 0,
      remarks: item.remarks,
      supplier_id: item.supplier_id || null,
    };
    try {
      if (item.id && typeof item.id === 'number' && item.id < Date.now() - 1000000) {
        await api(`/boms/${formData.id}/items/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const res = await api<{ data: { id: number } }>(`/boms/${formData.id}/items`, { method: 'POST', body: JSON.stringify(payload) });
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, id: res.data.id } : i));
      }
    } catch (err) { toast.error('Failed to save row: ' + (err as Error).message); }
  };

  const productOptions = [
    { value: '', label: dropdowns['products']?.loading ? 'Loading...' : 'Select product' },
    ...(dropdowns['products']?.options || []),
  ];

  const totalAmount = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

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
            <p className="text-xs text-gray-500 mt-0.5">{formData.code || 'Code will be generated after selecting customer'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/bom')} disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50">
            <X size={14} /> Cancel
          </button>
          <button onClick={canWrite ? handleSave : undefined} disabled={saving || isReadOnly}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95">
            <Save size={14} /> {saving ? 'Saving...' : 'Save BOM'}
          </button>
        </div>
      </div>

      {/* BOM Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-blue-700 mb-4">BOM Header</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">BOM Code</label>
                <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-h-[34px] flex items-center font-mono">
                  {formData.code || <span className="italic text-gray-400">Auto-generated</span>}
                </div>
              </div>
              <Input label="BOM Name *" value={formData.name || ''} placeholder="Enter BOM name" onChange={(e) => updateField('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Customer <span className="text-red-500">*</span></label>
                <SearchableSelect
                  options={customers.map(c => ({ value: String(c.id), label: c.name }))}
                  value={String(formData.customer_id || '')}
                  onChange={handleCustomerChange}
                  placeholder="Select customer..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Product / Article</label>
                <Select
                  options={productOptions}
                  value={String(formData.product_id || '')}
                  onChange={(e) => handleProductChange(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="BOM Type"
                options={BOM_TYPES.map(t => ({ value: t, label: t }))}
                value={formData.process_type || 'Wet End Chemicals'}
                onChange={(e) => updateField('process_type', e.target.value)}
              />
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
          </div>
        </div>

        {/* Validity & Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-blue-700 mb-4">Validity & Details</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Effective From" type="date" value={formData.valid_from || ''} onChange={(e) => updateField('valid_from', e.target.value)} />
              <Input label="Effective To" type="date" value={formData.valid_to || ''} onChange={(e) => updateField('valid_to', e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Description..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Version</label>
                <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[34px] flex items-center font-bold">
                  {formData.version || 1}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">UOM</label>
                <div className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[34px] flex items-center">
                  {formData.uom || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Products + Notes (no Routings) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center border-b border-gray-200 px-5">
          {[
            { id: 'components' as const, label: 'BOM Products' },
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

        <div className="p-5">
          {activeTab === 'components' && (
            <div>
              {/* Total */}
              <div className="flex items-center justify-end mb-3">
                <div className="text-xs text-gray-500 font-medium">
                  Total: <span className="text-gray-900">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Inline Editable Grid */}
              {/* Mobile: Card Layout */}
              <div className="md:hidden space-y-3">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs border border-gray-200 rounded-lg">No products added. Click "Add Row" to start.</div>
                ) : items.map((item, idx) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-400">#{idx + 1}</span>
                      <button onClick={() => removeRow(item.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500">Material</label>
                      <SearchableSelect
                        options={materials.map(m => ({ value: String(m.id), label: `${m.code} - ${m.name}` }))}
                        value={String(item.material_id || '')}
                        onChange={(val) => updateRow(item.id, 'material_id', Number(val))}
                        placeholder="Select material..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500">Qty</label>
                        <input type="number" value={item.qty || ''} onChange={(e) => updateRow(item.id, 'qty', Number(e.target.value))}
                          onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500">UOM</label>
                        <div className="px-2 py-1.5 text-xs border border-gray-100 rounded-md bg-gray-50 text-gray-600">{item.uom || 'Kg'}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500">Cost</label>
                        <input type="number" value={item.unit_cost || ''} onChange={(e) => updateRow(item.id, 'unit_cost', Number(e.target.value))}
                          onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500">Amount</label>
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-900 border border-gray-100 rounded-md bg-gray-50">₹{(Number(item.amount) || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500">Supplier</label>
                        <select value={String(item.supplier_id || '')}
                          onChange={(e) => {
                            const sup = suppliers.find(s => s.id === Number(e.target.value));
                            updateRow(item.id, 'supplier_id', e.target.value ? Number(e.target.value) : null);
                            if (sup) updateRow(item.id, 'supplier_name', sup.name);
                            else updateRow(item.id, 'supplier_name', '');
                          }}
                          onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400">
                          <option value="">Select...</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500">Remarks</label>
                      <input type="text" value={item.remarks || ''} onChange={(e) => updateRow(item.id, 'remarks', e.target.value)}
                        onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400" placeholder="..." />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table Layout */}
              <div ref={gridRef} className="hidden md:block border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200">
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-8">#</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 min-w-[220px]">Material Name</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-20">Qty</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-20">UOM</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-24">Cost</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-24">Amount</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 min-w-[150px]">Supplier</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-32">Remarks</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.length === 0 ? (
                      <tr><td colSpan={9} className="py-8 text-center text-gray-400 text-xs">No products added. Click "Add Row" to start.</td></tr>
                    ) : items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-blue-50/20">
                        <td className="py-1.5 px-2 text-gray-500">{idx + 1}</td>
                        <td className="py-1.5 px-2">
                          <SearchableSelect
                            options={materials.map(m => ({ value: String(m.id), label: `${m.code} - ${m.name}` }))}
                            value={String(item.material_id || '')}
                            onChange={(val) => updateRow(item.id, 'material_id', Number(val))}
                            placeholder="Select..."
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input type="number" value={item.qty || ''} onChange={(e) => updateRow(item.id, 'qty', Number(e.target.value))}
                            onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </td>
                        <td className="py-1.5 px-2 text-gray-600">{item.uom || 'Kg'}</td>
                        <td className="py-1.5 px-2">
                          <input type="number" value={item.unit_cost || ''} onChange={(e) => updateRow(item.id, 'unit_cost', Number(e.target.value))}
                            onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </td>
                        <td className="py-1.5 px-2 text-gray-900 font-medium">₹{(Number(item.amount) || 0).toFixed(2)}</td>
                        <td className="py-1.5 px-2">
                          <select
                            value={String(item.supplier_id || '')}
                            onChange={(e) => {
                              const sup = suppliers.find(s => s.id === Number(e.target.value));
                              updateRow(item.id, 'supplier_id', e.target.value ? Number(e.target.value) : null);
                              if (sup) updateRow(item.id, 'supplier_name', sup.name);
                              else updateRow(item.id, 'supplier_name', '');
                            }}
                            onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            <option value="">Select...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </td>
                        <td className="py-1.5 px-2">
                          <input type="text" value={item.remarks || ''} onChange={(e) => updateRow(item.id, 'remarks', e.target.value)}
                            onBlur={() => !isNew && item.material_id && saveRowToServer(item)}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder="..." />
                        </td>
                        <td className="py-1.5 px-2">
                          <button onClick={() => removeRow(item.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sticky Add Row Button */}
              <div className="sticky bottom-0 pt-3 pb-1 bg-white">
                <button onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                  <Plus size={12} /> Add Row
                </button>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              {!isNew && formData.id && (
                <div className="flex items-center justify-end mb-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all cursor-pointer">
                    <Paperclip size={12} /> Upload File
                    <input type="file" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !formData.id) return;
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                        const token = localStorage.getItem('tannery_token');
                        const apiBase = import.meta.env.VITE_API_BASE || '/api';
                        const res = await fetch(`${apiBase}/boms/${formData.id}/attachments`, {
                          method: 'POST',
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                          body: fd,
                        });
                        if (!res.ok) throw new Error('Upload failed');
                        toast.success('File uploaded!');
                        const detail = await api<{ data: any }>(`/boms/${formData.id}`);
                        setBomAttachments(detail.data.attachments || []);
                      } catch (err) { toast.error('Upload failed: ' + (err as Error).message); }
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              )}
              {isNew && <p className="text-xs text-amber-600 mb-3">Save the BOM first to upload attachments.</p>}
              {bomAttachments.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  <Paperclip size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>No attachments uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bomAttachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Paperclip size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-700 font-medium">{att.file_name}</span>
                        <span className="text-[10px] text-gray-400">{(att.file_size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{att.uploaded_at?.split('T')[0]}</span>
                        <button onClick={async () => {
                          if (!formData.id) return;
                          try {
                            await api(`/boms/${formData.id}/attachments/${att.id}`, { method: 'DELETE' });
                            setBomAttachments(prev => prev.filter(a => a.id !== att.id));
                            toast.success('Attachment removed');
                          } catch { toast.error('Failed to remove'); }
                        }} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Enter notes or additional information..."
              className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
