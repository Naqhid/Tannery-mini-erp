import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Plus, Trash2, Truck, RotateCcw, Info, Minus } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; }
interface Supplier { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; primary_uom_name?: string; secondary_uom_name?: string; currency?: string; }
interface Item {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  primary_uom: string;
  secondary_uom: string;
  order_qty: string;
  primary_uom_qty: string;
  secondary_uom_qty: string;
  currency: string;
  exchange_rate: string;
  rate_fc: string;
  rate_inr: number;
  amount_fc: number;
  amount_inr: number;
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
  gst_percent: string;
  remarks: string;
  status: string;
}

const emptyItem: Item = { _key: '', material_id: '', material_code: '', material_name: '', uom: '', primary_uom: '', secondary_uom: '', order_qty: '', primary_uom_qty: '', secondary_uom_qty: '', currency: 'INR', exchange_rate: '1', rate_fc: '', rate_inr: 0, amount_fc: 0, amount_inr: 0, expiry_date: '' };

const emptyReceipt: ReceiptData = {
  receipt_no: '', receipt_date: new Date().toISOString().split('T')[0], receipt_type: 'Direct Purchase',
  supplier_id: '', purchase_order_no: '', po_date: '', challan_no: '', challan_date: '',
  lr_grn_no: '', lr_grn_date: '', transporter: '', gate_entry_no: '', warehouse_id: '',
  freight: '', loading_charges: '', other_charges: '', gst_percent: '', remarks: '', status: 'Posted',
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
        api<{ data: Material[] }>('/materials/dropdown'),
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
        gst_percent: String(d.gst_percent || ''),
      });
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(),
        material_id: String(it.material_id),
        material_code: it.material_code || '',
        material_name: it.material_name || '',
        uom: it.uom || '',
        primary_uom: it.primary_uom || it.material_primary_uom || '',
        secondary_uom: it.secondary_uom || it.material_secondary_uom || '',
        order_qty: String(it.order_qty || ''),
        primary_uom_qty: String(it.primary_uom_qty || ''),
        secondary_uom_qty: String(it.secondary_uom_qty || ''),
        currency: it.currency || 'INR',
        exchange_rate: String(it.exchange_rate || '1'),
        rate_fc: String(it.rate_fc || it.rate || ''),
        rate_inr: parseFloat(it.rate_inr) || 0,
        amount_fc: parseFloat(it.amount_fc) || 0,
        amount_inr: parseFloat(it.amount_inr) || parseFloat(it.amount) || 0,
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
        if (mat) {
          updated.uom = mat.uom;
          updated.material_code = mat.code;
          updated.material_name = mat.name;
          updated.primary_uom = (mat as any).primary_uom_name || mat.uom || '';
          updated.secondary_uom = (mat as any).secondary_uom_name || '';
          updated.currency = (mat as any).currency || 'INR';
          updated.exchange_rate = updated.currency === 'INR' ? '1' : updated.exchange_rate;
        }
      }
      // Recalculate derived values
      const rateFc = parseFloat(updated.rate_fc) || 0;
      const exchangeRate = parseFloat(updated.exchange_rate) || 1;
      const primaryQty = parseFloat(updated.primary_uom_qty) || 0;
      updated.rate_inr = parseFloat((rateFc * exchangeRate).toFixed(4));
      updated.amount_fc = parseFloat((primaryQty * rateFc).toFixed(4));
      updated.amount_inr = parseFloat((updated.amount_fc * exchangeRate).toFixed(4));
      return updated;
    }));
  };

  const addItem = () => setItems((p) => [...p, { ...emptyItem, _key: genKey() }]);
  const removeItem = (key: string) => setItems((p) => p.length > 1 ? p.filter((it) => it._key !== key) : p);

  const handleClear = () => { setReceipt(emptyReceipt); setItems([{ ...emptyItem, _key: genKey() }]); };

  const totalItems = items.filter((i) => i.material_id).length;
  const totalAmountInr = items.reduce((s, i) => s + (i.amount_inr || 0), 0);
  const freight = parseFloat(receipt.freight) || 0;
  const loadingCharges = parseFloat(receipt.loading_charges) || 0;
  const otherCharges = parseFloat(receipt.other_charges) || 0;
  const totalOtherCharges = freight + loadingCharges + otherCharges;
  const gstPercent = parseFloat(receipt.gst_percent) || 0;
  const cgstPercent = gstPercent / 2;
  const sgstPercent = gstPercent / 2;
  const cgstAmount = totalAmountInr * cgstPercent / 100;
  const sgstAmount = totalAmountInr * sgstPercent / 100;
  const totalGstAmount = cgstAmount + sgstAmount;
  const grandTotal = totalAmountInr + totalGstAmount + totalOtherCharges;

  const handleSave = async () => {
    if (!receipt.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!receipt.receipt_date) { toast.error('Receipt date is required'); return; }
    const validItems = items.filter((i) => i.material_id && (parseFloat(i.primary_uom_qty) > 0));
    if (!validItems.length) { toast.error('At least one item with quantity is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...receipt,
        supplier_id: receipt.supplier_id ? Number(receipt.supplier_id) : null,
        warehouse_id: Number(receipt.warehouse_id),
        freight, loading_charges: loadingCharges, other_charges: otherCharges,
        gst_percent: gstPercent,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        total_gst_amount: totalGstAmount,
        total_other_charges: totalOtherCharges,
        total_amount: totalAmountInr, grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          primary_uom: i.primary_uom,
          secondary_uom: i.secondary_uom,
          order_qty: parseFloat(i.order_qty) || 0,
          primary_uom_qty: parseFloat(i.primary_uom_qty) || 0,
          secondary_uom_qty: parseFloat(i.secondary_uom_qty) || 0,
          currency: i.currency,
          exchange_rate: parseFloat(i.exchange_rate) || 1,
          rate_fc: parseFloat(i.rate_fc) || 0,
          rate_inr: i.rate_inr,
          amount_fc: i.amount_fc,
          amount_inr: i.amount_inr,
          batch_no: null,
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
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/material-receipt')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
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
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Receipt No.</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {receipt.receipt_no || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Input label="Receipt Date" type="date" required value={receipt.receipt_date} onChange={(e) => update('receipt_date', e.target.value)} />
          <Select label="Supplier" required options={[{ value: '', label: 'Select supplier' }, ...suppliers.map((s) => ({ value: String(s.id), label: `${s.name}` }))]} value={receipt.supplier_id} onChange={(e) => update('supplier_id', e.target.value)} />
          <Input label="Challan / Invoice No." value={receipt.challan_no} onChange={(e) => update('challan_no', e.target.value)} placeholder="INV-4587" />
          <Input label="Challan / Invoice Date" type="date" value={receipt.challan_date} onChange={(e) => update('challan_date', e.target.value)} />
          {/* Row 2 */}
          <Input label="Purchase Order No." value={receipt.purchase_order_no} onChange={(e) => update('purchase_order_no', e.target.value)} placeholder="Enter PO No." />
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
              className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Item Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">2. Item Details</h2>
            <div className="relative">
              <input
                type="text"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                placeholder="Search item by code / name / barcode"
                className="w-64 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pl-8"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
              <Plus size={14} /> Add Row
            </button>
            <button onClick={() => { const last = items[items.length - 1]; if (last && items.length > 1) removeItem(last._key); }} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
              <Minus size={14} /> Remove Row
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Code</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Name <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Primary UOM</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Secondary UOM</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Primary UOM Qty <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Sec. UOM Qty</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Currency</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Exchange Rate</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Rate(FC)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Rate(INR)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Amount(FC)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Amount(INR)</th>
                <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-blue-50/30 transition-all">
                  <td className="py-2.5 px-3 text-xs text-gray-500 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-700 font-mono">{item.material_code || '-'}</td>
                  <td className="py-2.5 px-3">
                    <select value={item.material_id} onChange={(e) => updateItem(item._key, 'material_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[160px]">
                      <option value="">Select Item</option>
                      {materials.map((m) => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.primary_uom || '-'}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.secondary_uom || 'NA'}</td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.primary_uom_qty} onChange={(e) => updateItem(item._key, 'primary_uom_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.secondary_uom_qty}
                      onChange={(e) => updateItem(item._key, 'secondary_uom_qty', e.target.value)}
                      disabled={!item.secondary_uom || item.secondary_uom === 'NA'}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right ${!item.secondary_uom || item.secondary_uom === 'NA' ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-700 font-medium">{item.currency || 'INR'}</td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.exchange_rate}
                      onChange={(e) => updateItem(item._key, 'exchange_rate', e.target.value)}
                      readOnly={item.currency === 'INR'}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[70px] text-right ${item.currency === 'INR' ? 'bg-gray-100' : ''}`} placeholder="1.00" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.rate_fc} onChange={(e) => updateItem(item._key, 'rate_fc', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3 text-xs font-bold text-gray-700 text-right">{(item.rate_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-xs font-bold text-gray-700 text-right">{(item.amount_fc || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-xs font-bold text-teal-700 text-right">{(item.amount_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
          {/* Left - Totals & GST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Items</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Amount (INR)</span>
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg">{totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-700">GST %</span>
              <input type="number" value={receipt.gst_percent} onChange={(e) => update('gst_percent', e.target.value)}
                className="w-24 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">CGST ({cgstPercent.toFixed(1)}%)</span>
              <span className="text-xs font-semibold text-gray-700">{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">SGST ({sgstPercent.toFixed(1)}%)</span>
              <span className="text-xs font-semibold text-gray-700">{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Total GST Amount</span>
              <span className="text-sm font-bold text-gray-900">{totalGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Middle - Other Charges */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">Other Charges</h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Freight (₹)</span>
              <input type="number" value={receipt.freight} onChange={(e) => update('freight', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Loading / Unloading (₹)</span>
              <input type="number" value={receipt.loading_charges} onChange={(e) => update('loading_charges', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Other Charges (₹)</span>
              <input type="number" value={receipt.other_charges} onChange={(e) => update('other_charges', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-700">Total Other Charges (₹)</span>
              <span className="text-sm font-bold text-gray-900">{totalOtherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Right - Grand Total */}
          <div className="flex flex-col justify-center items-end space-y-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-600">Total Amount (INR)</span>
              <span className="text-sm font-semibold text-gray-900">{totalAmountInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-600">Total GST Amount</span>
              <span className="text-sm font-semibold text-gray-900">{totalGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-600">Total Other Charges</span>
              <span className="text-sm font-semibold text-gray-900">{totalOtherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
