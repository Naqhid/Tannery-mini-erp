import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save, X, ArrowLeft, Plus, Trash2, PackageOpen,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; }
interface Item {
  _key: string;
  material_id: string;
  uom: string;
  quantity: string;
  unit_cost: string;
  amount: number;
  batch_no: string;
  expiry_date: string;
}

interface EntryData {
  id?: number;
  entry_no: string;
  entry_date: string;
  opening_date: string;
  financial_year: string;
  warehouse_id: string;
  reference_no: string;
  costing_method: string;
  remarks: string;
  status: string;
}

const emptyItem: Item = { _key: '', material_id: '', uom: '', quantity: '', unit_cost: '', amount: 0, batch_no: '', expiry_date: '' };

const emptyEntry: EntryData = {
  entry_no: '', entry_date: new Date().toISOString().split('T')[0], opening_date: new Date().toISOString().split('T')[0],
  financial_year: '', warehouse_id: '', reference_no: '', costing_method: 'FIFO', remarks: '', status: 'Posted',
};

const COSTING_METHODS = [
  { value: 'FIFO', label: 'FIFO' }, { value: 'LIFO', label: 'LIFO' },
  { value: 'Weighted Average', label: 'Weighted Average' }, { value: 'Standard Cost', label: 'Standard Cost' },
];

let _keyCounter = 0;
const genKey = () => `row_${++_keyCounter}_${Date.now()}`;

export default function StockOpeningEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [entry, setEntry] = useState<EntryData>(emptyEntry);
  const [items, setItems] = useState<Item[]>([{ ...emptyItem, _key: genKey() }]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [wh, mat] = await Promise.all([
        api<{ data: Warehouse[] }>('/warehouses/dropdown'),
        api<{ data: Material[] }>('/materials?limit=500'),
      ]);
      setWarehouses(wh.data || []);
      setMaterials(mat.data || []);
    } catch { toast.error('Failed to load dropdowns'); }
  }, []);

  const fetchEntry = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { entry_no: string } }>('/stock-opening/next-no');
        setEntry((p) => ({ ...p, entry_no: res.data.entry_no }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/stock-opening/${id}`);
      const d = res.data;
      setEntry({
        ...emptyEntry,
        ...d,
        entry_date: d.entry_date?.split('T')[0] || '',
        opening_date: d.opening_date?.split('T')[0] || '',
        warehouse_id: String(d.warehouse_id || ''),
      });
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(),
        material_id: String(it.material_id),
        uom: it.uom || '',
        quantity: String(it.quantity),
        unit_cost: String(it.unit_cost),
        amount: parseFloat(it.amount) || 0,
        batch_no: it.batch_no || '',
        expiry_date: it.expiry_date?.split('T')[0] || '',
      })));
    } catch { toast.error('Failed to load entry'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchDropdowns(); fetchEntry(); }, [fetchDropdowns, fetchEntry]);

  const update = (key: string, value: any) => setEntry((p) => ({ ...p, [key]: value }));

  const updateItem = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'material_id') {
        const mat = materials.find((m) => String(m.id) === value);
        if (mat) updated.uom = mat.uom;
      }
      if (field === 'quantity' || field === 'unit_cost' || field === 'material_id') {
        const qty = parseFloat(updated.quantity) || 0;
        const cost = parseFloat(updated.unit_cost) || 0;
        updated.amount = parseFloat((qty * cost).toFixed(2));
      }
      return updated;
    }));
  };

  const addItem = () => setItems((p) => [...p, { ...emptyItem, _key: genKey() }]);
  const removeItem = (key: string) => setItems((p) => p.filter((it) => it._key !== key));

  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);

  const handleSave = async () => {
    if (!entry.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!entry.entry_date) { toast.error('Entry date is required'); return; }
    const validItems = items.filter((i) => i.material_id && i.quantity);
    if (!validItems.length) { toast.error('At least one item with material and quantity is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...entry,
        warehouse_id: Number(entry.warehouse_id),
        total_amount: totalAmount,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          quantity: parseFloat(i.quantity) || 0,
          unit_cost: parseFloat(i.unit_cost) || 0,
          amount: i.amount,
          batch_no: i.batch_no || null,
          expiry_date: i.expiry_date || null,
        })),
      };
      if (isNew) {
        const res = await api('/stock-opening', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Opening entry created!');
      } else {
        const res = await api(`/stock-opening/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Opening entry updated!');
      }
      navigate('/stock-opening-entry');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/stock-opening-entry')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-xl shadow-teal-500/30 ring-2 ring-white/50">
            <PackageOpen size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Stock Opening Entry' : 'Edit Stock Opening Entry'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{entry.entry_no || 'Auto-generated'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/stock-opening-entry')} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Header Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Entry No" value={entry.entry_no} onChange={(e) => update('entry_no', e.target.value)} placeholder="Auto-generated" />
          <Input label="Entry Date" type="date" required value={entry.entry_date} onChange={(e) => update('entry_date', e.target.value)} />
          <Input label="Opening Date" type="date" required value={entry.opening_date} onChange={(e) => update('opening_date', e.target.value)} />
          <Input label="Financial Year" value={entry.financial_year} onChange={(e) => update('financial_year', e.target.value)} placeholder="e.g. 2025-2026" />
          <Select label="Warehouse" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={entry.warehouse_id} onChange={(e) => update('warehouse_id', e.target.value)} />
          <Input label="Reference No" value={entry.reference_no} onChange={(e) => update('reference_no', e.target.value)} placeholder="Reference number" />
          <Select label="Costing Method" options={COSTING_METHODS} value={entry.costing_method} onChange={(e) => update('costing_method', e.target.value)} />
          <Input label="Status" value={entry.status} onChange={(e) => update('status', e.target.value)} disabled />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-teal-50/30">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Opening Items</h2>
          <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all">
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
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Quantity</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Unit Cost</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Batch No</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Expiry Date</th>
                <th className="text-center py-3 px-4 text-[11px] font-bold text-gray-400 uppercase w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-teal-50/30 transition-all">
                  <td className="py-2 px-4 text-xs text-gray-400 font-bold">{idx + 1}</td>
                  <td className="py-2 px-4">
                    <select value={item.material_id} onChange={(e) => updateItem(item._key, 'material_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white min-w-[180px]">
                      <option value="">Select material</option>
                      {materials.map((m) => <option key={m.id} value={String(m.id)}>{m.name} ({m.code})</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <input value={item.uom} onChange={(e) => updateItem(item._key, 'uom', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[80px]" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(item._key, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[90px]" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" value={item.unit_cost} onChange={(e) => updateItem(item._key, 'unit_cost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[100px]" />
                  </td>
                  <td className="py-2 px-4 font-bold text-teal-700 text-xs">₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-4">
                    <input value={item.batch_no} onChange={(e) => updateItem(item._key, 'batch_no', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[100px]" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="date" value={item.expiry_date} onChange={(e) => updateItem(item._key, 'expiry_date', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-teal-50 to-cyan-50 border-t-2 border-teal-200">
                <td colSpan={5} className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Total Amount:</td>
                <td className="py-3 px-4 text-lg font-black text-teal-700">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <label className="block text-xs font-medium text-gray-900 mb-1.5">Remarks</label>
        <textarea rows={2} value={entry.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Additional remarks..."
          className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none" />
      </div>
    </div>
  );
}
