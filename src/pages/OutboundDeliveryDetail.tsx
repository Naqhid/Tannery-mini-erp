import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Minus, PackageMinus, Plus, Save, Trash2, X } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SearchableSelect from '../components/ui/SearchableSelect';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; }
interface Supplier { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; primary_uom_name?: string; display_name?: string; }
interface OutboundItem {
  key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  available_qty: number;
  outbound_qty: string;
  unit_cost: string;
  amount: number;
  batch_no: string;
  remarks: string;
  stock_error: string;
}
interface DeliveryForm {
  outbound_no: string;
  outbound_date: string;
  from_warehouse_id: string;
  supplier_id: string;
  reference_no: string;
  reference_date: string;
  transporter: string;
  delivery_challan_no: string;
  remarks: string;
}
const emptyForm: DeliveryForm = {
  outbound_no: '', outbound_date: new Date().toISOString().split('T')[0], from_warehouse_id: '', supplier_id: '',
  reference_no: '', reference_date: '', transporter: '', delivery_challan_no: '', remarks: '',
};
const emptyItem = (): OutboundItem => ({ key: `out_${Date.now()}_${Math.random()}`, material_id: '', material_code: '', material_name: '', uom: '', available_qty: 0, outbound_qty: '', unit_cost: '', amount: 0, batch_no: '', remarks: '', stock_error: '' });

