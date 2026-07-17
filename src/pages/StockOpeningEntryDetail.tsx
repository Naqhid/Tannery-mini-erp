import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save, X, ArrowLeft, Plus, Trash2, PackageOpen, RotateCcw, Info,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; }
interface Item {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
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

const emptyItem: Item = { _key: '', material_id: '', material_code: '', material_name: '', uom: '', quantity: '', unit_cost: '', amount: 0, batch_no: '', expiry_date: '' };

const emptyEntry: EntryData = {
  entry_no: '', entry_date: new Date().toISOString().split('T')[0], opening_date: new Date().toISOString().split('T')[0],
  financial_year: '', warehouse_id: '', reference_no: '', costing_method: 'FIFO', remarks: '', status: 'Posted',
};

const COSTING_METHODS = [
  { value: 'FIFO', label: 'FIFO' }, { value: 'LIFO', label: 'LIFO' },
  { value: 'Weighted Average', label: 'Weighted Average' }, { value: 'Standard Cost', label: 'Standard Cost' },
];

const FINANCIAL_YEARS = [
  { value: '', label: 'Select Year' },
  { value: '2023-2024', label: '2023-2024' },
  { value: '2024-2025', label: '2024-2025' },
  { value: '2025-2026', label: '2025-2026' },
  { value: '2026-2027', label: '2026-2027' },
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
  const [searchItem, setSearchItem] = useState('');

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
        material_code: it.material_code || '',
        material_name: it.material_name || '',
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
        if (mat) {
          updated.uom = mat.uom;
          updated.material_code = mat.code;
          updated.material_name = mat.name;
        }
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

  const handleClear = () => {
    setEntry(emptyEntry);
    setItems([{ ...emptyItem, _key: genKey() }]);
  };

  const totalItems = items.filter((i) => i.material_id).length;
  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);

  const handleSave = async () => {
    if (!entry.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!entry.entry_date) { toast.error('Entry date is required'); return; }
    if (!entry.opening_date) { toast.error('Opening date is required'); return; }
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
      </div>

      {/* Section 1: Entry Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Entry Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1: Entry No, Entry Date*, Reference No, Opening Date* */}
          <Input label="Entry No." value={entry.entry_no} onChange={(e) => update('entry_no', e.target.value)} placeholder="Auto-generated" disabled={!isNew} />
          <Input label="Entry Date" type="date" required value={entry.entry_date} onChange={(e) => update('entry_date', e.target.value)} />
          <Input label="Reference No." value={entry.reference_no} onChange={(e) => update('reference_no', e.target.value)} placeholder="e.g. PHYSICAL-2024" />
          <Input label="Opening Date" type="date" required value={entry.opening_date} onChange={(e) => update('opening_date', e.target.value)} />
          {/* Row 2: Financial Year, Warehouse/Store*, Remarks, Costing Method */}
          <Select label="Financial Year" options={FINANCIAL_YEARS} value={entry.financial_year} onChange={(e) => update('financial_year', e.target.value)} />
          <Select label="Warehouse / Store" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={entry.warehouse_id} onChange={(e) => update('warehouse_id', e.target.value)} />
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Remarks</label>
            <textarea
              rows={2}
              value={entry.remarks}
              onChange={(e) => update('remarks', e.target.value)}
              placeholder="Opening stock as on..."
              className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </div>
          <Select label="Costing Method" options={COSTING_METHODS} value={entry.costing_method} onChange={(e) => update('costing_method', e.target.value)} />
        </div>
      </div>

      {/* Section 2: Item Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-teal-50/30">
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
                  className="w-56 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pl-8"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>
          <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all">
            <Plus size={14} /> Add Row
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Item Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Item Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">UOM</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Quantity</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Unit Cost (₹)</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Amount (₹)</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Lot / Batch No.</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Expiry Date</th>
                <th className="text-center py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-teal-50/30 transition-all">
                  <td className="py-2.5 px-4 text-xs text-gray-500 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-4">
                    <select value={item.material_id} onChange={(e) => updateItem(item._key, 'material_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white min-w-[100px]">
                      <option value="">Select</option>
                      {materials.map((m) => <option key={m.id} value={String(m.id)}>{m.code}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-gray-700">{item.material_name || '-'}</td>
                  <td className="py-2.5 px-4 text-xs text-gray-600">{item.uom || '-'}</td>
                  <td className="py-2.5 px-4">
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(item._key, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[90px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-4">
                    <input type="number" value={item.unit_cost} onChange={(e) => updateItem(item._key, 'unit_cost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[90px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-4 text-xs font-bold text-gray-700 text-right">{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-4">
                    <input value={item.batch_no} onChange={(e) => updateItem(item._key, 'batch_no', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-w-[90px]" placeholder="LOT-001" />
                  </td>
                  <td className="py-2.5 px-4">
                    <input type="date" value={item.expiry_date} onChange={(e) => updateItem(item._key, 'expiry_date', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <div className="text-right space-y-1">
            <div className="flex items-center justify-between gap-8">
              <span className="text-xs font-medium text-gray-600">Total Items</span>
              <span className="text-sm font-bold text-gray-900">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-xs font-medium text-gray-600">Total Amount (₹)</span>
              <span className="text-sm font-black text-teal-700">{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50/50">
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={13} className="text-gray-400" />
            <span><strong>Note:</strong> Stock opening quantity and value will be used as opening balance for the selected warehouse.</span>
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/stock-opening-entry')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleClear} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <RotateCcw size={14} /> Clear
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
