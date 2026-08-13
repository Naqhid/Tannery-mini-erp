import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Factory, RotateCcw, Printer, Package, Layers, ClipboardList, TrendingDown, BarChart3 } from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface Customer { id: number; name: string; }
interface SalesOrder { id: number; order_no: string; customer_id?: number; customer_name?: string; }
interface ProcessStage { id: number; code: string; name: string; }
interface Product { id: number; code: string; name: string; }
interface Warehouse { id: number; code?: string; name: string; }

interface PlanData {
  id?: number;
  plan_no: string;
  plan_date: string;
  sales_order_id: string;
  customer_id: string;
  customer_order_no: string;
  product_id: string;
  warehouse_id: string;
  article: string;
  color: string;
  finish: string;
  order_qty: string;
  planned_qty: string;
  batch_qty: string;
  status: string;
}

interface StageItem {
  _key: string;
  seq: number;
  stage_id: string;
  stage_name: string;
  capacity: string;
  planned_qty: string;
  planned_percent: string;
  receipt_qty: string;
  rejection_qty: string;
  output_qty: string;
  output_percent: number;
  wip_qty: number;
  status: string;
}

const emptyPlan: PlanData = {
  plan_no: '', plan_date: new Date().toISOString().split('T')[0],
  sales_order_id: '', customer_id: '', customer_order_no: '',
  product_id: '', warehouse_id: '',
  article: '', color: '', finish: '',
  order_qty: '', planned_qty: '', batch_qty: '', status: 'Draft',
};

const STAGE_STATUSES = ['In-Process', 'Completed', 'Pending', 'On Hold'];

let _kc = 0;
const genKey = () => `stg_${++_kc}_${Date.now()}`;
const fmt = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

