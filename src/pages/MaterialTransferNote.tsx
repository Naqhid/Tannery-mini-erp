import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Search, Download, ArrowLeftRight, AlertTriangle,
  Loader2, FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useDebounce } from '../lib/useDebounce';

interface PlanRow {
  id: number;
  plan_no: string;
  plan_date: string | null;
  article: string;
  color: string;
  planned_qty: number;
  uom: string;
  stage: string;
  customer_name: string;
  sales_order_no: string;
  derived_status: string;
}

interface MaterialRow {
  material_id: number;
  material_code: string;
  material_description: string;
  uom: string;
  per_piece_qty: number;
  required_qty: number;
  transfer_qty: number;
}

interface TransferResult {
  plan: {
    id: number;
    plan_no: string;
    plan_date: string | null;
    customer_name: string;
    sales_order_no: string;
    article: string;
    colour: string;
    planned_qty: number;
    uom: string;
    stage: string;
    warehouse_name: string;
    status: string;
  };
  materials: MaterialRow[];
  missingBom: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-amber-50 text-amber-700 border border-amber-200',
  Inprocess: 'bg-blue-50 text-blue-700 border border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const fmtNum = (n: number) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtQty = (n: number) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 4 });
const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function MaterialTransferNote() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [stageOptions, setStageOptions] = useState<string[]>([]);

