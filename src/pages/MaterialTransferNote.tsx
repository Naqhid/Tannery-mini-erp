import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowLeftRight, Loader2, FileSpreadsheet,
} from 'lucide-react';
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

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-amber-50 text-amber-700 border border-amber-200',
  Inprocess: 'bg-blue-50 text-blue-700 border border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const fmtNum = (n: number) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function MaterialTransferNote() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [stageOptions, setStageOptions] = useState<string[]>([]);

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
      toast.error('Failed to load production plans: ' + (err as Error).message, {
        toastId: 'mtn-plans-error',
      });
    } finally {
      setLoadingPlans(false);
    }
  }, [debouncedSearch, statusFilter, stageFilter]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

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
                      onClick={() => navigate(`/material-transfer-note/${p.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">
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
