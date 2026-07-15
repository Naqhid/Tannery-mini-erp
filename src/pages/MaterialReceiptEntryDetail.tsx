import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Plus, Trash2, Truck, RotateCcw, Info, Minus } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; }
interface Supplier { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; }
interface Item {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  order_qty: string;
  received_qty: string;
  rate: string;
  amount: number;
  batch_no: string;
  expiry_date: string;
}

interface ReceiptData {
  id?: number;
  receipt_no: string;
  receipt_date: string;
  receipt_type: string;
  supplier_id: string;
  purchase_order_no: string;
  po_date: string;
  challan_no: string;
  challan_date: string;
  lr_grn_no: string;
  lr_grn_date: string;
  transporter: string;
  gate_entry_no: string;
  warehouse_id: string;
  freight: string;
  loading_charges: string;
  other_charges: string;
  remarks: string;
  status: string;
}

const emptyItem: Item = { _key: '', material_id: '', material_code: '', material_name: '', uom: '', order_qty: '', received_qty: '', rate: '', amount: 0, batch_no: '', expiry_date: '' };

const emptyReceipt: ReceiptData = {
  receipt_no: '', receipt_date: new Date().toISOString().split('T')[0], receipt_type: 'Direct Purchase',
  supplier_id: '', purchase_order_no: '', po_date: '', challan_no: '', challan_date: '',
  lr_grn_no: '', lr_grn_date: '', transporter: '', gate_entry_no: '', warehouse_id: '',
  freight: '', loading_charges: '', other_charges: '', remarks: '', status: 'Posted',
};

