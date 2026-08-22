import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save, Plus, Trash2, Loader2, RotateCcw, X,
  ClipboardList, Package, BarChart3, FileSpreadsheet
} from 'lucide-react';
import api from '../lib/api';
import SearchableSelect from '../components/ui/SearchableSelect';
import { usePermission } from '../lib/usePermission';

interface Warehouse { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; }

interface StockItem {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  location: string;
  system_qty: number;
  physical_qty: string;
  variance_qty: number;
  avg_rate: number;
  variance_value: number;
  remarks: string;
}

interface EntryData {
  entry_no: string;
  entry_date: string;
  stock_date: string;
  warehouse_id: string;
  location_id: string;
  remarks: string;
}

const emptyEntry: EntryData = {
  entry_no: '', entry_date: new Date().toISOString().split('T')[0],
  stock_date: new Date().toISOString().split('T')[0],
  warehouse_id: '', location_id: '', remarks: '',
};

let _kc = 0;
const genKey = () => `si_${++_kc}_${Date.now()}`;
const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PhysicalStockEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isReadOnly } = usePermission();
  const isNew = !id || id === 'new';

  const [entry, setEntry] = useState<EntryData>(emptyEntry);
  const [items, setItems] = useState<StockItem[]>([
    { _key: genKey(), material_id: '', material_code: '', material_name: '', uom: '', location: '', system_qty: 0, physical_qty: '', variance_qty: 0, avg_rate: 0, variance_value: 0, remarks: '' },
  ]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [wh, mat] = await Promise.all([
        api<{ data: Warehouse[] }>('/warehouses/dropdown'),
        api<{ data: Material[] }>('/materials/dropdown'),
      ]);
      setWarehouses(wh.data || []);
      setMaterials(mat.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchEntry = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { entry_no: string } }>('/physical-stock-entries/next-no');
        setEntry(p => ({ ...p, entry_no: res.data?.entry_no || '' }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/physical-stock-entries/${id}`);
      const d = res.data;
      setEntry({
        ...emptyEntry,
        entry_no: d.entry_no || '',
        entry_date: d.entry_date?.split('T')[0] || '',
        stock_date: d.stock_date?.split('T')[0] || '',
        warehouse_id: String(d.warehouse_id || ''),
        location_id: String(d.location_id || ''),
        remarks: d.remarks || '',
      });
      if (d.items?.length) {
        setItems(d.items.map((it: any) => ({
          _key: genKey(),
          material_id: String(it.material_id || ''),
          material_code: it.material_code || it.item_code || '',
          material_name: it.material_name || it.item_description || '',
          uom: it.uom || '',
          location: it.location || it.location_rack || '',
          system_qty: parseFloat(it.system_qty) || 0,
          physical_qty: String(it.physical_qty || ''),
          variance_qty: (parseFloat(it.physical_qty) || 0) - (parseFloat(it.system_qty) || 0),
          avg_rate: parseFloat(it.avg_rate) || 0,
          variance_value: parseFloat(it.variance_value) || 0,
          remarks: it.remarks || '',
        })));
      }
    } catch { toast.error('Failed to load entry'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchDropdowns(); fetchEntry(); }, [fetchDropdowns, fetchEntry]);

  const update = (key: keyof EntryData, value: string) => setEntry(p => ({ ...p, [key]: value }));

  // Fetch system qty and avg rate from material transactions when item is selected
  const handleItemChange = async (rowKey: string, materialId: string) => {
    const mat = materials.find(m => String(m.id) === materialId);
    setItems(prev => prev.map(it => {
      if (it._key !== rowKey) return it;
      return { ...it, material_id: materialId, material_code: mat?.code || '', material_name: mat?.name || '', uom: mat?.uom || '', system_qty: 0, avg_rate: 0 };
    }));

    if (!materialId || !entry.warehouse_id) return;
    try {
      const info = await api<{ data: { available_qty: number; avg_rate: number } }>(`/material-issues/item-info/${materialId}?warehouse_id=${entry.warehouse_id}&date=${entry.stock_date || entry.entry_date}`);
      setItems(prev => prev.map(it => {
        if (it._key !== rowKey) return it;
        const systemQty = info.data.available_qty || 0;
        const avgRate = info.data.avg_rate || 0;
        const physQty = parseFloat(it.physical_qty) || 0;
        const variance = physQty - systemQty;
        return { ...it, system_qty: systemQty, avg_rate: avgRate, variance_qty: variance, variance_value: parseFloat((variance * avgRate).toFixed(2)) };
      }));
    } catch {}
  };

  const updateItem = (key: string, field: string, value: string) => {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'physical_qty') {
        const phys = parseFloat(value) || 0;
        updated.variance_qty = phys - updated.system_qty;
        updated.variance_value = parseFloat((updated.variance_qty * updated.avg_rate).toFixed(2));
      }
      return updated;
    }));
  };

  const addItem = () => {
    setItems(p => [...p, { _key: genKey(), material_id: '', material_code: '', material_name: '', uom: '', location: '', system_qty: 0, physical_qty: '', variance_qty: 0, avg_rate: 0, variance_value: 0, remarks: '' }]);
  };

  const removeItem = (key: string) => {
    setItems(p => p.length > 1 ? p.filter(it => it._key !== key) : p);
  };

  const handleClear = () => {
    setEntry({ ...emptyEntry, entry_no: entry.entry_no });
    setItems([{ _key: genKey(), material_id: '', material_code: '', material_name: '', uom: '', location: '', system_qty: 0, physical_qty: '', variance_qty: 0, avg_rate: 0, variance_value: 0, remarks: '' }]);
  };

  const handleSave = async () => {
    if (!entry.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!entry.entry_date) { toast.error('Entry date is required'); return; }
    if (!entry.stock_date) { toast.error('Physical Stock Date is required'); return; }
    const validItems = items.filter(i => i.material_id && i.physical_qty);
    if (!validItems.length) { toast.error('At least one item is required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...entry,
        warehouse_id: Number(entry.warehouse_id),
        location_id: entry.location_id ? Number(entry.location_id) : null,
        items: validItems.map((i, idx) => ({
          seq: idx + 1,
          material_id: Number(i.material_id),
          item_code: i.material_code,
          item_description: i.material_name,
          uom: i.uom,
          location_rack: i.location || null,
          system_qty: i.system_qty,
          physical_qty: parseFloat(i.physical_qty),
          variance_qty: i.variance_qty,
          variance_value: i.variance_value,
          remarks: i.remarks || null,
        })),
      };
      if (isNew) {
        await api('/physical-stock-entries', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Physical stock entry created!');
      } else {
        await api(`/physical-stock-entries/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Physical stock entry updated!');
      }
      navigate('/physical-stock-entry');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  // Summary calculations
  const totalItems = items.filter(i => i.material_id).length;
  const totalSystemQty = items.reduce((s, i) => s + i.system_qty, 0);
  const totalPhysicalQty = items.reduce((s, i) => s + (parseFloat(i.physical_qty) || 0), 0);
  const totalVarianceQty = items.reduce((s, i) => s + i.variance_qty, 0);
  const totalVarianceValue = items.reduce((s, i) => s + i.variance_value, 0);
  const matchedItems = items.filter(i => i.variance_qty === 0 && i.material_id).length;
  const varianceItems = items.filter(i => i.variance_qty !== 0 && i.material_id).length;

  // Get warehouse name for location display
  const selectedWarehouse = warehouses.find(w => String(w.id) === entry.warehouse_id);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Physical Stock Entry</h1>
            <p className="text-xs text-gray-500">Inventory &gt; Physical Stock Entry</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleClear} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <RotateCcw className="w-4 h-4" /> Clear
          </button>
          <button onClick={() => navigate('/physical-stock-entry')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">
            <X className="w-4 h-4" /> Cancel
          </button>
          {!isReadOnly && (
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Entry Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-blue-700">1. Entry Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1.5">Entry No.</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {entry.entry_no || <span className="italic">Auto-generated on save</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Entry Date <span className="text-red-500">*</span></label>
            <input type="date" value={entry.entry_date} onChange={e => update('entry_date', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Physical Stock Date <span className="text-red-500">*</span></label>
            <input type="date" value={entry.stock_date} onChange={e => update('stock_date', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Warehouse <span className="text-red-500">*</span></label>
            <select value={entry.warehouse_id} onChange={e => update('warehouse_id', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w.id} value={String(w.id)}>{w.name} ({w.code})</option>)}
            </select>
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Remarks</label>
            <textarea rows={2} value={entry.remarks} onChange={e => update('remarks', e.target.value)} placeholder="Enter any remarks or notes..." className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Section 2: Stock Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-blue-700">2. Stock Details</h2>
          </div>
          <button onClick={addItem} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 min-w-[180px]">Item Name <span className="text-red-500">*</span></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">UOM</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Location/Rack</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">System Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Physical Qty <span className="text-red-500">*</span></th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Variance Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Avg Rate</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Variance Value</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">{item.material_code || '—'}</td>
                  <td className="px-4 py-3">
                    <SearchableSelect
                      options={materials.map(m => ({ value: String(m.id), label: m.name }))}
                      value={item.material_id}
                      onChange={(val) => handleItemChange(item._key, val)}
                      placeholder="Search item..."
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.uom || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{selectedWarehouse?.name || '—'}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-700 font-medium">{fmt(item.system_qty)}</td>
                  <td className="px-4 py-3">
                    <input type="number" step="0.01" value={item.physical_qty} onChange={e => updateItem(item._key, 'physical_qty', e.target.value)} className="w-full px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-medium ${item.variance_qty < 0 ? 'text-red-600' : item.variance_qty > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {item.variance_qty > 0 ? '+' : ''}{fmt(item.variance_qty)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-700">{fmt(item.avg_rate)}</td>
                  <td className={`px-4 py-3 text-right text-xs font-medium ${item.variance_value < 0 ? 'text-red-600' : item.variance_value > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                    ₹{item.variance_value > 0 ? '+' : ''}{fmt(item.variance_value)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-blue-700">3. Summary</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <div className="text-xs text-gray-500">Total Items</div>
            <div className="text-2xl font-bold text-blue-700">{totalItems}</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <div className="text-xs text-gray-500">Total System Qty</div>
            <div className="text-lg font-bold text-gray-700">{fmt(totalSystemQty)}</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <div className="text-xs text-gray-500">Total Physical Qty</div>
            <div className="text-lg font-bold text-gray-700">{fmt(totalPhysicalQty)}</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${totalVarianceQty < 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="text-xs text-gray-500">Total Variance Qty</div>
            <div className={`text-lg font-bold ${totalVarianceQty < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{totalVarianceQty > 0 ? '+' : ''}{fmt(totalVarianceQty)}</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${totalVarianceValue < 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="text-xs text-gray-500">Total Variance Value</div>
            <div className={`text-lg font-bold ${totalVarianceValue < 0 ? 'text-red-700' : 'text-emerald-700'}`}>₹{totalVarianceValue > 0 ? '+' : ''}{fmt(totalVarianceValue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