export default function OutboundDeliveryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState<DeliveryForm>(emptyForm);
  const [items, setItems] = useState<OutboundItem[]>([emptyItem()]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [focusedNewRow, setFocusedNewRow] = useState<string | null>(null);

  const loadDropdowns = useCallback(async () => {
    try {
      const [warehouseResult, supplierResult, materialResult] = await Promise.all([
        api<{ data: Warehouse[] }>('/warehouses/dropdown'),
        api<{ data: Supplier[] }>('/suppliers?limit=500&status=Active'),
        api<{ data: Material[] }>('/materials/dropdown'),
      ]);
      setWarehouses(warehouseResult.data || []);
      setSuppliers(supplierResult.data || []);
      setMaterials(materialResult.data || []);
    } catch { toast.error('Failed to load outbound delivery dropdowns'); }
  }, []);

  const loadDelivery = useCallback(async () => {
    if (isNew) {
      try {
        const [outboundNoResponse, challanNoResponse] = await Promise.all([
          api<{ data: { outbound_no: string } }>('/outbound-deliveries/next-no'),
          api<{ data: { delivery_challan_no: string } }>('/outbound-deliveries/next-challan-no'),
        ]);
        setForm((previous) => ({ ...previous, outbound_no: outboundNoResponse.data.outbound_no, delivery_challan_no: challanNoResponse.data.delivery_challan_no }));
      } catch { /* leave the numbers blank for server generation */ }
      return;
    }
    try {
      setLoading(true);
      const response = await api<{ data: any }>(`/outbound-deliveries/${id}`);
      const delivery = response.data;
      setForm({
        ...emptyForm, ...delivery,
        outbound_date: delivery.outbound_date?.split('T')[0] || '',
        reference_date: delivery.reference_date?.split('T')[0] || '',
        from_warehouse_id: String(delivery.from_warehouse_id || ''),
        supplier_id: String(delivery.supplier_id || ''),
      });
      setItems((delivery.items || []).map((item: any) => ({
        key: `out_${item.id}_${Date.now()}`,
        material_id: String(item.material_id), material_code: item.material_code || '', material_name: item.material_name || '',
        uom: item.uom || '', available_qty: Number(item.available_qty) || 0,
        outbound_qty: String(item.outbound_qty || ''), unit_cost: String(item.unit_cost || ''),
        amount: Number(item.amount) || 0, batch_no: item.batch_no || '', remarks: item.remarks || '', stock_error: '',
      })));
    } catch { toast.error('Failed to load outbound delivery'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { void loadDropdowns(); void loadDelivery(); }, [loadDropdowns, loadDelivery]);

  const loadItemInfo = useCallback(async (key: string, materialId: string, warehouseId: string, date: string) => {
    try {
      const response = await api<{ data: { available_qty: number; avg_rate: number } }>(
        `/material-issues/item-info/${materialId}?warehouse_id=${warehouseId}&date=${date}`
      );
      setItems((previous) => previous.map((item) => {
        if (item.key !== key) return item;
        const availableQty = Number(response.data.available_qty) || 0;
        const qty = parseFloat(item.outbound_qty) || 0;
        const unitCost = Number(response.data.avg_rate) || 0;
        return {
          ...item,
          available_qty: availableQty,
          unit_cost: unitCost.toFixed(2),
          amount: Number((qty * unitCost).toFixed(2)),
          stock_error: qty > availableQty + 0.001 ? `Insufficient stock. Available: ${availableQty.toFixed(2)} ${item.uom}` : '',
        };
      }));
    } catch { toast.error('Unable to load warehouse availability and cost'); }
  }, []);

  const updateHeader = (field: keyof DeliveryForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (field === 'from_warehouse_id' && value) {
      items.filter((item) => item.material_id).forEach((item) => {
        void loadItemInfo(item.key, item.material_id, value, form.outbound_date);
      });
    }
  };
  const updateItem = (key: string, field: keyof OutboundItem, value: string) => {
    setItems((previous) => previous.map((item) => {
      if (item.key !== key) return item;
      const next = { ...item, [field]: value };
      if (field === 'outbound_qty' || field === 'unit_cost') {
        next.amount = Number(((parseFloat(next.outbound_qty) || 0) * (parseFloat(next.unit_cost) || 0)).toFixed(2));
      }
      if (field === 'outbound_qty') {
        const qty = parseFloat(value) || 0;
        next.stock_error = qty > next.available_qty + 0.001 ? `Insufficient stock. Available: ${next.available_qty.toFixed(2)} ${next.uom}` : '';
      }
      return next;
    }));
  };

  const focusGrid = (key: string, field: 'material' | 'qty' | 'cost') => {
    requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>(`[data-grid-field="${key}-${field}"]`);
      element?.focus({ preventScroll: true });
      element?.closest('tr')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const selectMaterial = async (key: string, materialId: string) => {
    const material = materials.find((option) => String(option.id) === materialId);
    setItems((previous) => previous.map((item) => item.key !== key ? item : ({
      ...item, material_id: materialId, material_code: material?.code || '', material_name: material?.name || '',
      uom: material?.primary_uom_name || material?.uom || '', available_qty: 0, outbound_qty: '', unit_cost: '', amount: 0, stock_error: '',
    })));
    if (materialId && form.from_warehouse_id) await loadItemInfo(key, materialId, form.from_warehouse_id, form.outbound_date);
    if (materialId) focusGrid(key, 'qty');
  };

  const addRow = (focus = false) => {
    const item = emptyItem();
    setItems((previous) => [...previous, item]);
    if (focus) setFocusedNewRow(item.key);
  };
  const removeRow = (key: string) => setItems((previous) => previous.length > 1 ? previous.filter((item) => item.key !== key) : previous);
  useEffect(() => {
    if (!focusedNewRow) return;
    focusGrid(focusedNewRow, 'material');
    setFocusedNewRow(null);
  }, [focusedNewRow, items]);

  const totalQty = items.reduce((total, item) => total + (parseFloat(item.outbound_qty) || 0), 0);
  const totalAmount = items.reduce((total, item) => total + item.amount, 0);
  const handleGridKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, item: OutboundItem, field: 'qty' | 'cost') => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (field === 'qty') focusGrid(item.key, 'cost');
    else addRow(true);
  };

  const handleSave = async () => {
    if (!form.from_warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!form.supplier_id) { toast.error('Supplier is required'); return; }
    if (!form.outbound_date) { toast.error('Outbound date is required'); return; }
    const validItems = items.filter((item) => item.material_id && (parseFloat(item.outbound_qty) || 0) > 0);
    if (!validItems.length) { toast.error('At least one material with an outbound quantity is required'); return; }
    const stockErrors = validItems.filter((item) => item.stock_error);
    if (stockErrors.length) { toast.error(`Insufficient stock for: ${stockErrors.map((item) => item.material_name).join(', ')}`); return; }
    setSaving(true);
    try {
      const payload = {
        ...form, from_warehouse_id: Number(form.from_warehouse_id), supplier_id: Number(form.supplier_id),
        total_qty: totalQty, total_amount: totalAmount,
        items: validItems.map((item) => ({
          material_id: Number(item.material_id), uom: item.uom, available_qty: item.available_qty,
          outbound_qty: parseFloat(item.outbound_qty) || 0, unit_cost: parseFloat(item.unit_cost) || 0,
          amount: item.amount, batch_no: item.batch_no || null, remarks: item.remarks || null,
        })),
      };
      if (isNew) {
        const response = await api<{ data: { id: number }; message: string }>('/outbound-deliveries', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(response.message || 'Outbound delivery created and stock deducted.');
      } else {
        const response = await api<{ message: string }>(`/outbound-deliveries/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(response.message || 'Outbound delivery updated.');
      }
      navigate('/outbound-delivery');
    } catch (error) { toast.error(`Failed to save: ${(error as Error).message}`); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" /></div>;

  return <div className="space-y-5">
    <div className="flex items-center gap-3">
      <button onClick={() => navigate('/outbound-delivery')} className="rounded-xl border border-gray-200 bg-white p-2.5 hover:bg-gray-50"><ArrowLeft size={18} className="text-gray-600" /></button>
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 p-3 shadow-lg"><PackageMinus size={22} className="text-white" /></div>
      <div><h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Outbound Delivery' : 'Edit Outbound Delivery'}</h1><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{form.outbound_no || 'Auto-generated'}</p></div>
    </div>

    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-orange-700">1. Outbound Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><label className="mb-1 block text-xs font-medium text-gray-900">Outbound No.</label><div className="flex min-h-[34px] items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs text-gray-500">{form.outbound_no || 'Will be generated on save'}</div></div>
        <Input label="Outbound Date" type="date" required value={form.outbound_date} onChange={(event) => updateHeader('outbound_date', event.target.value)} />
        <Select label="From Warehouse / Store" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((warehouse) => ({ value: String(warehouse.id), label: `${warehouse.name} (${warehouse.code})` }))]} value={form.from_warehouse_id} onChange={(event) => updateHeader('from_warehouse_id', event.target.value)} addNewPath="/warehouse-master/new" addNewLabel="Add Warehouse" />
        <Select label="Supplier" required options={[{ value: '', label: 'Select supplier' }, ...suppliers.map((supplier) => ({ value: String(supplier.id), label: `${supplier.name} (${supplier.code})` }))]} value={form.supplier_id} onChange={(event) => updateHeader('supplier_id', event.target.value)} addNewPath="/supplier-master/new" addNewLabel="Add Supplier" />
        <Input label="Reference No." value={form.reference_no} onChange={(event) => updateHeader('reference_no', event.target.value)} placeholder="Return / reference number" />
        <Input label="Reference Date" type="date" value={form.reference_date} onChange={(event) => updateHeader('reference_date', event.target.value)} />
        <Input label="Transporter" value={form.transporter} onChange={(event) => updateHeader('transporter', event.target.value)} placeholder="Transporter" />
        <Input label="Delivery Challan No." value={form.delivery_challan_no} onChange={(event) => updateHeader('delivery_challan_no', event.target.value)} placeholder="Challan number" />
      </div>
      <div className="mt-4"><label className="mb-1 block text-xs font-medium text-gray-900">Remarks</label><textarea rows={2} value={form.remarks} onChange={(event) => updateHeader('remarks', event.target.value)} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Reason for returning material to supplier" /></div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-50 to-orange-50/30 px-6 py-4"><h2 className="text-sm font-bold uppercase tracking-wide text-orange-700">2. Item Details</h2><div className="flex gap-2"><button onClick={() => addRow(true)} className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100"><Plus size={14} /> Add Row</button><button onClick={() => removeRow(items[items.length - 1].key)} disabled={items.length < 2} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 disabled:opacity-40"><Minus size={14} /> Remove Row</button></div></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200 bg-slate-50">{['#', 'Item Code', 'Item Name', 'UOM', 'Available Qty', 'Outbound Qty', 'Unit Cost', 'Amount (₹)', 'Remarks', ''].map((title, index) => <th key={`${title}_${index}`} className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-bold uppercase text-gray-600">{title}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{items.map((item, index) => <tr key={item.key} className="hover:bg-orange-50/30"><td className="px-3 py-2.5 text-xs font-bold text-gray-500">{index + 1}</td><td className="px-3 py-2.5 font-mono text-xs text-gray-700">{item.material_code || '—'}</td><td className="min-w-[260px] px-3 py-2.5"><SearchableSelect options={materials.map((material) => ({ value: String(material.id), label: material.display_name || material.name, searchText: material.code }))} value={item.material_id} onChange={(value) => void selectMaterial(item.key, value)} placeholder="Search material..." addNewPath="/chemical-master/new" addNewLabel="Add Material" autoFocus={focusedNewRow === item.key} dataGridField={`${item.key}-material`} /></td><td className="px-3 py-2.5 text-xs text-gray-700">{item.uom || '—'}</td><td className="px-3 py-2.5 text-right text-xs font-semibold text-gray-700">{item.available_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td className="min-w-[110px] px-3 py-2.5"><input type="number" value={item.outbound_qty} onChange={(event) => updateItem(item.key, 'outbound_qty', event.target.value)} onKeyDown={(event) => handleGridKeyDown(event, item, 'qty')} className={`w-full rounded-lg border px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 ${item.stock_error ? 'border-rose-400 bg-rose-50 focus:ring-rose-500/20' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/20'}`} placeholder="0.00" data-grid-field={`${item.key}-qty`} />{item.stock_error && <p className="mt-1 whitespace-pre-line text-[10px] text-rose-600">{item.stock_error}</p>}</td><td className="min-w-[110px] px-3 py-2.5"><input type="number" value={item.unit_cost} onChange={(event) => updateItem(item.key, 'unit_cost', event.target.value)} onKeyDown={(event) => handleGridKeyDown(event, item, 'cost')} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-right text-xs focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="0.00" data-grid-field={`${item.key}-cost`} /></td><td className="px-3 py-2.5 text-right text-xs font-bold text-gray-700">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td className="min-w-[120px] px-3 py-2.5"><input value={item.remarks} onChange={(event) => updateItem(item.key, 'remarks', event.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-orange-500 focus:outline-none" placeholder="—" /></td><td className="px-3 py-2.5 text-center"><button onClick={() => removeRow(item.key)} aria-label="Remove row" className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
    </section>

    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg"><div className="flex gap-8 text-xs"><span className="text-gray-600">Items <strong className="ml-2 text-gray-900">{items.filter((item) => item.material_id).length}</strong></span><span className="text-gray-600">Total Outbound Qty <strong className="ml-2 text-gray-900">{totalQty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span></div><div className="text-right"><span className="text-xs font-semibold text-gray-500">Total Value</span><p className="text-xl font-black text-orange-700">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p><p className="text-[10px] text-gray-400">Outbound quantities are deducted from the selected warehouse.</p></div></section>

    <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-2xl border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"><button onClick={() => navigate('/outbound-delivery')} className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"><X size={14} /> Cancel</button><button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"><Save size={14} /> {saving ? 'Saving...' : isNew ? 'Create Outbound' : 'Save Changes'}</button></div>
  </div>;
}
