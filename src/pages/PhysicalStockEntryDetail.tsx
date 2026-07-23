import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save, Plus, Trash2, Loader2, Download, Upload, RotateCcw, X,
  ClipboardList, Search, MessageSquare, Package, BarChart3, FileSpreadsheet
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface Warehouse { id: number; code: string; name: string; }
interface Location { id: number; code: string; name: string; }
interface Material { id: number; code: string; name: string; uom: string; type?: string; }

interface StockItem {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  batch_no: string;
  location: string;
  system_qty: number;
  physical_qty: string;
  variance_qty: number;
  variance_value: number;
  remarks: string;
}

interface EntryData {
  entry_no: string;
  entry_date: string;
  stock_date: string;
  reference_no: string;
  warehouse_id: string;
  location_id: string;
  item_group: string;
  material_id: string;
  uom: string;
  batch_no: string;
  from_item_code: string;
  to_item_code: string;
  remarks: string;
}

const emptyEntry: EntryData = {
  entry_no: '', entry_date: new Date().toISOString().split('T')[0],
  stock_date: new Date().toISOString().split('T')[0], reference_no: '',
  warehouse_id: '', location_id: '', item_group: '', material_id: '',
  uom: '', batch_no: '', from_item_code: '', to_item_code: '', remarks: '',
};

let _kc = 0;
const genKey = () => `si_${++_kc}_${Date.now()}`;

