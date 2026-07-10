import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Plus, Trash2, Factory } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; allow_negative_stock: number; }
interface StockItem { material_id: number; material_name: string; material_code: string; uom: string; current_qty: number; avg_unit_cost: number; }
interface Item {
  _key: string;
  material_id: string;
  uom: string;
  required_qty: string;
  issue_qty: string;
  unit_cost: string;
  amount: number;
  remarks: string;
}

interface IssueData {
  id?: number;
  issue_no: string;
  issue_date: string;
  department: string;
  job_order_no: string;
  production_batch: string;
  batch_qty: string;
  batch_uom: string;
  batch_description: string;
  costing_method: string;
  warehouse_id: string;
  required_date: string;
  issued_by: string;
  loading_unloading: string;
  other_charges: string;
  remarks: string;
  status: string;
}

const emptyItem: Item = { _key: '', material_id: '', uom: '', required_qty: '', issue_qty: '', unit_cost: '', amount: 0, remarks: '' };

const emptyIssue: IssueData = {
  issue_no: '', issue_date: new Date().toISOString().split('T')[0], department: '', job_order_no: '',
  production_batch: '', batch_qty: '', batch_uom: '', batch_description: '', costing_method: 'FIFO',
  warehouse_id: '', required_date: '', issued_by: '', loading_unloading: '', other_charges: '',
  remarks: '', status: 'Posted',
};

const COSTING_METHODS = [
  { value: 'FIFO', label: 'FIFO' }, { value: 'LIFO', label: 'LIFO' },
  { value: 'Weighted Average', label: 'Weighted Average' }, { value: 'Standard Cost', label: 'Standard Cost' },
];

const DEPARTMENTS = [
  { value: '', label: 'Select department' },
  { value: 'Tanning', label: 'Tanning' },
  { value: 'Finishing', label: 'Finishing' },
  { value: 'Dyeing', label: 'Dyeing' },
  { value: 'Quality Control', label: 'Quality Control' },
  { value: 'Production', label: 'Production' },
  { value: 'Maintenance', label: 'Maintenance' },
];

let _kc = 0;
const genKey = () => `row_${++_kc}_${Date.now()}`;