const RECEIPT_TYPES = [
  { value: 'Purchase Order', label: 'Purchase Order' },
  { value: 'Direct Purchase', label: 'Direct Purchase' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Sample', label: 'Sample' },
  { value: 'Return', label: 'Return' },
];

let _kc = 0;
const genKey = () => `row_${++_kc}_${Date.now()}`;

export default function MaterialReceiptEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [receipt, setReceipt] = useState<ReceiptData>(emptyReceipt);
  const [items, setItems] = useState<Item[]>([{ ...emptyItem, _key: genKey() }]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [searchItem, setSearchItem] = useState('');

  const fetchDropdowns = useCallback(async () => {
    try {
      const [wh, sup, mat] = await Promise.all([
        api<{ data: Warehouse[] }>('/warehouses/dropdown'),
        api<{ data: Supplier[] }>('/suppliers?limit=500'),
        api<{ data: Material[] }>('/materials?limit=500'),
      ]);
      setWarehouses(wh.data || []);
      setSuppliers(sup.data || []);
      setMaterials(mat.data || []);
    } catch { toast.error('Failed to load dropdowns'); }
  }, []);

  const fetchReceipt = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { receipt_no: string } }>('/material-receipts/next-no');
        setReceipt((p) => ({ ...p, receipt_no: res.data.receipt_no }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/material-receipts/${id}`);
      const d = res.data;
      setReceipt({
        ...emptyReceipt,
        ...d,
        receipt_date: d.receipt_date?.split('T')[0] || '',
        po_date: d.po_date?.split('T')[0] || '',
        challan_date: d.challan_date?.split('T')[0] || '',
        lr_grn_date: d.lr_grn_date?.split('T')[0] || '',
        supplier_id: String(d.supplier_id || ''),
        warehouse_id: String(d.warehouse_id || ''),
        freight: String(d.freight || ''),
        loading_charges: String(d.loading_charges || ''),
        other_charges: String(d.other_charges || ''),
      });
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(),
        material_id: String(it.material_id),
        material_code: it.material_code || '',
        material_name: it.material_name || '',
        uom: it.uom || '',
        order_qty: String(it.order_qty || ''),
        received_qty: String(it.received_qty),
        rate: String(it.rate),
        amount: parseFloat(it.amount) || 0,
        batch_no: it.batch_no || '',
        expiry_date: it.expiry_date?.split('T')[0] || '',
      })));
    } catch { toast.error('Failed to load receipt'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchDropdowns(); fetchReceipt(); }, [fetchDropdowns, fetchReceipt]);

  const update = (key: string, value: any) => setReceipt((p) => ({ ...p, [key]: value }));

  const updateItem = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'material_id') {
        const mat = materials.find((m) => String(m.id) === value);
        if (mat) { updated.uom = mat.uom; updated.material_code = mat.code; updated.material_name = mat.name; }
      }
      if (field === 'received_qty' || field === 'rate' || field === 'material_id') {
        const qty = parseFloat(updated.received_qty) || 0;
        const rate = parseFloat(updated.rate) || 0;
        updated.amount = parseFloat((qty * rate).toFixed(2));
      }
      return updated;
    }));
  };

  const addItem = () => setItems((p) => [...p, { ...emptyItem, _key: genKey() }]);
  const removeItem = (key: string) => setItems((p) => p.length > 1 ? p.filter((it) => it._key !== key) : p);

  const handleClear = () => { setReceipt(emptyReceipt); setItems([{ ...emptyItem, _key: genKey() }]); };

  const totalItems = items.filter((i) => i.material_id).length;
  const totalQty = items.reduce((s, i) => s + (parseFloat(i.received_qty) || 0), 0);
  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);
  const freight = parseFloat(receipt.freight) || 0;
  const loadingCharges = parseFloat(receipt.loading_charges) || 0;
  const otherCharges = parseFloat(receipt.other_charges) || 0;
  const totalOtherCharges = freight + loadingCharges + otherCharges;
  const grandTotal = totalAmount + totalOtherCharges;

  const handleSave = async () => {
    if (!receipt.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!receipt.receipt_date) { toast.error('Receipt date is required'); return; }
    const validItems = items.filter((i) => i.material_id && i.received_qty);
    if (!validItems.length) { toast.error('At least one item is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...receipt,
        supplier_id: receipt.supplier_id ? Number(receipt.supplier_id) : null,
        warehouse_id: Number(receipt.warehouse_id),
        freight, loading_charges: loadingCharges, other_charges: otherCharges,
        total_amount: totalAmount, grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          order_qty: parseFloat(i.order_qty) || 0,
          received_qty: parseFloat(i.received_qty) || 0,
          rate: parseFloat(i.rate) || 0,
          amount: i.amount,
          batch_no: i.batch_no || null,
          expiry_date: i.expiry_date || null,
        })),
      };
      if (isNew) {
        const res = await api('/material-receipts', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Receipt created!');
      } else {
        const res = await api(`/material-receipts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Receipt updated!');
      }
      navigate('/material-receipt');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/material-receipt')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-xl shadow-orange-500/30 ring-2 ring-white/50">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Material Receipt' : 'Edit Material Receipt'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{receipt.receipt_no || 'Auto-generated'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Receipt Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Receipt Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Row 1 */}
          <Input label="Receipt No." value={receipt.receipt_no} onChange={(e) => update('receipt_no', e.target.value)} placeholder="Auto-generated" disabled={!isNew} />
          <Input label="Receipt Date" type="date" required value={receipt.receipt_date} onChange={(e) => update('receipt_date', e.target.value)} />
          <Select label="Supplier" required options={[{ value: '', label: 'Select supplier' }, ...suppliers.map((s) => ({ value: String(s.id), label: `${s.name}` }))]} value={receipt.supplier_id} onChange={(e) => update('supplier_id', e.target.value)} />
          <Input label="Challan / Invoice No." value={receipt.challan_no} onChange={(e) => update('challan_no', e.target.value)} placeholder="INV-4587" />
          <Input label="Challan / Invoice Date" type="date" value={receipt.challan_date} onChange={(e) => update('challan_date', e.target.value)} />
          {/* Row 2 */}
          <Select label="Purchase Order No." options={[{ value: '', label: 'Select PO' }]} value={receipt.purchase_order_no} onChange={(e) => update('purchase_order_no', e.target.value)} />
          <Input label="PO Date" type="date" value={receipt.po_date} onChange={(e) => update('po_date', e.target.value)} />
          <Input label="LR / GRN No." value={receipt.lr_grn_no} onChange={(e) => update('lr_grn_no', e.target.value)} placeholder="LR-7896" />
          <Input label="LR / GRN Date" type="date" value={receipt.lr_grn_date} onChange={(e) => update('lr_grn_date', e.target.value)} />
          <Input label="Transporter" value={receipt.transporter} onChange={(e) => update('transporter', e.target.value)} placeholder="Shree Logistics" />
          {/* Row 3 */}
          <Select label="Warehouse / Store" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={receipt.warehouse_id} onChange={(e) => update('warehouse_id', e.target.value)} />
          <Input label="Gate Entry No." value={receipt.gate_entry_no} onChange={(e) => update('gate_entry_no', e.target.value)} placeholder="GE-1254" />
          <Select label="Receipt Type" options={RECEIPT_TYPES} value={receipt.receipt_type} onChange={(e) => update('receipt_type', e.target.value)} />
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-900 mb-1">Remarks</label>
            <textarea
              rows={2}
              value={receipt.remarks}
              onChange={(e) => update('remarks', e.target.value)}
              placeholder="Material received in good condition."
              className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Item Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-orange-50/30">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">2. Item Details</h2>
            <div className="relative">
              <input
                type="text"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                placeholder="Search item by code / name / barcode"
                className="w-64 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 pl-8"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all">
              <Plus size={14} /> Add Row
            </button>
            <button onClick={() => { const last = items[items.length - 1]; if (last && items.length > 1) removeItem(last._key); }} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all">
              <Minus size={14} /> Remove Row
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Code <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Name</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">UOM</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Order Qty</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Received Qty <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Rate (₹)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Amount (₹)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Batch No.</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Expiry Date</th>
                <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-orange-50/30 transition-all">
                  <td className="py-2.5 px-3 text-xs text-gray-500 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <select value={item.material_id} onChange={(e) => updateItem(item._key, 'material_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white min-w-[100px]">
                      <option value="">Select</option>
                      {materials.map((m) => <option key={m.id} value={String(m.id)}>{m.code}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.material_name || '-'}</td>
                  <td className="py-2.5 px-3">
                    <select value={item.uom} onChange={(e) => updateItem(item._key, 'uom', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white min-w-[60px]">
                      <option value="">{item.uom || '-'}</option>
                      <option value="Kg">Kg</option><option value="Ltr">Ltr</option><option value="Mtr">Mtr</option>
                      <option value="Nos">Nos</option><option value="Sq.Ft.">Sq.Ft.</option><option value="Cone">Cone</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.order_qty} onChange={(e) => updateItem(item._key, 'order_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.received_qty} onChange={(e) => updateItem(item._key, 'received_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.rate} onChange={(e) => updateItem(item._key, 'rate', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3 text-xs font-bold text-gray-700 text-right">{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3">
                    <input value={item.batch_no} onChange={(e) => updateItem(item._key, 'batch_no', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-w-[90px]" placeholder="BATCH-001" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="date" value={item.expiry_date} onChange={(e) => updateItem(item._key, 'expiry_date', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Items</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Qty</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalQty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Amount (₹)</span>
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg">{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Middle - Other Charges */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">Other Charges</h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Freight (₹)</span>
              <input type="number" value={receipt.freight} onChange={(e) => update('freight', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Loading / Unloading (₹)</span>
              <input type="number" value={receipt.loading_charges} onChange={(e) => update('loading_charges', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Other Charges (₹)</span>
              <input type="number" value={receipt.other_charges} onChange={(e) => update('other_charges', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="0.00" />
            </div>
          </div>
          {/* Right - Grand Total */}
          <div className="flex flex-col justify-center items-end space-y-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-gray-700">Total Other Charges (₹)</span>
              <span className="text-sm font-bold text-gray-900">{totalOtherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full pt-2 border-t border-orange-200">
              <span className="text-sm font-bold text-gray-900">Grand Total</span>
              <span className="text-lg font-black text-orange-700">{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        {/* Notes */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="flex items-start gap-2 text-xs text-gray-500">
            <Info size={13} className="text-gray-400 mt-0.5 shrink-0" />
            <span>
              <strong>Note:</strong> 1. Please verify quantity and quality before saving.<br />
              2. Stock will be updated in selected warehouse after saving.
            </span>
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/material-receipt')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleClear} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <RotateCcw size={14} /> Clear
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
