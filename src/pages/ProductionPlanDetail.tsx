import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Printer, Plus, Edit2, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import api from '../lib/api';
import SearchableSelect from '../components/ui/SearchableSelect';
import { usePermission } from '../lib/usePermission';

interface Customer { id: number; name: string; }
interface SalesOrder { id: number; order_no: string; customer_id?: number; customer_name?: string; order_qty?: number; }
interface ProcessStage { id: number; code: string; name: string; uom?: string; seq?: number; }

interface PlanData {
  id?: number;
  plan_no: string;
  plan_date: string;
  sales_order_id: string;
  customer_id: string;
  article: string;
  color: string;
  order_qty: string;
  sales_order_qty: string;
  completed_qty: string;
  remarks: string;
  status: string;
}

interface StageItem {
  _key: string;
  seq: number;
  stage_id: string;
  stage_name: string;
  uom: string;
  planned_qty: string;
  issue_input_qty: string;
  output_qty: string;
  rejection_qty: string;
  wip_qty: number;
  status: string;
}

const emptyPlan: PlanData = {
  plan_no: '', plan_date: new Date().toISOString().split('T')[0],
  sales_order_id: '', customer_id: '', article: '', color: '',
  order_qty: '', sales_order_qty: '',
  completed_qty: '0', remarks: '', status: 'Pending',
};

const STATUSES = ['Pending', 'Planned', 'In Progress', 'Completed'];
const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  Planned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-violet-100 text-violet-700',
  Cancelled: 'bg-rose-100 text-rose-600',
};

let _kc = 0;
const genKey = () => `stg_${++_kc}_${Date.now()}`;
const fmt = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);
const fmtCurrency = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