export default function ProductionPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const { canWrite, isReadOnly } = usePermission();

  const [plan, setPlan] = useState<PlanData>(emptyPlan);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [processStages, setProcessStages] = useState<ProcessStage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [cust, so, ps, prod, wh] = await Promise.all([
        api<{ data: Customer[] }>('/customers?limit=500'),
        api<{ data: SalesOrder[] }>('/sales-orders?limit=500'),
        api<{ data: ProcessStage[] }>('/process-stages?limit=100'),
        api<{ data: Product[] }>('/products/dropdown'),
        api<{ data: Warehouse[] }>('/warehouses/dropdown'),
      ]);
      setCustomers(cust.data || []);
      setSalesOrders(so.data || []);
      const stageList = ps.data || [];
      setProcessStages(stageList);
      setProducts(prod.data || []);
      setWarehouses(wh.data || []);
      // If new and no stages, pre-populate with all process stages
      if (isNew && stageList.length > 0) {
        setStages(stageList.map((s, i) => ({
          _key: genKey(),
          seq: i + 1,
          stage_id: String(s.id),
          stage_name: s.name,
          capacity: '',
          planned_qty: '',
          planned_percent: '100.00',
          receipt_qty: '0',
          rejection_qty: '0',
          output_qty: '0',
          output_percent: 0,
          wip_qty: 0,
          status: 'In-Process',
        })));
      }
    } catch { toast.error('Failed to load dropdowns'); }
  }, [isNew]);

  const fetchPlan = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { plan_no: string } }>('/production-plans/next-no');
        setPlan((p) => ({ ...p, plan_no: res.data.plan_no }));
      } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/production-plans/${id}`);
      const d = res.data;
      setPlan({
        ...emptyPlan,
        id: d.id,
        plan_no: d.plan_no || '',
        plan_date: d.plan_date?.split('T')[0] || '',
        sales_order_id: String(d.sales_order_id || ''),
        customer_id: String(d.customer_id || ''),
        customer_order_no: d.customer_order_no || '',
        product_id: String(d.product_id || ''),
        warehouse_id: String(d.warehouse_id || ''),
        article: d.article || '',
        color: d.color || '',
        finish: d.finish || '',
        order_qty: String(d.order_qty || ''),
        planned_qty: String(d.planned_qty || ''),
        batch_qty: String(d.batch_qty || ''),
        status: d.status || 'Draft',
      });
      if (d.stages && d.stages.length > 0) {
        setStages(d.stages.map((s: any) => ({
          _key: genKey(),
          seq: s.seq || 1,
          stage_id: String(s.stage_id || ''),
          stage_name: s.stage_name || s.process_stage_name || '',
          capacity: String(s.capacity || ''),
          planned_qty: String(s.planned_qty || ''),
          planned_percent: String(s.planned_percent || '100.00'),
          receipt_qty: String(s.receipt_qty || '0'),
          rejection_qty: String(s.rejection_qty || '0'),
          output_qty: String(s.output_qty || '0'),
          output_percent: parseFloat(s.output_percent) || 0,
          wip_qty: parseFloat(s.wip_qty) || 0,
          status: s.status || 'In-Process',
        })));
      }
    } catch { toast.error('Failed to load production plan'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchDropdowns(); fetchPlan(); }, [fetchDropdowns, fetchPlan]);

  const update = (key: string, value: any) => setPlan((p) => ({ ...p, [key]: value }));

  // Calculations
  const orderQty = parseFloat(plan.order_qty) || 0;
  const plannedQty = parseFloat(plan.planned_qty) || 0;
  const batchQty = parseFloat(plan.batch_qty) || 0;
  const noOfBatches = batchQty > 0 ? Math.ceil(plannedQty / batchQty) : 0;
  const balanceQty = Math.max(0, orderQty - plannedQty);

  const handleSalesOrderChange = (value: string) => {
    const so = salesOrders.find((s) => String(s.id) === value);
    update('sales_order_id', value);
    if (so?.customer_name) {
      const cust = customers.find((c) => c.name === so.customer_name);
      if (cust) update('customer_id', String(cust.id));
    }
  };

  const updateStage = (key: string, field: string, value: any) => {
    setStages((prev) => prev.map((s) => {
      if (s._key !== key) return s;
      const updated = { ...s, [field]: value };
      if (field === 'stage_id') {
        const ps = processStages.find((p) => String(p.id) === value);
        if (ps) updated.stage_name = ps.name;
      }
      // Recalc output_percent and wip_qty
      const receipt = parseFloat(updated.receipt_qty) || 0;
      const rej = parseFloat(updated.rejection_qty) || 0;
      const output = parseFloat(updated.output_qty) || 0;
      const pQty = parseFloat(updated.planned_qty) || 0;
      updated.output_percent = pQty > 0 ? parseFloat(((output / pQty) * 100).toFixed(2)) : 0;
      updated.wip_qty = Math.max(0, pQty - output);
      return updated;
    }));
  };

  const handleClear = () => {
    setPlan(emptyPlan);
    if (processStages.length > 0) {
      setStages(processStages.map((s, i) => ({
        _key: genKey(),
        seq: i + 1,
        stage_id: String(s.id),
        stage_name: s.name,
        capacity: '',
        planned_qty: '',
        planned_percent: '100.00',
        receipt_qty: '0',
        rejection_qty: '0',
        output_qty: '0',
        output_percent: 0,
        wip_qty: 0,
        status: 'In-Process',
      })));
    }
  };

  const handlePrintBatches = async () => {
    if (!plan.plan_no) { toast.error('Please save the plan first'); return; }
    
    const customerName = customers.find((c) => String(c.id) === plan.customer_id)?.name || '-';
    const batchNo = plan.plan_no ? plan.plan_no.replace('PLAN-', '') : '000001';
    const batchDate = plan.plan_date ? new Date(plan.plan_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const prodHours = ['08:00 to 09:00','09:00 to 10:00','10:00 to 11:00','11:00 to 12:00','12:00 to 13:00','13:00 to 14:00','14:00 to 15:00','15:00 to 16:00','16:00 to 17:00','17:00 to 18:00'];

    const totalBatches = noOfBatches || 1;

    // Create batch records in the database before printing
    try {
      for (let i = 1; i <= totalBatches; i++) {
        const serialNo = `${batchNo}-${String(i).padStart(3, '0')}`;
        await api('/batches', {
          method: 'POST',
          body: JSON.stringify({
            batch_no: serialNo,
            production_plan_id: plan.id || null,
            sales_order_id: plan.sales_order_id ? Number(plan.sales_order_id) : null,
            customer_id: plan.customer_id ? Number(plan.customer_id) : null,
            article_name: plan.article || null,
            production_date: plan.plan_date || null,
            stage: stages[0]?.stage_name || 'Tanning',
            current_stage: stages[0]?.stage_name || 'Tanning',
            total_receipt_qty: batchQty,
            total_output_qty: 0,
            status: 'Draft',
            items: [],
          }),
        });
      }
      toast.success(`${totalBatches} batch(es) created successfully`);
    } catch (err: any) {
      // If batch already exists (duplicate), continue with printing
      if (!err.message?.includes('Duplicate')) {
        toast.error('Failed to create batches: ' + (err as Error).message);
        return;
      }
    }

    // Generate one card per batch
    const cards: string[] = [];
    for (let i = 1; i <= totalBatches; i++) {
      const serialNo = `${batchNo}-${String(i).padStart(3, '0')}`;
      cards.push(`
        <div class="batch-card" style="page-break-after: always;">
          <table class="main-table">
            <tr>
              <td colspan="4" class="title">Leather Tannery ERP - Batch Production Card</td>
            </tr>
            <tr>
              <td class="label">Barcode (Plan No + Serial)</td>
              <td class="barcode-cell">
                <svg id="barcode-${i}"></svg>
              </td>
              <td class="label">Batch No :</td>
              <td class="value">${serialNo}</td>
            </tr>
            <tr>
              <td colspan="2" rowspan="1"></td>
              <td class="label">Batch Date :</td>
              <td class="value">${batchDate}</td>
            </tr>
            <tr>
              <td class="label">Stage</td>
              <td class="value">${stages[0]?.stage_name || '-'}</td>
              <td class="label">Customer</td>
              <td class="value">${customerName}</td>
            </tr>
            <tr>
              <td class="label">Product</td>
              <td class="value">${plan.article || '-'}</td>
              <td class="label">Type</td>
              <td class="value">${plan.finish || '-'}</td>
            </tr>
            <tr>
              <td class="label">Finish</td>
              <td class="value">${plan.finish || '-'}</td>
              <td class="label">Color</td>
              <td class="value">${plan.color || '-'}</td>
            </tr>
            <tr>
              <td class="label">Planned Qty</td>
              <td class="value" colspan="3">${fmt(batchQty)} Sq.Ft.</td>
            </tr>
          </table>
          <table class="hours-table">
            <thead>
              <tr>
                <th>Prod. Hour</th>
                <th>Received Qty</th>
                <th>Output Qty</th>
                <th>Sign</th>
              </tr>
            </thead>
            <tbody>
              ${prodHours.map(h => `<tr><td>${h}</td><td></td><td></td><td></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      `);
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Please allow popups to print'); return; }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Batch Production Cards - ${plan.plan_no}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 10mm; }
          .batch-card { margin-bottom: 10mm; }
          .main-table { width: 100%; border-collapse: collapse; border: 2px solid #333; margin-bottom: 4mm; }
          .main-table td { border: 1px solid #999; padding: 6px 10px; font-size: 12px; }
          .main-table .title { text-align: center; font-size: 16px; font-weight: bold; padding: 10px; background: #f8f8f8; }
          .main-table .label { font-weight: bold; width: 20%; font-size: 11px; }
          .main-table .value { font-size: 12px; }
          .main-table .barcode-cell { text-align: center; }
          .main-table .barcode-cell svg { height: 60px; }
          .hours-table { width: 100%; border-collapse: collapse; border: 2px solid #333; }
          .hours-table th { background: #2c3e50; color: white; padding: 8px 10px; font-size: 11px; text-align: center; }
          .hours-table td { border: 1px solid #999; padding: 6px 10px; font-size: 11px; height: 28px; }
          @media print { .batch-card:last-child { page-break-after: avoid; } body { padding: 5mm; } }
        </style>
      </head>
      <body>
        ${cards.join('')}
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            ${Array.from({length: totalBatches}, (_, i) => {
              const serialNo = `${batchNo}-${String(i+1).padStart(3, '0')}`;
              return `try { JsBarcode("#barcode-${i+1}", "${serialNo}", { format: "CODE128", height: 60, width: 2, displayValue: true, fontSize: 12, margin: 5 }); } catch(e) {}`;
            }).join('\n')}
            setTimeout(function() { window.print(); }, 500);
          });
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSave = async () => {
    if (!plan.plan_date) { toast.error('Plan date is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...plan,
        sales_order_id: plan.sales_order_id ? Number(plan.sales_order_id) : null,
        customer_id: plan.customer_id ? Number(plan.customer_id) : null,
        product_id: plan.product_id ? Number(plan.product_id) : null,
        warehouse_id: plan.warehouse_id ? Number(plan.warehouse_id) : null,
        uom: 'Sq.Ft.',
        order_qty: orderQty,
        planned_qty: plannedQty,
        batch_qty: batchQty,
        no_of_batches: noOfBatches,
        balance_qty: balanceQty,
        items: [],
        stages: stages.map((s) => ({
          seq: s.seq,
          stage_id: s.stage_id ? Number(s.stage_id) : null,
          stage_name: s.stage_name,
          capacity: parseFloat(s.capacity) || 0,
          planned_qty: parseFloat(s.planned_qty) || 0,
          planned_percent: parseFloat(s.planned_percent) || 100,
          receipt_qty: parseFloat(s.receipt_qty) || 0,
          rejection_qty: parseFloat(s.rejection_qty) || 0,
          output_qty: parseFloat(s.output_qty) || 0,
          output_percent: s.output_percent,
          wip_qty: s.wip_qty,
          status: s.status,
        })),
      };

      if (isNew) {
        const res = await api<any>('/production-plans', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Production plan created!');
      } else {
        const res = await api<any>(`/production-plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Production plan updated!');
      }
      navigate('/production-plan');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const STATUS_STAGE_COLORS: Record<string, string> = {
    'Completed': 'bg-emerald-100 text-emerald-700',
    'In-Process': 'bg-amber-100 text-amber-700',
    'Pending': 'bg-slate-100 text-slate-600',
    'On Hold': 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="space-y-5">
      {/* Section 1: Plan Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-blue-800">1. Plan Information</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintBatches}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Printer size={13} /> Print Batches
            </button>
            <button onClick={handleClear} className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
              Clear
            </button>
            <button
              onClick={() => navigate('/production-plan')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <X size={13} /> Cancel
            </button>
            <button
              onClick={canWrite ? handleSave : undefined}
              disabled={saving || isReadOnly}
              title={isReadOnly ? 'You have read-only access. Contact admin for write permissions.' : undefined}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg transition-all disabled:opacity-50 ${isReadOnly ? 'cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              <Save size={13} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sales Order No.</label>
            <select
              value={plan.sales_order_id}
              onChange={(e) => handleSalesOrderChange(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">Select SO</option>
              {salesOrders.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.order_no}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Plan No.</label>
            <input
              type="text"
              value={plan.plan_no}
              readOnly
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Plan Date</label>
            <input
              type="date"
              value={plan.plan_date}
              onChange={(e) => update('plan_date', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer</label>
            <input
              type="text"
              value={customers.find((c) => String(c.id) === plan.customer_id)?.name || ''}
              readOnly
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              placeholder="Auto from SO"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
            <select
              value={plan.product_id}
              onChange={(e) => update('product_id', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse</label>
            <select
              value={plan.warehouse_id}
              onChange={(e) => update('warehouse_id', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Order No.</label>
            <input
              type="text"
              value={plan.customer_order_no}
              onChange={(e) => update('customer_order_no', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="Customer PO No."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order Qty (Sq.Ft.)</label>
            <input
              type="number"
              value={plan.order_qty}
              onChange={(e) => update('order_qty', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Article</label>
            <input
              type="text"
              value={plan.article}
              onChange={(e) => update('article', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="e.g. Crust"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
            <input
              type="text"
              value={plan.color}
              onChange={(e) => update('color', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="e.g. Black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Finish</label>
            <input
              type="text"
              value={plan.finish}
              onChange={(e) => update('finish', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="e.g. Full Chrome"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardList size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase">Planned Qty (Sq.Ft.)</p>
              <p className="text-lg font-black text-blue-700">{fmt(plannedQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Package size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase">Batch Qty (Sq.Ft.)</p>
              <p className="text-lg font-black text-emerald-700">{fmt(batchQty)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase">No. of Batches</p>
              <p className="text-lg font-black text-indigo-700">{noOfBatches}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl p-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <TrendingDown size={18} className="text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase">Balance Qty (Sq.Ft.)</p>
              <p className="text-lg font-black text-rose-700">{fmt(balanceQty)}</p>
            </div>
          </div>
        </div>

        {/* Hidden fields for planned_qty and batch_qty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Planned Qty (Sq.Ft.)</label>
            <input
              type="number"
              value={plan.planned_qty}
              onChange={(e) => update('planned_qty', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Batch Qty (Sq.Ft.)</label>
            <input
              type="number"
              value={plan.batch_qty}
              onChange={(e) => update('batch_qty', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Plan Status</label>
            <select
              value={plan.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="Draft">Draft</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Plan Line Items (Stages) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-blue-800">2. Plan Line Items (Stages)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase w-10">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Stages <span className="text-rose-500">*</span></th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Capacity (Sq.Ft./Day)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Planned Qty (Sq.Ft.)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Planned %</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Receipt Qty (Sq.Ft.)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Rej Qty (Sq.Ft.)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Output Qty (Sq.Ft.)</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Output %</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">WIP Qty (Sq.Ft.)</th>
                <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Status <span className="text-rose-500">*</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stages.map((stage, idx) => (
                <tr key={stage._key} className="hover:bg-blue-50/30 transition-all">
                  <td className="py-2 px-3 text-xs text-gray-500 font-bold">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <select
                      value={stage.stage_id}
                      onChange={(e) => updateStage(stage._key, 'stage_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[140px]"
                    >
                      <option value="">Select stage</option>
                      {processStages.map((ps) => (
                        <option key={ps.id} value={String(ps.id)}>{ps.name}</option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2 px-3">
                    <input type="number" value={stage.capacity} onChange={(e) => updateStage(stage._key, 'capacity', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" value={stage.planned_qty} onChange={(e) => updateStage(stage._key, 'planned_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-700 text-right font-medium">{stage.planned_percent}%</td>
                  <td className="py-2 px-3">
                    <input type="number" value={stage.receipt_qty} onChange={(e) => updateStage(stage._key, 'receipt_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" value={stage.rejection_qty} onChange={(e) => updateStage(stage._key, 'rejection_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" value={stage.output_qty} onChange={(e) => updateStage(stage._key, 'output_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-right min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-700 text-right font-medium">{stage.output_percent}%</td>
                  <td className="py-2 px-3 text-xs text-gray-700 text-right font-bold">{fmt(stage.wip_qty)}</td>
                  <td className="py-2 px-3">
                    <select
                      value={stage.status}
                      onChange={(e) => updateStage(stage._key, 'status', e.target.value)}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${STATUS_STAGE_COLORS[stage.status] || ''}`}
                    >
                      {STAGE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Cards */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-t border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <ClipboardList size={14} className="text-blue-600" />
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase">Total Order Qty (Sq.Ft.)</p>
              <p className="text-sm font-black text-gray-900">{fmt(orderQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-2">
            <BarChart3 size={14} className="text-emerald-600" />
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase">Planned Qty (Sq.Ft.)</p>
              <p className="text-sm font-black text-emerald-700">{fmt(plannedQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
            <Package size={14} className="text-amber-600" />
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase">Batch Qty (Sq.Ft.)</p>
              <p className="text-sm font-black text-amber-700">{fmt(batchQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-lg px-3 py-2">
            <Layers size={14} className="text-indigo-600" />
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase">No. of Batches</p>
              <p className="text-sm font-black text-indigo-700">{noOfBatches}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-rose-200 rounded-lg px-3 py-2">
            <TrendingDown size={14} className="text-rose-600" />
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase">Balance Qty (Sq.Ft.)</p>
              <p className="text-sm font-black text-rose-700">{fmt(balanceQty)}</p>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={handlePrintBatches}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Printer size={14} /> Print Batches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