export default function MaterialIssueToBatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [issue, setIssue] = useState<IssueData>(emptyIssue);
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

  const fetchIssue = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { issue_no: string } }>('/material-issues/next-no');
        setIssue((p) => ({ ...p, issue_no: res.data.issue_no }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/material-issues/${id}`);
      const d = res.data;
      setIssue({
        ...emptyIssue,
        ...d,
        issue_date: d.issue_date?.split('T')[0] || '',
        required_date: d.required_date?.split('T')[0] || '',
        warehouse_id: String(d.warehouse_id || ''),
        batch_qty: String(d.batch_qty || ''),
        loading_unloading: String(d.loading_unloading || ''),
        other_charges: String(d.other_charges || ''),
      });
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(),
        material_id: String(it.material_id),
        uom: it.uom || '',
        required_qty: String(it.required_qty || ''),
        issue_qty: String(it.issue_qty),
        unit_cost: String(it.unit_cost),
        amount: parseFloat(it.amount) || 0,
        remarks: it.remarks || '',
      })));
      fetchStock(String(d.warehouse_id));
    } catch { toast.error('Failed to load issue'); }
    finally { setLoading(false); }
  }, [id, isNew, fetchStock]);

  useEffect(() => { fetchWarehouses(); fetchIssue(); }, [fetchWarehouses, fetchIssue]);
  useEffect(() => { if (issue.warehouse_id) fetchStock(issue.warehouse_id); }, [issue.warehouse_id, fetchStock]);

  const update = (key: string, value: any) => setIssue((p) => ({ ...p, [key]: value }));

  const updateItem = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'material_id') {
        const stock = stockList.find((s) => String(s.material_id) === value);
        if (stock) {
          updated.uom = stock.uom;
          updated.unit_cost = String(stock.avg_unit_cost);
        }
      }
      if (field === 'issue_qty' || field === 'unit_cost' || field === 'material_id') {
        const qty = parseFloat(updated.issue_qty) || 0;
        const cost = parseFloat(updated.unit_cost) || 0;
        updated.amount = parseFloat((qty * cost).toFixed(2));
      }
      return updated;
    }));
  };

  const addItem = () => setItems((p) => [...p, { ...emptyItem, _key: genKey() }]);
  const removeItem = (key: string) => setItems((p) => p.filter((it) => it._key !== key));

  const totalCost = items.reduce((s, i) => s + (i.amount || 0), 0);
  const loadingUnloading = parseFloat(issue.loading_unloading) || 0;
  const otherCharges = parseFloat(issue.other_charges) || 0;
  const grandTotal = totalCost + loadingUnloading + otherCharges;

  const handleSave = async () => {
    if (!issue.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!issue.issue_date) { toast.error('Issue date is required'); return; }
    const validItems = items.filter((i) => i.material_id && i.issue_qty);
    if (!validItems.length) { toast.error('At least one item is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...issue,
        warehouse_id: Number(issue.warehouse_id),
        batch_qty: parseFloat(issue.batch_qty) || 0,
        loading_unloading: loadingUnloading,
        other_charges: otherCharges,
        total_material_cost: totalCost,
        grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id),
          uom: i.uom,
          required_qty: parseFloat(i.required_qty) || 0,
          issue_qty: parseFloat(i.issue_qty) || 0,
          unit_cost: parseFloat(i.unit_cost) || 0,
          amount: i.amount,
          remarks: i.remarks || null,
        })),
      };
      if (isNew) {
        const res = await api('/material-issues', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material issue created!');
      } else {
        const res = await api(`/material-issues/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material issue updated!');
      }
      navigate('/material-issue');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/material-issue')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-xl shadow-rose-500/30 ring-2 ring-white/50">
            <Factory size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Material Issue' : 'Edit Material Issue'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{issue.issue_no || 'Auto-generated'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/material-issue')} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Issue'}
          </button>
        </div>
      </div>

      {/* Header Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Issue No" value={issue.issue_no} onChange={(e) => update('issue_no', e.target.value)} placeholder="Auto-generated" />
          <Input label="Issue Date" type="date" required value={issue.issue_date} onChange={(e) => update('issue_date', e.target.value)} />
          <Select label="Department" options={DEPARTMENTS} value={issue.department} onChange={(e) => update('department', e.target.value)} />
          <Select label="Warehouse" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={issue.warehouse_id} onChange={(e) => update('warehouse_id', e.target.value)} />
          <Input label="Production Batch" value={issue.production_batch} onChange={(e) => update('production_batch', e.target.value)} placeholder="Batch number" />
          <Input label="Job Order No" value={issue.job_order_no} onChange={(e) => update('job_order_no', e.target.value)} placeholder="Job order" />
          <Input label="Batch Qty" type="number" value={issue.batch_qty} onChange={(e) => update('batch_qty', e.target.value)} placeholder="0" />
          <Input label="Batch UOM" value={issue.batch_uom} onChange={(e) => update('batch_uom', e.target.value)} placeholder="e.g. Sq.Ft." />
          <Select label="Costing Method" options={COSTING_METHODS} value={issue.costing_method} onChange={(e) => update('costing_method', e.target.value)} />
          <Input label="Required Date" type="date" value={issue.required_date} onChange={(e) => update('required_date', e.target.value)} />
          <Input label="Issued By" value={issue.issued_by} onChange={(e) => update('issued_by', e.target.value)} placeholder="Issued by" />
          <Input label="Status" value={issue.status} onChange={(e) => update('status', e.target.value)} disabled />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-900 mb-1">Batch Description</label>
          <textarea rows={2} value={issue.batch_description} onChange={(e) => update('batch_description', e.target.value)} placeholder="Batch description..."
            className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none" />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-rose-50/30">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Issue Items</h2>
          <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all">
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
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Required Qty</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Issue Qty</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Unit Cost</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-600 uppercase">Remarks</th>
                <th className="text-center py-3 px-4 text-[11px] font-bold text-gray-400 uppercase w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-rose-50/30 transition-all">
                  <td className="py-2 px-4 text-xs text-gray-400 font-bold">{idx + 1}</td>
                  <td className="py-2 px-4">
                    <select value={item.material_id} onChange={(e) => updateItem(item._key, 'material_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white min-w-[180px]">
                      <option value="">Select material</option>
                      {stockList.map((s) => <option key={s.material_id} value={String(s.material_id)}>{s.material_name} ({s.material_code}) - Stock: {s.current_qty}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <input value={item.uom} onChange={(e) => updateItem(item._key, 'uom', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-w-[80px]" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" value={item.required_qty} onChange={(e) => updateItem(item._key, 'required_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-w-[90px]" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" value={item.issue_qty} onChange={(e) => updateItem(item._key, 'issue_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-w-[90px]" />
                  </td>
                  <td className="py-2 px-4">
                    <input type="number" value={item.unit_cost} onChange={(e) => updateItem(item._key, 'unit_cost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-w-[100px]" />
                  </td>
                  <td className="py-2 px-4 font-bold text-rose-700 text-xs">₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-4">
                    <input value={item.remarks} onChange={(e) => updateItem(item._key, 'remarks', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-w-[120px]" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!issue.warehouse_id && (
                <tr><td colSpan={9} className="py-6 text-center text-xs text-gray-400">Select a warehouse to load available stock</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-rose-50 to-red-50 border-t-2 border-rose-200">
                <td colSpan={6} className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">Total Material Cost:</td>
                <td className="py-3 px-4 text-lg font-black text-rose-700">₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Charges + Remarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Additional Charges</h3>
          <div className="space-y-3">
            <Input label="Loading / Unloading" type="number" value={issue.loading_unloading} onChange={(e) => update('loading_unloading', e.target.value)} placeholder="0.00" />
            <Input label="Other Charges" type="number" value={issue.other_charges} onChange={(e) => update('other_charges', e.target.value)} placeholder="0.00" />
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">Grand Total:</span>
              <span className="text-xl font-black text-rose-700">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 lg:col-span-2">
          <label className="block text-xs font-medium text-gray-900 mb-1.5">Remarks</label>
          <textarea rows={6} value={issue.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Additional remarks..."
            className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none" />
        </div>
      </div>
    </div>
  );
}