export default function PhysicalStockEntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isReadOnly } = usePermission();
  const isNew = !id || id === 'new';

  const [entry, setEntry] = useState<EntryData>(emptyEntry);
  const [items, setItems] = useState<StockItem[]>([
    { _key: genKey(), material_id: '', material_code: '', material_name: '', uom: '', batch_no: '', location: '', system_qty: 0, physical_qty: '', variance_qty: 0, variance_value: 0, remarks: '' },
  ]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [wh, loc, mat] = await Promise.all([
        api<{ data: Warehouse[] }>('/warehouses/dropdown'),
        api<{ data: Location[] }>('/locations?limit=500'),
        api<{ data: Material[] }>('/materials?limit=500'),
      ]);
      setWarehouses(wh.data || []);
      setLocations(loc.data || []);
      setMaterials(mat.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchEntry = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { entry_no: string } }>('/physical-stock-entry/next-no');
        setEntry(p => ({ ...p, entry_no: res.data.entry_no }));
      } catch {
        setEntry(p => ({ ...p, entry_no: 'PSE-2025-0042' }));
      }
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/physical-stock-entry/${id}`);
      const d = res.data;
      setEntry({
        ...emptyEntry,
        ...d,
        entry_date: d.entry_date?.split('T')[0] || '',
        stock_date: d.stock_date?.split('T')[0] || '',
        warehouse_id: String(d.warehouse_id || ''),
        location_id: String(d.location_id || ''),
      });
      if (d.items?.length) {
        setItems(d.items.map((it: any) => ({
          _key: genKey(),
          material_id: String(it.material_id),
          material_code: it.material_code || '',
          material_name: it.material_name || '',
          uom: it.uom || '',
          batch_no: it.batch_no || '',
          location: it.location || '',
          system_qty: it.system_qty || 0,
          physical_qty: String(it.physical_qty || ''),
          variance_qty: (it.physical_qty || 0) - (it.system_qty || 0),
          variance_value: it.variance_value || 0,
          remarks: it.remarks || '',
        })));
      }
    } catch { toast.error('Failed to load entry'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchDropdowns(); fetchEntry(); }, [fetchDropdowns, fetchEntry]);

  const update = (key: keyof EntryData, value: string) => {
    setEntry(p => {
      const updated = { ...p, [key]: value };
      // Auto-populate UOM when material is selected in header
      if (key === 'material_id' && value) {
        const mat = materials.find(m => String(m.id) === value);
        if (mat && mat.uom) { updated.uom = mat.uom; }
      }
      return updated;
    });
  };

  const updateItem = (key: string, field: string, value: string) => {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'physical_qty') {
        const phys = parseFloat(value) || 0;
        updated.variance_qty = phys - updated.system_qty;
        updated.variance_value = updated.variance_qty * 185; // approximation with avg price
      }
      if (field === 'material_id') {
        const mat = materials.find(m => String(m.id) === value);
        if (mat) { updated.material_code = mat.code; updated.material_name = mat.name; updated.uom = mat.uom; }
      }
      return updated;
    }));
  };

  const addItem = () => {
    setItems(p => [...p, { _key: genKey(), material_id: '', material_code: '', material_name: '', uom: '', batch_no: '', location: '', system_qty: 0, physical_qty: '', variance_qty: 0, variance_value: 0, remarks: '' }]);
  };

  const removeItem = (key: string) => {
    setItems(p => p.length > 1 ? p.filter(it => it._key !== key) : p);
  };

  const handleClear = () => {
    setEntry({ ...emptyEntry, entry_no: entry.entry_no });
    setItems([{ _key: genKey(), material_id: '', material_code: '', material_name: '', uom: '', batch_no: '', location: '', system_qty: 0, physical_qty: '', variance_qty: 0, variance_value: 0, remarks: '' }]);
  };

  const handleSave = async () => {
    if (!entry.warehouse_id) { toast.error('Godown is required'); return; }
    if (!entry.entry_date) { toast.error('Entry date is required'); return; }
    if (!entry.stock_date) { toast.error('Stock date is required'); return; }
    const validItems = items.filter(i => i.material_id && i.physical_qty);
    if (!validItems.length) { toast.error('At least one item is required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...entry,
        warehouse_id: Number(entry.warehouse_id),
        location_id: entry.location_id ? Number(entry.location_id) : null,
        items: validItems.map(i => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          batch_no: i.batch_no || null,
          location: i.location || null,
          system_qty: i.system_qty,
          physical_qty: parseFloat(i.physical_qty),
          variance_qty: i.variance_qty,
          variance_value: i.variance_value,
          remarks: i.remarks || null,
        })),
      };
      if (isNew) {
        await api('/physical-stock-entry', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Physical stock entry created!');
      } else {
        await api(`/physical-stock-entry/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Physical stock entry updated!');
      }
      navigate('/physical-stock-entry');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  // Summary calculations
  const totalItems = items.filter(i => i.material_id).length;
  const matchedItems = items.filter(i => i.variance_qty === 0 && i.material_id).length;
  const varianceItems = items.filter(i => i.variance_qty !== 0 && i.material_id).length;
  const totalVarianceValue = items.reduce((s, i) => s + i.variance_value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
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
            <h1 className="text-xl font-bold text-gray-900">{isNew ? 'Physical Stock Entry' : 'Physical Stock Entry'}</h1>
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
          {/* Row 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1.5">Entry No.</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {entry.entry_no || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Entry Date <span className="text-red-500">*</span></label>
            <input type="date" value={entry.entry_date} onChange={e => update('entry_date', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Stock Date <span className="text-red-500">*</span></label>
            <input type="date" value={entry.stock_date} onChange={e => update('stock_date', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Reference No.</label>
            <input type="text" value={entry.reference_no} onChange={e => update('reference_no', e.target.value)} placeholder="Enter reference" className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Godown <span className="text-red-500">*</span></label>
            <select value={entry.warehouse_id} onChange={e => update('warehouse_id', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="">Select Godown</option>
              {warehouses.map(w => <option key={w.id} value={String(w.id)}>{w.name} ({w.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Location / Rack</label>
            <select value={entry.location_id} onChange={e => update('location_id', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="">Select Location</option>
              {locations.map(l => <option key={l.id} value={String(l.id)}>{l.name} ({l.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Item Group</label>
            <select value={entry.item_group} onChange={e => update('item_group', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="">All Groups</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Dyes">Dyes</option>
              <option value="Raw Materials">Raw Materials</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Item</label>
            <div className="relative">
              <select value={entry.material_id} onChange={e => update('material_id', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-9">
                <option value="">Select Item</option>
                {materials.map(m => <option key={m.id} value={String(m.id)}>{m.code} - {m.name}</option>)}
              </select>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">UOM</label>
            <div className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-h-[34px] flex items-center">
              {entry.uom || <span className="text-gray-400 italic">Auto-filled from item</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Batch No.</label>
            <div className="relative">
              <input type="text" value={entry.batch_no} onChange={e => update('batch_no', e.target.value)} placeholder="Search batch" className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-9" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">From Item Code</label>
            <div className="relative">
              <input type="text" value={entry.from_item_code} onChange={e => update('from_item_code', e.target.value)} placeholder="From code" className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-9" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">To Item Code</label>
            <div className="relative">
              <input type="text" value={entry.to_item_code} onChange={e => update('to_item_code', e.target.value)} placeholder="To code" className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-9" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Row 4: Remarks */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Remarks</label>
            <textarea
              rows={2}
              value={entry.remarks}
              onChange={e => update('remarks', e.target.value)}
              placeholder="Enter any remarks or notes..."
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Name <span className="text-red-500">*</span></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">UOM</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Batch No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Location / Rack</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">System Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Physical Qty <span className="text-red-500">*</span></th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Variance Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Variance Value</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Remarks</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <input type="text" value={item.material_code} readOnly className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-w-[120px]" placeholder="Auto-filled" />
                  </td>
                  <td className="px-4 py-3">
                    <select value={item.material_id} onChange={e => updateItem(item._key, 'material_id', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[160px]">
                      <option value="">Select Item</option>
                      {materials.map(m => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.uom || '-'}</td>
                  <td className="px-4 py-3">
                    <input type="text" value={item.batch_no} onChange={e => updateItem(item._key, 'batch_no', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[100px]" placeholder="Batch" />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.location || '-'}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-700 font-medium">{item.system_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3">
                    <input type="number" value={item.physical_qty} onChange={e => updateItem(item._key, 'physical_qty', e.target.value)} className="w-full px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-medium ${item.variance_qty < 0 ? 'text-red-600' : item.variance_qty > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {item.variance_qty > 0 ? '+' : ''}{item.variance_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-medium ${item.variance_value < 0 ? 'text-red-600' : item.variance_value > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {item.variance_value > 0 ? '+' : ''}{item.variance_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Add remarks">
                      <MessageSquare className="w-4 h-4" />
                    </button>
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

        {/* Table Footer Totals Row */}
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="w-full text-sm">
            <tbody>
              <tr className="bg-gray-50 font-medium">
                <td className="px-4 py-3" colSpan={6}></td>
                <td className="px-4 py-3 text-right text-xs text-gray-700">Total Items: <span className="font-bold">{totalItems}</span></td>
                <td className="px-4 py-3"></td>
                <td className={`px-4 py-3 text-right text-xs font-bold ${items.reduce((s, i) => s + i.variance_qty, 0) < 0 ? 'text-red-600' : items.reduce((s, i) => s + i.variance_qty, 0) > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {items.reduce((s, i) => s + i.variance_qty, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-3 text-right text-xs font-bold ${totalVarianceValue < 0 ? 'text-red-600' : totalVarianceValue > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {totalVarianceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3" colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add Row */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button onClick={addItem} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
            <Plus className="w-4 h-4" /> Add Row
          </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Items</div>
              <div className="text-2xl font-bold text-blue-700">{totalItems}</div>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Matched Items</div>
              <div className="text-2xl font-bold text-emerald-700">{matchedItems}</div>
            </div>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Variance Items</div>
              <div className="text-2xl font-bold text-red-700">{varianceItems}</div>
            </div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Variance Value</div>
              <div className={`text-xl font-bold ${totalVarianceValue < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {totalVarianceValue < 0 ? '' : '+'}{totalVarianceValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
