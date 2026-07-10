import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Plus, Trash2, ArrowLeftRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; allow_negative_stock: number; }
interface StockItem { material_id: number; material_name: string; material_code: string; uom: string; current_qty: number; avg_unit_cost: number; }
interface Item {
  _key: string;
  material_id: string;
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

const emptyItem: Item = { _key: '', material_id: '', uom: '', available_qty: 0, transfer_qty: '', unit_cost: '', amount: 0, batch_no: '', remarks: '' };

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
        ...emptyTransfer,
        ...d,
        transfer_date: d.transfer_date?.split('T')[0] || '',
        reference_date: d.reference_date?.split('T')[0] || '',
        from_warehouse_id: String(d.from_warehouse_id || ''),
        to_warehouse_id: String(d.to_warehouse_id || ''),
      });
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(),
        material_id: String(it.material_id),
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
          updated.uom = stock.uom;
          updated.available_qty = stock.current_qty;
          updated.unit_cost = String(stock.avg_unit_cost);
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
  const removeItem = (key: string) => setItems((p) => p.filter((it) => it._key !== key));

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
        if (!wh?.allow_negative_stock) {
          toast.error(`Transfer quantity exceeds available stock for selected material`);
          return;
        }
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...transfer,
        from_warehouse_id: Number(transfer.from_warehouse_id),
        to_warehouse_id: Number(transfer.to_warehouse_id),
        total_qty: totalQty,
        total_amount: totalAmount,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          available_qty: i.available_qty,
          transfer_qty: parseFloat(i.transfer_qty) || 0,
          unit_cost: parseFloat(i.unit_cost) || 0,
          amount: i.amount,
          batch_no: i.batch_no || null,
          remarks: i.remarks || null,
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
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-violet-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/stock-transfer')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30 ring-2 ring-white/50">
            <ArrowLeftRight size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Stock Transfer' : 'Edit Stock Transfer'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{transfer.transfer_no || 'Auto-generated'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/stock-transfer')} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Transfer'}
          </button>
        </div>
      </div>

      {/* Header Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Transfer No" value={transfer.transfer_no} onChange={(e) => update('transfer_no', e.target.value)} placeholder="Auto-generated" />
          <Input label="Transfer Date" type="date" required value={transfer.transfer_date} onChange={(e) => update('transfer_date', e.target.value)} />
          <Select label="From Warehouse" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={transfer.from_warehouse_id} onChange={(e) => update('from_warehouse_id', e.target.value)} />
          <Select label="To Warehouse" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={transfer.to_warehouse_id} onChange={(e) => update('to_warehouse_id', e.target.value)} />
          <Input label="Reference No" value={transfer.reference_no} onChange={(e) => update('reference_no', e.target.value)} placeholder="Reference number" />
          <Input label="Reference Date" type="date" value={transfer.reference_date} onChange={(e) => update('reference_date', e.target.value)} />
          <Input label="Transporter" value={transfer.transporter} onChange={(e) => update('transporter', e.target.value)} placeholder="Transporter name" />
          <Input label="Delivery Challan No" value={transfer.delivery_challan_no} onChange={(e) => update('delivery_challan_no', e.target.value)} placeholder="Challan number" />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-violet-50/30">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Transfer Items</h2>
          <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-all">
            <Plus size={14} /> Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Material</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">UOM</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Available Qty</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Transfer Qty</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Unit Cost</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Batch No</th>
                <th className="text-center py-3 px-4 text-[11px] font-bold text-gray-400 uppercase w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-violet-50/30 transition-all">
                  <td className="py-2 px-4 text-xs text-gray-400 font-bold">{idx + 1}</td>
                  <td className="py-2 px-4">
                    <select value={item.material_id} onChange={(e) => updateItem(item._key, 'material_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white min-w-[180px]">
                      <option value="">Select material</option>
                      {stockList.map((s) => <option key={s.material_id} value={String(s.material_id)}>{s.material_name} ({s.material_code})</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <input value={item.uom} onChange={(e) => updateItem(item._key, 'uom', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-w-[80px]" />
                  </td>
                  <td className="py-2 px-4 text-xs font-bold text-gray-700">{item.available_qty.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-4">
                    <input type="number" value={item.transfer_qty} onChange={(e) => updateItem(item._key, 'transfer_qty', e.target.value)}
                      className={`w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-w-[90px] ${
                        parseFloat(item.transfer_qty) > item.available_qty ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`} />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" value={item.unit_cost} onChange={(e) => updateItem(item._key, 'unit_cost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-w-[100px]" />
                  </td>
                  <td className="py-2 px-4 font-bold text-violet-700 text-xs">₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-4">
                    <input value={item.batch_no} onChange={(e) => updateItem(item._key, 'batch_no', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-w-[100px]" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!transfer.from_warehouse_id && (
                <tr><td colSpan={9} className="py-6 text-center text-xs text-gray-400">Select "From Warehouse" to load available stock</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-violet-50 to-purple-50 border-t-2 border-violet-200">
                <td colSpan={4} className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Total Qty: <span className="text-violet-700">{totalQty.toLocaleString('en-IN')}</span></td>
                <td colSpan={2} className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Total Amount:</td>
                <td className="py-3 px-4 text-lg font-black text-violet-700">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <label className="block text-xs font-medium text-gray-900 mb-1.5">Remarks</label>
        <textarea rows={2} value={transfer.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Additional remarks..."
          className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none" />
      </div>
    </div>
  );
}
