import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Plus, Trash2, ArrowLeftRight, RotateCcw, Info, Minus } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; allow_negative_stock: number; }
interface StockItem { material_id: number; material_name: string; material_code: string; uom: string; current_qty: number; avg_unit_cost: number; }
interface Item {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  available_qty: number;
  transfer_qty: string;
  unit_cost: string;
  amount: number;
  batch_no: string;
  remarks: string;
}

interface TransferData {
  id?: number;
  transfer_no: string;
  transfer_date: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  reference_no: string;
  reference_date: string;
  transporter: string;
  delivery_challan_no: string;
  remarks: string;
  status: string;
}

const emptyItem: Item = { _key: '', material_id: '', material_code: '', material_name: '', uom: '', available_qty: 0, transfer_qty: '', unit_cost: '', amount: 0, batch_no: '', remarks: '' };

const emptyTransfer: TransferData = {
  transfer_no: '', transfer_date: new Date().toISOString().split('T')[0],
  from_warehouse_id: '', to_warehouse_id: '', reference_no: '', reference_date: '',
  transporter: '', delivery_challan_no: '', remarks: '', status: 'Posted',
};

let _kc = 0;
const genKey = () => `row_${++_kc}_${Date.now()}`;

export default function StockTransferEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [transfer, setTransfer] = useState<TransferData>(emptyTransfer);
  const [items, setItems] = useState<Item[]>([{ ...emptyItem, _key: genKey() }]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [searchItem, setSearchItem] = useState('');

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api<{ data: Warehouse[] }>('/warehouses/dropdown');
      setWarehouses(res.data || []);
    } catch { setWarehouses([]); }
  }, []);

  const fetchStock = useCallback(async (whId: string) => {
    if (!whId) { setStockList([]); return; }
    try {
      const res = await api<{ data: StockItem[] }>(`/warehouses/${whId}/stock`);
      setStockList(res.data || []);
    } catch { setStockList([]); }
  }, []);

  const fetchTransfer = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { transfer_no: string } }>('/stock-transfers/next-no');
        setTransfer((p) => ({ ...p, transfer_no: res.data.transfer_no }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/stock-transfers/${id}`);
      const d = res.data;
      setTransfer({
        ...emptyTransfer, ...d,
        transfer_date: d.transfer_date?.split('T')[0] || '',
        reference_date: d.reference_date?.split('T')[0] || '',
        from_warehouse_id: String(d.from_warehouse_id || ''),
        to_warehouse_id: String(d.to_warehouse_id || ''),
      });
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(),
        material_id: String(it.material_id),
        material_code: it.material_code || '',
        material_name: it.material_name || '',
        uom: it.uom || '',
        available_qty: parseFloat(it.available_qty) || 0,
        transfer_qty: String(it.transfer_qty),
        unit_cost: String(it.unit_cost),
        amount: parseFloat(it.amount) || 0,
        batch_no: it.batch_no || '',
        remarks: it.remarks || '',
      })));
      fetchStock(String(d.from_warehouse_id));
    } catch { toast.error('Failed to load transfer'); }
    finally { setLoading(false); }
  }, [id, isNew, fetchStock]);

  useEffect(() => { fetchWarehouses(); fetchTransfer(); }, [fetchWarehouses, fetchTransfer]);
  useEffect(() => { if (transfer.from_warehouse_id) fetchStock(transfer.from_warehouse_id); }, [transfer.from_warehouse_id, fetchStock]);

  const update = (key: string, value: any) => setTransfer((p) => ({ ...p, [key]: value }));

  const updateItem = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'material_id') {
        const stock = stockList.find((s) => String(s.material_id) === value);
        if (stock) {
          updated.uom = stock.uom; updated.available_qty = stock.current_qty;
          updated.unit_cost = String(stock.avg_unit_cost);
          updated.material_code = stock.material_code; updated.material_name = stock.material_name;
        }
      }
      if (field === 'transfer_qty' || field === 'unit_cost' || field === 'material_id') {
        const qty = parseFloat(updated.transfer_qty) || 0;
        const cost = parseFloat(updated.unit_cost) || 0;
        updated.amount = parseFloat((qty * cost).toFixed(2));
      }
      return updated;
    }));
  };

  const addItem = () => setItems((p) => [...p, { ...emptyItem, _key: genKey() }]);
  const removeItem = (key: string) => setItems((p) => p.length > 1 ? p.filter((it) => it._key !== key) : p);
  const handleClear = () => { setTransfer(emptyTransfer); setItems([{ ...emptyItem, _key: genKey() }]); };

  const totalItems = items.filter((i) => i.material_id).length;
  const totalQty = items.reduce((s, i) => s + (parseFloat(i.transfer_qty) || 0), 0);
  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);

  const handleSave = async () => {
    if (!transfer.from_warehouse_id) { toast.error('From warehouse is required'); return; }
    if (!transfer.to_warehouse_id) { toast.error('To warehouse is required'); return; }
    if (transfer.from_warehouse_id === transfer.to_warehouse_id) { toast.error('From and To warehouses must be different'); return; }
    if (!transfer.transfer_date) { toast.error('Transfer date is required'); return; }
    const validItems = items.filter((i) => i.material_id && i.transfer_qty);
    if (!validItems.length) { toast.error('At least one item is required'); return; }
    for (const item of validItems) {
      const qty = parseFloat(item.transfer_qty) || 0;
      if (qty > item.available_qty) {
        const wh = warehouses.find((w) => String(w.id) === transfer.from_warehouse_id);
        if (!wh?.allow_negative_stock) { toast.error('Transfer qty exceeds available stock'); return; }
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...transfer,
        from_warehouse_id: Number(transfer.from_warehouse_id),
        to_warehouse_id: Number(transfer.to_warehouse_id),
        total_qty: totalQty, total_amount: totalAmount,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id), uom: i.uom, available_qty: i.available_qty,
          transfer_qty: parseFloat(i.transfer_qty) || 0, unit_cost: parseFloat(i.unit_cost) || 0,
          amount: i.amount, batch_no: i.batch_no || null, remarks: i.remarks || null,
        })),
      };
      if (isNew) {
        const res = await api('/stock-transfers', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Transfer created!');
      } else {
        const res = await api(`/stock-transfers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Transfer updated!');
      }
      navigate('/stock-transfer');
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
          <button onClick={() => navigate('/stock-transfer')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <ArrowLeftRight size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Stock Transfer' : 'Edit Stock Transfer'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{transfer.transfer_no || 'Auto-generated'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Transfer Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Transfer Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Transfer No.</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {transfer.transfer_no || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Select label="From Warehouse / Store" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={transfer.from_warehouse_id} onChange={(e) => update('from_warehouse_id', e.target.value)} />
          <Input label="Reference No." value={transfer.reference_no} onChange={(e) => update('reference_no', e.target.value)} placeholder="REF-2024-101" />
          <Input label="Reference Date" type="date" value={transfer.reference_date} onChange={(e) => update('reference_date', e.target.value)} />
          {/* Row 2 */}
          <Input label="Transfer Date" type="date" required value={transfer.transfer_date} onChange={(e) => update('transfer_date', e.target.value)} />
          <Select label="To Warehouse / Store" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={transfer.to_warehouse_id} onChange={(e) => update('to_warehouse_id', e.target.value)} />
          <Input label="Transporter (if any)" value={transfer.transporter} onChange={(e) => update('transporter', e.target.value)} placeholder="Shree Logistics" />
          <Input label="Delivery Challan No." value={transfer.delivery_challan_no} onChange={(e) => update('delivery_challan_no', e.target.value)} placeholder="DC-4587" />
        </div>
        {/* Remarks */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-900 mb-1">Remarks</label>
          <textarea
            rows={2}
            value={transfer.remarks}
            onChange={(e) => update('remarks', e.target.value)}
            placeholder="Transfer of material for production support."
            className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Section 2: Item Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">2. Item Details</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Add Item</span>
              <div className="relative">
                <input
                  type="text"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  placeholder="Search item by code / name"
                  className="w-56 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pl-8"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
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
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">UOM</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Available Qty<br/><span className="text-[9px] text-gray-400">(From Store)</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Transfer Qty <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Unit Cost</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Amount (â‚¹)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Batch No.</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Remarks</th>
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
                      {stockList.map((s) => <option key={s.material_id} value={String(s.material_id)}>{s.material_name}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.uom || '-'}</td>
                  <td className="py-2.5 px-3 text-xs font-bold text-gray-700 text-right">{item.available_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.transfer_qty} onChange={(e) => updateItem(item._key, 'transfer_qty', e.target.value)}
                      className={`w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right ${
                        parseFloat(item.transfer_qty) > item.available_qty ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`} placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.unit_cost} onChange={(e) => updateItem(item._key, 'unit_cost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3 text-xs font-bold text-gray-700 text-right">{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3">
                    <input value={item.batch_no} onChange={(e) => updateItem(item._key, 'batch_no', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[85px]" placeholder="BATCH-001" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input value={item.remarks} onChange={(e) => updateItem(item._key, 'remarks', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[60px]" placeholder="-" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!transfer.from_warehouse_id && (
                <tr><td colSpan={11} className="py-6 text-center text-xs text-gray-400">Select "From Warehouse / Store" to load available stock</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Items</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Transfer Qty</span>
              <span className="text-sm font-bold text-gray-900 bg-yellow-50 px-3 py-1 rounded-lg">{totalQty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Amount (â‚¹)</span>
              <span className="text-sm font-bold text-gray-900 bg-yellow-50 px-3 py-1 rounded-lg">{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Right - Grand Total */}
          <div className="flex items-center justify-end">
            <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-gray-900">Grand Total (â‚¹)</span>
                <span className="text-2xl font-black text-blue-700">{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Note */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={13} className="text-gray-400 shrink-0" />
            <span><strong>Note:</strong> Stock will be deducted from selected warehouse and added to destination warehouse.</span>
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/stock-transfer')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
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
