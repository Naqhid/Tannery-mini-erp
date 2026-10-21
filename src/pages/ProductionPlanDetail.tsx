import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Printer, Plus, Send, Trash2 } from 'lucide-react';
import api from '../lib/api';
import SearchableSelect from '../components/ui/SearchableSelect';
import { usePermission } from '../lib/usePermission';
import Barcode128, { barcode128Svg } from '../components/Barcode128';

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

const STATUSES = ['Pending', 'In-Process', 'Completed'];
const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  Planned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'In-Process': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-violet-100 text-violet-700',
  Cancelled: 'bg-rose-100 text-rose-600',
};

// Hourly production slots for the Route Card (9 AM to 6 PM). 1-2 is the lunch break.
const ROUTE_CARD_HOURS: { label: string; lunch?: boolean }[] = [
  { label: '9 - 10' },
  { label: '10 - 11' },
  { label: '11 - 12' },
  { label: '12 - 1' },
  { label: '1 - 2', lunch: true },
  { label: '2 - 3' },
  { label: '3 - 4' },
  { label: '4 - 5' },
  { label: '5 - 6' },
];

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
  const [showRouteCard, setShowRouteCard] = useState(false);

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
          // Pending when no output, Completed when output meets planned,
          // In-Process once any output is recorded.
          let stageStatus = 'Pending';
          if (oQty <= 0) stageStatus = 'Pending';
          else if (pQty > 0 && oQty >= pQty) stageStatus = 'Completed';
          else stageStatus = 'In-Process';
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

  // Plan Balance = Planned Qty - Output Qty (measurement/last stage output).
  const planBalanceQty = Math.max(0, totalPlanQty - completedQty);

  // Plan status derived from output qty vs planned qty:
  //   - Completed : output qty equals planned qty (and planned > 0)
  //   - In-Process: output qty > 0 (but less than planned)
  //   - Pending   : output qty is 0
  const derivedStatus = (() => {
    if (totalPlanQty <= 0) return 'Pending';
    if (completedQty <= 0) return 'Pending';
    if (completedQty >= totalPlanQty) return 'Completed';
    return 'In-Process';
  })();

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
    // When selecting a process stage, enforce the master sequence: every stage
    // with a LOWER master seq must already be chosen in the plan. This prevents
    // selecting e.g. "Measurement"/"Packing" before "Wet End"/"Finishing".
    if (field === 'stage_id' && value) {
      const ps = processStages.find((p) => String(p.id) === value);
      const seqNum = (v: any) => { const n = Number(v); return Number.isFinite(n) && v !== null && v !== '' ? n : Number.MAX_SAFE_INTEGER; };
      if (ps) {
        const targetSeq = seqNum(ps.seq);
        const chosenIds = new Set(stages.filter((s) => s._key !== key && s.stage_id).map((s) => String(s.stage_id)));
        const missingEarlier = processStages
          .filter((p) => seqNum(p.seq) < targetSeq && !chosenIds.has(String(p.id)))
          .map((p) => p.name);
        if (missingEarlier.length > 0) {
          toast.error(`Select "${missingEarlier[0]}" first — stages must be planned in sequence`);
          return; // reject the out-of-sequence selection
        }
      }
    }
    setStages((prev) => prev.map((s) => {
      if (s._key !== key) return s;
      const updated = { ...s, [field]: value };
      if (field === 'stage_id') {
        const ps = processStages.find((p) => String(p.id) === value);
        if (ps) {
          updated.stage_name = ps.name;
          updated.uom = ps.uom || '';
          // Store the REAL master process-stage sequence so sequence checks and
          // ordering use the actual order, not the row position.
          const n = Number(ps.seq);
          if (Number.isFinite(n)) updated.seq = n;
        }
      }
      // Recalculate WIP = Input - Output - Rejection
      const iQty = parseFloat(updated.issue_input_qty) || 0;
      const oQty = parseFloat(updated.output_qty) || 0;
      const rQty = parseFloat(updated.rejection_qty) || 0;
      const pQty = parseFloat(updated.planned_qty) || 0;
      updated.wip_qty = Math.max(0, iQty - oQty - rQty);
      // Auto-calculate status: Pending when no output, Completed when output
      // meets planned, In-Process once any output is recorded.
      if (oQty <= 0) {
        updated.status = 'Pending';
      } else if (pQty > 0 && oQty >= pQty) {
        updated.status = 'Completed';
      } else {
        updated.status = 'In-Process';
      }
      return updated;
    }));
  };

  const handleSave = async () => {
    if (!plan.plan_date) { toast.error('Plan date is required'); return; }
    if (!plan.article) { toast.error('Article is required'); return; }

    // Stages must be planned strictly in sequence order: a stage can only have a
    // planned qty if EVERY earlier-sequence stage is also planned. So the planned
    // stages must form a contiguous block from the first stage — no gaps.
    const ordered = [...stages].sort((a, b) => (a.seq || 0) - (b.seq || 0));
    const plannedFlags = ordered.map(s => (parseFloat(s.planned_qty) || 0) > 0);
    const firstUnplanned = plannedFlags.indexOf(false);
    if (firstUnplanned !== -1) {
      const laterPlanned = plannedFlags.slice(firstUnplanned + 1).indexOf(true);
      if (laterPlanned !== -1) {
        const offending = ordered[firstUnplanned + 1 + laterPlanned];
        const missing = ordered[firstUnplanned];
        toast.error(`Plan stages in sequence: "${missing.stage_name || 'a prior stage'}" must be planned before "${offending.stage_name || 'this stage'}"`);
        return;
      }
    }

    // Every stage must have a planned qty greater than 0 before saving.
    const zeroQtyStage = stages.find(s => (parseFloat(s.planned_qty) || 0) <= 0);
    if (zeroQtyStage) {
      toast.error(`Planned qty must be greater than 0 for stage "${zeroQtyStage.stage_name || 'unnamed'}"`);
      return;
    }

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
      // Plan status reflects ACTUAL production progress (derived from stage
      // statuses), so it stays consistent with the Stage Wise table.
      const autoStatus = derivedStatus;
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

  // ─── Route Card ────────────────────────────────────────────────────────────
  // Stages that actually get a sheet: those with a planned qty > 0.
  const routeCardStages = stages.filter((s) => (parseFloat(s.planned_qty) || 0) > 0);
  const customerName = customers.find((c) => String(c.id) === plan.customer_id)?.name || '—';
  const orderNo = salesOrders.find((s) => String(s.id) === plan.sales_order_id)?.order_no || '—';

  // Build the printable Route Card HTML: one sheet per stage, plan info shared.
  const buildRouteCardHtml = () => {
    const esc = (v: any) => String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const barcode = barcode128Svg(plan.plan_no || '', { height: 46, barWidth: 1.5, showText: true });

    const hourRows = ROUTE_CARD_HOURS.map((h) => h.lunch
      ? `<tr class="lunch"><td class="hr">${esc(h.label)}</td><td colspan="3" class="lunch-cell">LUNCH</td></tr>`
      : `<tr><td class="hr">${esc(h.label)}</td><td></td><td></td><td></td></tr>`
    ).join('');

    const sheets = routeCardStages.map((s, i) => `
      <section class="sheet${i > 0 ? ' page-break' : ''}">
        <div class="title">Leather Tannery ERP — Route Card</div>
        <table class="info">
          <tr>
            <td class="lbl">Barcode (Plan No)</td>
            <td class="barcode">${barcode}</td>
            <td class="lbl">Plan No</td><td>${esc(plan.plan_no)}</td>
          </tr>
          <tr>
            <td class="lbl">Plan Date</td><td>${esc(plan.plan_date || '—')}</td>
            <td class="lbl">Customer</td><td>${esc(customerName)}</td>
          </tr>
          <tr>
            <td class="lbl">Article</td><td>${esc(plan.article || '—')}</td>
            <td class="lbl">Color</td><td>${esc(plan.color || '—')}</td>
          </tr>
          <tr>
            <td class="lbl">Order No</td><td>${esc(orderNo)}</td>
            <td class="lbl">UOM</td><td>${esc(s.uom || '—')}</td>
          </tr>
        </table>

        <table class="stage">
          <tr>
            <td class="stage-lbl">Stage</td>
            <td class="stage-val">${esc(s.stage_name || '—')}</td>
            <td class="stage-lbl">Planned Qty</td>
            <td class="stage-val">${esc(fmt(parseFloat(s.planned_qty) || 0))} ${esc(s.uom || '')}</td>
          </tr>
        </table>

        <table class="hours">
          <thead>
            <tr>
              <th>Prod. Hour</th>
              <th>Input Qty</th>
              <th>Output Qty</th>
              <th>Rejection Qty</th>
            </tr>
          </thead>
          <tbody>
            ${hourRows}
            <tr class="total">
              <td>Total</td><td></td><td></td><td></td>
            </tr>
          </tbody>
        </table>

        <div class="sign">
          <div>Operator</div><div>Supervisor</div><div>QC</div>
        </div>
      </section>`).join('');

    return `<!doctype html><html><head><meta charset="utf-8"/>
      <title>Route Card — ${esc(plan.plan_no)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 16px; }
        .sheet { padding: 8px 4px 24px; }
        .page-break { page-break-before: always; }
        .title { text-align: center; font-size: 16px; font-weight: 700; border: 1px solid #000; padding: 8px; margin-bottom: 0; }
        table { width: 100%; border-collapse: collapse; }
        .info td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: middle; }
        .info .lbl { font-weight: 700; background: #f3f4f6; width: 15%; white-space: nowrap; }
        .info .barcode { text-align: center; }
        .info .barcode svg { height: 56px; }
        .stage { margin-top: -1px; }
        .stage td { border: 1px solid #000; padding: 10px 8px; }
        .stage .stage-lbl { font-weight: 700; font-size: 15px; background: #fde68a; width: 15%; white-space: nowrap; }
        .stage .stage-val { font-weight: 800; font-size: 18px; background: #fff7cc; }
        .hours { margin-top: 10px; }
        .hours th { background: #1e3a8a; color: #fff; border: 1px solid #000; padding: 7px 8px; font-size: 12px; }
        .hours td { border: 1px solid #000; padding: 9px 8px; font-size: 12px; height: 22px; }
        .hours .hr { font-weight: 600; width: 22%; }
        .hours .lunch td, .hours tr.lunch { background: #f3f4f6; }
        .hours .lunch-cell { text-align: center; font-weight: 700; letter-spacing: 2px; color: #6b7280; }
        .hours .total td { font-weight: 800; background: #e5e7eb; }
        .sign { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; }
        .sign div { border-top: 1px solid #000; padding-top: 4px; width: 28%; text-align: center; }
        @page { size: A4; margin: 12mm; }
      </style></head>
      <body>${sheets || '<p style="text-align:center">No planned stages to print.</p>'}</body></html>`;
  };

  const handlePrintRouteCard = () => {
    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) { toast.error('Please allow pop-ups to print the Route Card'); return; }
    w.document.open();
    w.document.write(buildRouteCardHtml());
    w.document.close();
    w.focus();
    // Give the barcode SVG a tick to render before invoking print.
    setTimeout(() => { w.print(); }, 300);
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[derivedStatus] || 'bg-gray-100 text-gray-700'}`}>
                {derivedStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={() => setShowPrintPreview(true)}>
            <Printer size={13} /> Print
          </button>
          <button
            onClick={() => setShowRouteCard(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Printer size={13} /> Print Route Card
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
              addNewPath="/customer-master/new"
              addNewLabel="Add Customer"
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
              {derivedStatus}
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
                    {(() => {
                      // Only offer stages that are valid at this point in the
                      // sequence: a stage is selectable when every earlier-seq
                      // master stage is already chosen. The currently selected
                      // stage and already-chosen stages stay listed.
                      const seqNum = (v: any) => { const n = Number(v); return Number.isFinite(n) && v !== null && v !== '' ? n : Number.MAX_SAFE_INTEGER; };
                      const chosenIds = new Set(stages.filter((s) => s._key !== stage._key && s.stage_id).map((s) => String(s.stage_id)));
                      const options = processStages.filter((ps) => {
                        if (String(ps.id) === String(stage.stage_id)) return true; // keep current
                        if (chosenIds.has(String(ps.id))) return false;            // already used elsewhere
                        const targetSeq = seqNum(ps.seq);
                        // selectable only if no earlier-seq stage is still unchosen
                        return !processStages.some((p) => seqNum(p.seq) < targetSeq && !chosenIds.has(String(p.id)));
                      });
                      return (
                        <select
                          value={stage.stage_id}
                          onChange={(e) => updateStage(stage._key, 'stage_id', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white min-w-[160px] text-blue-700 font-medium"
                        >
                          <option value="">Select stage</option>
                          {options.map((ps) => <option key={ps.id} value={String(ps.id)}>{ps.name}</option>)}
                        </select>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-3 text-center text-xs text-gray-600 font-medium">{stage.uom || '—'}</td>
                  <td className="py-3 px-3">
                    {(() => {
                      // Sequence rule: a stage's Plan Qty can only be entered once
                      // every earlier stage has a planned qty > 0.
                      const priorUnplanned = stages.slice(0, idx).some(s => (parseFloat(s.planned_qty) || 0) <= 0);
                      const lockedByOutput = (parseFloat(stage.output_qty) || 0) > 0;
                      const disabled = lockedByOutput || priorUnplanned;
                      return (
                        <input type="number" value={stage.planned_qty} onChange={(e) => updateStage(stage._key, 'planned_qty', e.target.value)}
                          disabled={disabled}
                          title={priorUnplanned ? 'Plan the previous stage(s) first' : undefined}
                          placeholder={priorUnplanned ? 'Plan prior stage first' : undefined}
                          className={`w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg text-center min-w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`} />
                      );
                    })()}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-blue-500 rounded-full" />
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Sale Order Qty</p>
              <p className="text-xl font-black text-gray-900">{fmtCurrency(salesOrderQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-indigo-500 rounded-full" />
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Planned Qty</p>
              <p className="text-xl font-black text-indigo-700">{fmtCurrency(totalPlanQty)}</p>
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
            <div className="w-1.5 h-12 bg-orange-500 rounded-full" />
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">WIP Qty</p>
              <p className="text-xl font-black text-orange-700">{fmtCurrency(totalWipQty)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-amber-500 rounded-full" />
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-medium">Plan Balance</p>
              <p className="text-xl font-black text-amber-700">{fmtCurrency(planBalanceQty)}</p>
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
                <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="font-medium">{derivedStatus}</span></div>
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
              <div className="grid grid-cols-5 gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">Sale Order Qty</p><p className="text-lg font-black text-gray-900">{fmtCurrency(salesOrderQty)}</p></div>
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">Planned Qty</p><p className="text-lg font-black text-indigo-700">{fmtCurrency(totalPlanQty)}</p></div>
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">Completed Qty</p><p className="text-lg font-black text-emerald-700">{fmtCurrency(completedQty)}</p></div>
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">WIP Qty</p><p className="text-lg font-black text-orange-700">{fmtCurrency(totalWipQty)}</p></div>
                <div className="text-center"><p className="text-xs text-gray-500 uppercase font-medium">Plan Balance</p><p className="text-lg font-black text-amber-700">{fmtCurrency(planBalanceQty)}</p></div>
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

      {/* Route Card Preview Modal */}
      {showRouteCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowRouteCard(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-bold text-gray-900">Route Card — {routeCardStages.length} stage sheet(s)</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintRouteCard}
                  disabled={routeCardStages.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setShowRouteCard(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-6 flex-1 bg-gray-100 space-y-6">
              {routeCardStages.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-10">No planned stages to print. Add a stage with a planned qty first.</p>
              )}
              {routeCardStages.map((s) => (
                <div key={s._key} className="bg-white border border-gray-800 mx-auto max-w-2xl text-gray-900">
                  <div className="text-center text-base font-bold border-b border-gray-800 py-2">Leather Tannery ERP — Route Card</div>
                  {/* Plan info */}
                  <table className="w-full border-collapse text-xs">
                    <tbody>
                      <tr>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 w-[15%] whitespace-nowrap">Barcode (Plan No)</td>
                        <td className="border border-gray-800 px-2 py-1.5 text-center"><Barcode128 value={plan.plan_no || ''} height={44} barWidth={1.4} /></td>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 whitespace-nowrap">Plan No</td>
                        <td className="border border-gray-800 px-2 py-1.5">{plan.plan_no || '—'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 whitespace-nowrap">Plan Date</td>
                        <td className="border border-gray-800 px-2 py-1.5">{plan.plan_date || '—'}</td>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 whitespace-nowrap">Customer</td>
                        <td className="border border-gray-800 px-2 py-1.5">{customerName}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 whitespace-nowrap">Article</td>
                        <td className="border border-gray-800 px-2 py-1.5">{plan.article || '—'}</td>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 whitespace-nowrap">Color</td>
                        <td className="border border-gray-800 px-2 py-1.5">{plan.color || '—'}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 whitespace-nowrap">Order No</td>
                        <td className="border border-gray-800 px-2 py-1.5">{orderNo}</td>
                        <td className="border border-gray-800 px-2 py-1.5 font-bold bg-gray-100 whitespace-nowrap">UOM</td>
                        <td className="border border-gray-800 px-2 py-1.5">{s.uom || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Highlighted stage + planned qty */}
                  <table className="w-full border-collapse -mt-px">
                    <tbody>
                      <tr>
                        <td className="border border-gray-800 px-2 py-2.5 font-bold text-sm bg-amber-200 w-[15%] whitespace-nowrap">Stage</td>
                        <td className="border border-gray-800 px-2 py-2.5 font-extrabold text-lg bg-amber-50">{s.stage_name || '—'}</td>
                        <td className="border border-gray-800 px-2 py-2.5 font-bold text-sm bg-amber-200 whitespace-nowrap">Planned Qty</td>
                        <td className="border border-gray-800 px-2 py-2.5 font-extrabold text-lg bg-amber-50">{fmt(parseFloat(s.planned_qty) || 0)} {s.uom || ''}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Hourly table */}
                  <table className="w-full border-collapse mt-2.5 text-xs">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="border border-gray-800 px-2 py-1.5 w-[22%]">Prod. Hour</th>
                        <th className="border border-gray-800 px-2 py-1.5">Input Qty</th>
                        <th className="border border-gray-800 px-2 py-1.5">Output Qty</th>
                        <th className="border border-gray-800 px-2 py-1.5">Rejection Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROUTE_CARD_HOURS.map((h) => h.lunch ? (
                        <tr key={h.label} className="bg-gray-100">
                          <td className="border border-gray-800 px-2 py-2 font-semibold">{h.label}</td>
                          <td className="border border-gray-800 px-2 py-2 text-center font-bold tracking-widest text-gray-500" colSpan={3}>LUNCH</td>
                        </tr>
                      ) : (
                        <tr key={h.label}>
                          <td className="border border-gray-800 px-2 py-2 font-semibold">{h.label}</td>
                          <td className="border border-gray-800 px-2 py-2">&nbsp;</td>
                          <td className="border border-gray-800 px-2 py-2">&nbsp;</td>
                          <td className="border border-gray-800 px-2 py-2">&nbsp;</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-200 font-extrabold">
                        <td className="border border-gray-800 px-2 py-2">Total</td>
                        <td className="border border-gray-800 px-2 py-2">&nbsp;</td>
                        <td className="border border-gray-800 px-2 py-2">&nbsp;</td>
                        <td className="border border-gray-800 px-2 py-2">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-between px-4 py-6 text-xs text-gray-600">
                    <div className="border-t border-gray-800 pt-1 w-[28%] text-center">Operator</div>
                    <div className="border-t border-gray-800 pt-1 w-[28%] text-center">Supervisor</div>
                    <div className="border-t border-gray-800 pt-1 w-[28%] text-center">QC</div>
                  </div>
                </div>
              ))}
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