export default function ProductionPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = !id || id === 'new';
  const { canWrite, isReadOnly } = usePermission();

  const [plan, setPlan] = useState<PlanData>(emptyPlan);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [processStages, setProcessStages] = useState<ProcessStage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleteStageKey, setDeleteStageKey] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [cust, so, ps] = await Promise.all([
        api<{ data: Customer[] }>('/customers?limit=500'),
        api<{ data: SalesOrder[] }>('/sales-orders?limit=500'),
        api<{ data: ProcessStage[] }>('/process-stages?limit=100'),
      ]);
      setCustomers(cust.data || []);
      setSalesOrders(so.data || []);
      // Sort process stages by sequence ascending (1, 2, 3...), fallback to name
      const seqNum = (v: any) => {
        const n = Number(v);
        return Number.isFinite(n) && v !== null && v !== '' ? n : Number.MAX_SAFE_INTEGER;
      };
      const sortedStages = [...(ps.data || [])].sort((a, b) => {
        const sa = seqNum(a.seq);
        const sb = seqNum(b.seq);
        if (sa !== sb) return sa - sb;
        return (a.name || '').localeCompare(b.name || '');
      });
      setProcessStages(sortedStages);
    } catch { toast.error('Failed to load dropdowns'); }
  }, []);

  const fetchPlan = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { plan_no: string } }>('/production-plans/next-no');
        setPlan((p) => ({ ...p, plan_no: res.data.plan_no }));
      } catch {}
      // Pre-fill from query params (from sales order items list)
      const soId = searchParams.get('sales_order_id');
      const articleParam = searchParams.get('article');
      const colorParam = searchParams.get('color');
      const custId = searchParams.get('customer_id');
      const orderQty = searchParams.get('order_qty');
      if (soId || articleParam) {
        setPlan((p) => ({
          ...p,
          sales_order_id: soId || '',
          article: articleParam || '',
          color: colorParam || '',
          customer_id: custId || '',
          order_qty: orderQty || '',
          sales_order_qty: orderQty || '',
        }));
      }
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
        article: d.article || '',
        color: d.color || '',
        order_qty: String(d.order_qty || ''),
        sales_order_qty: String(d.sales_order_qty || d.order_qty || ''),
        completed_qty: String(d.completed_qty || '0'),
        remarks: d.remarks || '',
        status: d.status || 'Pending',
      });
      if (d.stages && d.stages.length > 0) {
        setStages(d.stages.map((s: any) => {
          const pQty = parseFloat(s.planned_qty) || 0;
          const oQty = parseFloat(s.output_qty) || 0;
          const iQty = parseFloat(s.issue_input_qty) || 0;
          const rQty = parseFloat(s.rejection_qty) || 0;
          let stageStatus = 'Pending';
          if (pQty === 0) stageStatus = 'Pending';
          else if (oQty >= pQty) stageStatus = 'Completed';
          else if (oQty > 0) stageStatus = 'In Progress';
          else stageStatus = 'Planned';
          return {
            _key: genKey(),
            seq: s.seq || 1,
            stage_id: String(s.stage_id || ''),
            stage_name: s.stage_name || s.process_stage_name || '',
            uom: s.stage_uom || s.uom || '',
            planned_qty: String(s.planned_qty || '0'),
            issue_input_qty: String(s.issue_input_qty || '0'),
            output_qty: String(s.output_qty || '0'),
            rejection_qty: String(s.rejection_qty || '0'),
            wip_qty: Math.max(0, iQty - oQty - rQty),
            status: stageStatus,
          };
        }));
      }
    } catch { toast.error('Failed to load plan'); navigate('/production-plan'); }
    finally { setLoading(false); }
  }, [id, isNew, navigate, searchParams]);

  useEffect(() => { fetchDropdowns(); fetchPlan(); }, [fetchDropdowns, fetchPlan]);

  const update = (key: string, value: any) => setPlan((p) => ({ ...p, [key]: value }));

  // Derived calculations
  const salesOrderQty = parseFloat(plan.sales_order_qty) || 0;
  // Completed Qty = cumulative output of the measurement stage (last stage by
  // sequence). Stage output_qty is auto-populated from Daily Production.
  const measurementStage = stages.length > 0 ? stages[stages.length - 1] : null;
  const completedQty = measurementStage ? (parseFloat(measurementStage.output_qty) || 0) : 0;
  const balanceQty = Math.max(0, salesOrderQty - completedQty);

  const totalPlanQty = stages.reduce((s, st) => s + (parseFloat(st.planned_qty) || 0), 0);
  const totalOutputQty = stages.reduce((s, st) => s + (parseFloat(st.output_qty) || 0), 0);
  const totalRejectionQty = stages.reduce((s, st) => s + (parseFloat(st.rejection_qty) || 0), 0);
  const totalWipQty = stages.reduce((s, st) => s + st.wip_qty, 0);

  const handleOrderChange = (value: string) => {
    const so = salesOrders.find((s) => String(s.id) === value);
    update('sales_order_id', value);
    if (so) {
      if (so.customer_id) update('customer_id', String(so.customer_id));
      if (so.order_qty) update('sales_order_qty', String(so.order_qty));
    }
  };

  const addStage = () => {
    setStages((prev) => [...prev, {
      _key: genKey(), seq: prev.length + 1, stage_id: '', stage_name: '',
      uom: '', planned_qty: '0', issue_input_qty: '0', output_qty: '0',
      rejection_qty: '0', wip_qty: 0, status: 'Pending',
    }]);
  };

  const updateStage = (key: string, field: string, value: any) => {
    setStages((prev) => prev.map((s) => {
      if (s._key !== key) return s;
      const updated = { ...s, [field]: value };
      if (field === 'stage_id') {
        const ps = processStages.find((p) => String(p.id) === value);
        if (ps) {
          updated.stage_name = ps.name;
          updated.uom = ps.uom || '';
        }
      }
      // Recalculate WIP = Input - Output - Rejection
      const iQty = parseFloat(updated.issue_input_qty) || 0;
      const oQty = parseFloat(updated.output_qty) || 0;
      const rQty = parseFloat(updated.rejection_qty) || 0;
      const pQty = parseFloat(updated.planned_qty) || 0;
      updated.wip_qty = Math.max(0, iQty - oQty - rQty);
      // Auto-calculate status based on production progress
      if (pQty === 0) {
        updated.status = 'Pending';
      } else if (oQty >= pQty) {
        updated.status = 'Completed';
      } else if (oQty > 0) {
        updated.status = 'In Progress';
      } else {
        updated.status = 'Planned';
      }
      return updated;
    }));
  };

  const handleSave = async () => {
    if (!plan.plan_date) { toast.error('Plan date is required'); return; }
    if (!plan.article) { toast.error('Article is required'); return; }

    // If all stages are deleted on an existing plan, just save with empty stages (plan stays, stages removed)
    if (!isNew && stages.length === 0) {
      setSaving(true);
      try {
        const autoStatus = 'Pending';
        const payload = {
          ...plan,
          status: autoStatus,
          sales_order_id: plan.sales_order_id ? Number(plan.sales_order_id) : null,
          customer_id: plan.customer_id ? Number(plan.customer_id) : null,
          product_id: null,
          warehouse_id: null,
          uom: 'Pcs',
          order_qty: parseFloat(plan.order_qty) || 0,
          sales_order_qty: salesOrderQty,
          expected_yield: parseFloat(plan.expected_yield) || 92,
          completed_qty: completedQty,
          planned_qty: 0,
          batch_qty: 0,
          items: [],
          stages: [],
        };
        await api(`/production-plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('All stages removed. Plan updated.');
        navigate('/production-plan');
      } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
      finally { setSaving(false); }
      return;
    }

    setSaving(true);
    try {
      const autoStatus = totalPlanQty <= 0 ? 'Pending' : totalPlanQty >= salesOrderQty && salesOrderQty > 0 ? 'Completed' : 'In Progress';
      const payload = {
        ...plan,
        status: autoStatus,
        sales_order_id: plan.sales_order_id ? Number(plan.sales_order_id) : null,
        customer_id: plan.customer_id ? Number(plan.customer_id) : null,
        product_id: null,
        warehouse_id: null,
        uom: 'Pcs',
        order_qty: parseFloat(plan.order_qty) || 0,
        sales_order_qty: salesOrderQty,
        expected_yield: parseFloat(plan.expected_yield) || 92,
        completed_qty: completedQty,
        planned_qty: totalPlanQty,
        batch_qty: 0,
        items: [],
        stages: stages.map((s) => ({
          seq: s.seq,
          stage_id: s.stage_id ? Number(s.stage_id) : null,
          stage_name: s.stage_name,
          capacity: 0,
          planned_qty: parseFloat(s.planned_qty) || 0,
          issue_input_qty: parseFloat(s.issue_input_qty) || 0,
          planned_percent: 100,
          receipt_qty: 0,
          rejection_qty: parseFloat(s.rejection_qty) || 0,
          output_qty: parseFloat(s.output_qty) || 0,
          output_percent: 0,
          wip_qty: s.wip_qty,
          status: s.status,
        })),
      };

      if (isNew) {
        await api('/production-plans', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Production Requirement Plan created!');
      } else {
        await api(`/production-plans/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Production Requirement Plan updated!');
      }
      navigate('/production-plan');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    update('status', 'In-Process');
    setTimeout(handleSave, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/production-plan')} className="p-2 rounded-lg hover:bg-gray-100 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Production Requirement Plan</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[totalPlanQty <= 0 ? 'Pending' : totalPlanQty >= salesOrderQty && salesOrderQty > 0 ? 'Completed' : 'In Progress'] || 'bg-gray-100 text-gray-700'}`}>
                {totalPlanQty <= 0 ? 'Pending' : totalPlanQty >= salesOrderQty && salesOrderQty > 0 ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => setShowPrintPreview(true)}>
            <Printer size={13} /> Print
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <MoreHorizontal size={13} /> More
          </button>
          <button
            onClick={canWrite ? handleSave : undefined}
            disabled={saving || isReadOnly}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg transition-all disabled:opacity-50 ${isReadOnly ? 'cursor-not-allowed' : 'hover:bg-emerald-700'}`}
          >
            <Save size={13} /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={canWrite ? handleSubmit : undefined}
            disabled={saving || isReadOnly}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 rounded-lg transition-all disabled:opacity-50 ${isReadOnly ? 'cursor-not-allowed' : 'hover:bg-blue-800'}`}
          >
            <Send size={13} /> Submit
          </button>
        </div>
      </div>

      {/* Plan Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Plan Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Plan No. <span className="text-rose-500">*</span></label>
            <input type="text" value={plan.plan_no} readOnly className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Plan Date <span className="text-rose-500">*</span></label>
            <input type="date" value={plan.plan_date} onChange={(e) => update('plan_date', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Article <span className="text-rose-500">*</span></label>
            <input type="text" value={plan.article} onChange={(e) => update('article', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Buffalo Napa" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Color <span className="text-rose-500">*</span></label>
            <input type="text" value={plan.color} onChange={(e) => update('color', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Black" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer <span className="text-rose-500">*</span></label>
            <SearchableSelect
              options={customers.map((c) => ({ value: String(c.id), label: c.name }))}
              value={plan.customer_id}
              onChange={(val) => update('customer_id', val)}
              placeholder="Select customer..."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Order No.</label>
            <SearchableSelect
              options={salesOrders.map((s) => ({ value: String(s.id), label: s.order_no }))}
              value={plan.sales_order_id}
              onChange={handleOrderChange}
              placeholder="Search order..."
              disabled={!isNew}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
              {totalPlanQty <= 0 ? 'Pending' : totalPlanQty >= salesOrderQty && salesOrderQty > 0 ? 'Completed' : 'In Progress'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
            <input type="text" value={plan.remarks} onChange={(e) => update('remarks', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Urgent order" />
          </div>
        </div>
      </div>

      {/* Stage Wise Plan and Tracking */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700">Stage Wise Plan and Tracking</h2>
          <button onClick={addStage} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">
            <Plus size={13} /> Add Stage
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center w-10">#</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-left">Process Stage</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">UOM</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">Plan Qty</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">Issue / Input Qty</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">Output Qty</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">Rejection Qty</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">WIP Qty</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">Status</th>
                <th className="py-3 px-3 text-[11px] font-bold uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stages.map((stage, idx) => (
                <tr key={stage._key} className="hover:bg-blue-50/30 transition-all">
                  <td className="py-3 px-3 text-center text-xs text-gray-500 font-bold">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <select
                      value={stage.stage_id}
                      onChange={(e) => updateStage(stage._key, 'stage_id', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[160px] text-blue-700 font-medium"
                    >
                      <option value="">Select stage</option>
                      {processStages.map((ps) => <option key={ps.id} value={String(ps.id)}>{ps.name}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-center text-xs text-gray-600 font-medium">{stage.uom || '—'}</td>
                  <td className="py-3 px-3">
                    <input type="number" value={stage.planned_qty} onChange={(e) => updateStage(stage._key, 'planned_qty', e.target.value)}
                      disabled={(parseFloat(stage.output_qty) || 0) > 0}
                      className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-center min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${(parseFloat(stage.output_qty) || 0) > 0 ? 'bg-gray-50 cursor-not-allowed' : ''}`} />
                  </td>
                  <td className="py-3 px-3">
                    <input type="number" value={stage.issue_input_qty} readOnly
                      className="w-full px-2 py-1.5 text-xs border border-gray-100 rounded-lg text-center min-w-[80px] bg-gray-50 text-gray-600" />
                  </td>
                  <td className="py-3 px-3">
                    <input type="number" value={stage.output_qty} readOnly
                      className="w-full px-2 py-1.5 text-xs border border-gray-100 rounded-lg text-center min-w-[80px] bg-gray-50 text-gray-600" />
                  </td>
                  <td className="py-3 px-3">
                    <input type="number" value={stage.rejection_qty} readOnly
                      className="w-full px-2 py-1.5 text-xs border border-gray-100 rounded-lg text-center min-w-[80px] bg-gray-50 text-gray-600" />
                  </td>
                  <td className="py-3 px-3 text-center text-xs font-bold text-amber-700">{fmt(stage.wip_qty)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[stage.status] || 'bg-gray-100 text-gray-700'}`}>
                      {stage.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(parseFloat(stage.output_qty) || 0) === 0 && (
                        <button onClick={() => setDeleteStageKey(stage._key)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {(parseFloat(stage.output_qty) || 0) > 0 && (
                        <span className="text-[10px] text-gray-400">Locked</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-blue-500 rounded-full" />
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Sale Order Qty</p>
              <p className="text-xl font-black text-gray-900">{fmtCurrency(salesOrderQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-emerald-500 rounded-full" />
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Completed Qty</p>
              <p className="text-xl font-black text-emerald-700">{fmtCurrency(completedQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-amber-500 rounded-full" />
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Balance Qty</p>
              <p className="text-xl font-black text-amber-700">{fmtCurrency(balanceQty)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPrintPreview(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-bold text-gray-900">Print Preview — Production Requirement Plan</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setShowPrintPreview(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>
            {/* Printable Content */}
            <div id="print-plan-content" className="overflow-y-auto p-8 flex-1 text-sm text-gray-800">
              {/* Company / Title */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-black text-gray-900 uppercase tracking-wide">Production Requirement Plan</h1>
                <p className="text-gray-500 text-xs mt-1">Plan No: <span className="font-semibold text-gray-800">{plan.plan_no}</span></p>
              </div>

              {/* Plan Info Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between"><span className="text-gray-500">Plan Date:</span><span className="font-medium">{plan.plan_date || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="font-medium">{totalPlanQty <= 0 ? 'Pending' : totalPlanQty >= salesOrderQty && salesOrderQty > 0 ? 'Completed' : 'In Progress'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Article:</span><span className="font-medium">{plan.article || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Color:</span><span className="font-medium">{plan.color || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium">{customers.find(c => String(c.id) === plan.customer_id)?.name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Order No:</span><span className="font-medium">{salesOrders.find(s => String(s.id) === plan.sales_order_id)?.order_no || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Remarks:</span><span className="font-medium">{plan.remarks || '—'}</span></div>
              </div>

              {/* Stages Table */}
              <h3 className="text-sm font-bold text-gray-700 mb-2">Stage Wise Plan</h3>
              <table className="w-full border-collapse border border-gray-300 text-xs mb-6">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-600 px-3 py-2 text-center">#</th>
                    <th className="border border-gray-600 px-3 py-2 text-left">Process Stage</th>
                    <th className="border border-gray-600 px-3 py-2 text-center">UOM</th>
                    <th className="border border-gray-600 px-3 py-2 text-center">Plan Qty</th>
                    <th className="border border-gray-600 px-3 py-2 text-center">Input Qty</th>
                    <th className="border border-gray-600 px-3 py-2 text-center">Output Qty</th>
                    <th className="border border-gray-600 px-3 py-2 text-center">Rejection</th>
                    <th className="border border-gray-600 px-3 py-2 text-center">WIP</th>
                    <th className="border border-gray-600 px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((s, i) => (
                    <tr key={s._key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-200 px-3 py-2 text-center font-bold text-gray-500">{i + 1}</td>
                      <td className="border border-gray-200 px-3 py-2 font-medium text-blue-800">{s.stage_name || '—'}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{s.uom || '—'}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center font-semibold">{fmt(parseFloat(s.planned_qty) || 0)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{fmt(parseFloat(s.issue_input_qty) || 0)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{fmt(parseFloat(s.output_qty) || 0)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{fmt(parseFloat(s.rejection_qty) || 0)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center font-bold text-amber-700">{fmt(s.wip_qty)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-center">{s.status}</td>
                    </tr>
                  ))}
                  {stages.length === 0 && (
                    <tr><td colSpan={9} className="border border-gray-200 px-3 py-4 text-center text-gray-400">No stages defined</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">Sale Order Qty</p><p className="text-lg font-black text-gray-900">{fmtCurrency(salesOrderQty)}</p></div>
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">Completed Qty</p><p className="text-lg font-black text-emerald-700">{fmtCurrency(completedQty)}</p></div>
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">Balance Qty</p><p className="text-lg font-black text-amber-700">{fmtCurrency(balanceQty)}</p></div>
              </div>

              {/* Signature area */}
              <div className="mt-10 grid grid-cols-3 gap-8 text-center text-xs text-gray-500">
                <div><div className="border-t border-gray-400 pt-1 mt-8">Prepared By</div></div>
                <div><div className="border-t border-gray-400 pt-1 mt-8">Checked By</div></div>
                <div><div className="border-t border-gray-400 pt-1 mt-8">Approved By</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Stage Confirmation Dialog */}
      {deleteStageKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteStageKey(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={20} className="text-red-600" /></div>
              <div><h3 className="text-lg font-bold text-gray-900">Delete Stage</h3><p className="text-sm text-gray-500">Are you sure you want to delete this stage?</p></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteStageKey(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={() => { setStages(prev => prev.filter(s => s._key !== deleteStageKey)); setDeleteStageKey(null); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