  const [selected, setSelected] = useState<TransferResult | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load distinct stage names for the filter dropdown.
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: string[] }>('/material-transfer-notes/stage-options');
        setStageOptions(res.data || []);
      } catch { /* non-blocking */ }
    })();
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (stageFilter) params.set('stage', stageFilter);
      const res = await api<{ data: PlanRow[] }>(`/material-transfer-notes/plans?${params}`);
      setPlans(res.data || []);
    } catch (err) {
      toast.error('Failed to load production plans: ' + (err as Error).message);
    } finally {
      setLoadingPlans(false);
    }
  }, [debouncedSearch, statusFilter, stageFilter]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const selectPlan = async (planId: number) => {
    try {
      setLoadingDetail(true);
      const res = await api<{ data: TransferResult }>(`/material-transfer-notes/${planId}`);
      setSelected(res.data);
      window.scrollTo(0, 0);
      if (res.data.missingBom) {
        toast.info('This plan has no linked product / Active BOM, so no material lines were generated.');
      }
    } catch (err) {
      toast.error('Failed to load transfer details: ' + (err as Error).message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const exportExcel = () => {
    if (!selected) return;
    const { plan, materials } = selected;
    const header = [
      ['Production Plan No.', plan.plan_no],
      ['Customer', plan.customer_name],
      ['Article', plan.article],
      ['Colour', plan.colour],
      ['Stage', plan.stage],
      ['Planned Qty', plan.planned_qty],
      [],
      ['Material Code', 'Material Description', 'UOM', 'Required Qty', 'Transfer Qty'],
    ];
    const body = materials.map((m) => [
      m.material_code,
      m.material_description,
      m.uom,
      Number(m.required_qty.toFixed(4)),
      Number(m.transfer_qty.toFixed(4)),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...body]);
    ws['!cols'] = [{ wch: 16 }, { wch: 34 }, { wch: 8 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Material Transfer Note');
    XLSX.writeFile(wb, `${plan.plan_no}_Material_Transfer_Note.xlsx`);
  };

  const totalRequired = selected?.materials.reduce((s, m) => s + m.required_qty, 0) || 0;
  const totalTransfer = selected?.materials.reduce((s, m) => s + m.transfer_qty, 0) || 0;

  // ─── Transfer Detail view ──────────────────────────────────────────────────
  if (selected) {
    const { plan, materials } = selected;
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800">
          <ArrowLeft size={16} /> Back to Production Plans
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">Inventory movement</p>
            <h1 className="text-2xl font-bold text-gray-900">Material Transfer Note</h1>
            <p className="text-sm text-gray-500 mt-1">Required materials for the selected production plan.</p>
          </div>
          <button
            onClick={exportExcel}
            disabled={materials.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <Download size={15} /> Export to Excel
          </button>
        </div>

        {/* Plan info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700">Production Plan Details</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[plan.status] || 'bg-gray-100 text-gray-700'}`}>
              {plan.status}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <InfoItem label="Production Plan No." value={plan.plan_no} highlight />
            <InfoItem label="Customer" value={plan.customer_name} />
            <InfoItem label="Article / Colour" value={`${plan.article} / ${plan.colour}`} />
            <InfoItem label="Stage" value={plan.stage} />
            <InfoItem label="Planned Qty" value={`${fmtNum(plan.planned_qty)} ${plan.uom}`} />
            <InfoItem label="Sale Order No." value={plan.sales_order_no} />
            <InfoItem label="Plan Date" value={fmtDate(plan.plan_date)} />
            {plan.warehouse_name && <InfoItem label="Warehouse" value={plan.warehouse_name} />}
          </div>
        </div>

        {selected.missingBom && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>This plan has no linked product or no Active BOM, so no material transfer lines could be generated.</span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Material Lines" value={String(materials.length)} sub="Materials listed for transfer" />
          <SummaryCard label="Total Required Qty" value={fmtQty(totalRequired)} sub="BOM norm × planned qty" />
          <SummaryCard label="Total Transfer Qty" value={fmtQty(totalTransfer)} sub="Filled from material issues" />
        </div>

        {/* Transfer details table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-700">Material Transfer Details</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Required qty from BOM norms; transfer qty fills in as material issues are recorded.</p>
            </div>
            <span className="text-xs text-gray-500">{materials.length} material{materials.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Material Code</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Material Description</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-center">UOM</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-right">Required Qty</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase text-right">Transfer Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((m) => (
                  <tr key={m.material_id} className="hover:bg-blue-50/30 transition-all">
                    <td className="py-3 px-4 font-mono text-xs font-medium text-blue-700">{m.material_code}</td>
                    <td className="py-3 px-4 text-gray-900">{m.material_description}</td>
                    <td className="py-3 px-4 text-center text-xs text-gray-600">{m.uom}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-700">{fmtQty(m.required_qty)}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-gray-900">{fmtQty(m.transfer_qty)}</td>
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                      No material lines found for this plan.
                    </td>
                  </tr>
                )}
              </tbody>
              {materials.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={3} className="py-3 px-4 text-right">Totals</td>
                    <td className="py-3 px-4 text-right tabular-nums">{fmtQty(totalRequired)}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{fmtQty(totalTransfer)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>Required Qty = BOM Norm per Piece × Planned Qty</span>
            <span>Transfer Qty is filled from material issues against this plan</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Production Plans list view ────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <ArrowLeftRight size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Transfer Note</h1>
          <p className="text-sm text-gray-500">Select a production plan to prepare its material transfer note.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plan no., article or customer..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Stages</option>
            {stageOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Inprocess">Inprocess</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Plans table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Production Plan No.</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Customer</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Article</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Colour</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Stage</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-right">Plan Qty</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-center">UOM</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Plan Date</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-left">Status</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingPlans ? (
                <tr><td colSpan={10} className="py-12 text-center text-gray-400">
                  <Loader2 size={22} className="animate-spin inline" />
                </td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center text-sm text-gray-400">
                  <FileSpreadsheet size={28} className="inline mb-2 text-gray-300" /><br />
                  No production plans found.
                </td></tr>
              ) : plans.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-all">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-700">{p.plan_no}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{p.customer_name || '—'}</td>
                  <td className="py-3 px-4 text-gray-700">{p.article || '—'}</td>
                  <td className="py-3 px-4 text-gray-700">{p.color || '—'}</td>
                  <td className="py-3 px-4 text-gray-700">{p.stage || '—'}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-gray-900">{fmtNum(p.planned_qty)}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-600">{p.uom || '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{fmtDate(p.plan_date)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[p.derived_status] || 'bg-gray-100 text-gray-700'}`}>
                      {p.derived_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => selectPlan(p.id)}
                      disabled={loadingDetail}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50">
                      Select Plan →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{plans.length} plan{plans.length !== 1 ? 's' : ''}</span>
          <span>Select a plan to prepare its material transfer note</span>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-gray-500 uppercase font-medium mb-1">{label}</p>
      <p className={`text-sm font-semibold truncate ${highlight ? 'text-blue-700' : 'text-gray-900'}`} title={value}>{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-[11px] text-gray-500 uppercase font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
