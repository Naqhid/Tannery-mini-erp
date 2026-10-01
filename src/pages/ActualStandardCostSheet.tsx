import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ChevronDown, ChevronRight, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { exportToExcel } from '../lib/excelExport';
import { downloadPDF } from '../lib/pdfExport';

// Normalize the various data_source labels into the 3 cost sources we classify by.
const SOURCE_LABELS: Record<string, string> = {
  'Material Issue': 'Material Cost',
  'Material Cost': 'Material Cost',
  'Machine Cost': 'Machine Cost',
  'General Cost': 'General Cost',
};
const SOURCE_ORDER = ['Material Cost', 'Machine Cost', 'General Cost'];
const normalizeSource = (s: string) => SOURCE_LABELS[s] || s || 'Other';

type CostRow = { data_source:string; item_group:string; item_name:string; cost_group:string; cost_category:string; uom:string; actual_cost:number; cost_per_uom:number };
type Stage = { id:number; process_stage:string; uom:string; order_qty:number; completed_qty:number; balance_qty:number; rejection_qty?:number; rows:CostRow[] };
type SummaryLine = { label:string; amount:number; cost_per_piece:number };
type SummaryStage = {
  process_stage:string; uom:string; output_qty:number; rejection_qty:number;
  lines:SummaryLine[];
  total:{ amount:number; cost_per_piece:number };
  rejection:{ qty:number; amount:number; cost_per_piece:number };
  total_with_rejection:{ amount:number; cost_per_piece:number };
};
type SummaryMeta = { order_qty:number; completed_qty:number; excess_shortage:number };
type Detail = { order:{ customer_name:string; article:string; color:string; order_no:string; uom:string; order_qty:number; completed_qty:number; balance_qty:number; production_plan_id?:number }; stages:Stage[]; summary?:SummaryStage[]; summary_meta?:SummaryMeta };

const fmt = (n:number) => new Intl.NumberFormat('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0);
const fmtQty = (n:number) => new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(Number(n)||0);

export default function ActualStandardCostSheet(){
  const { id, planId } = useParams<{id?:string; planId?:string}>(); const navigate=useNavigate();
  const [data,setData]=useState<Detail|null>(null); const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [effectiveFrom,setEffectiveFrom]=useState(new Date().toISOString().slice(0,10));
  const [description,setDescription]=useState('');
  const [currency,setCurrency]=useState('INR');
  const [status,setStatus]=useState('Draft');
  const [costSheetNo,setCostSheetNo]=useState('');

  const handleSave = async () => {
    if(!data) return;
    setSaving(true);
    try {
      const payload = {
        production_plan_id: data.order.production_plan_id ?? (planId ? Number(planId) : Number(id)),
        effective_from: effectiveFrom,
        prepared_by: user?.name || user?.full_name || 'Costing Dept.',
        description,
        currency,
        status,
        order_no: data.order.order_no,
        customer_name: data.order.customer_name,
        article: data.order.article,
        color: data.order.color,
        order_qty: data.order.order_qty,
        completed_qty: data.order.completed_qty,
        balance_qty: data.order.balance_qty,
        total_amount: totals.amount,
        total_actual_cost: totals.amount,
        total_cost_per_uom: totals.costPerUom,
      };
      // Use the BOM/actual cost-sheet path so production_plan_id is persisted,
      // which is what the Approved-status lock on general/machine cost relies on.
      await api('/standard-costs/bom', { method: 'POST', body: JSON.stringify(payload) });
      toast.success(status === 'Approved'
        ? 'Standard Cost Sheet approved. General & Machine cost for this order are now locked.'
        : 'Standard Cost Sheet saved successfully!');
      navigate('/standard-costing');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };
  const user=JSON.parse(localStorage.getItem('tannery_user')||'{}');
  useEffect(()=>{
    const endpoint = planId ? `/costing-report/plan/${planId}/detail` : `/costing-report/${id}/detail`;
    api<{data:Detail}>(endpoint).then(r=>{
      setData(r.data);
      const cust = r.data?.order?.customer_name || '';
      const qs = cust ? `?customer_name=${encodeURIComponent(cust)}` : '';
      api<{data:{cost_sheet_no:string}}>(`/standard-costs/next-no${qs}`)
        .then(n=>setCostSheetNo(n.data?.cost_sheet_no||''))
        .catch(()=>{});
    }).finally(()=>setLoading(false));
  },[id, planId]);
  // Collapse state keyed by source label.
  const [collapsedSources,setCollapsedSources]=useState<Record<string,boolean>>({});
  const toggleSource=(src:string)=>setCollapsedSources(prev=>({...prev,[src]:!prev[src]}));

  const totals=useMemo(()=>{
    const rows=data?.stages.flatMap(s=>s.rows)||[];
    const amount=rows.reduce((a,r)=>a+Number(r.actual_cost||0),0);
    const out=data?.order.completed_qty||0;
    return {amount,costPerUom:out>0?amount/out:0};
  },[data]);

  // Measurement qty drives cost/piece (Sq.Ft.). This is the measurement-stage
  // completed qty resolved by the backend as order.completed_qty.
  const measurementQty = Number(data?.order.completed_qty) || 0;

  // Group all stage cost rows by SOURCE (Material / Machine / General), merging
  // identical item names so each source collapses into one classified section.
  const sourceGroups = useMemo(()=>{
    const map = new Map<string, { source:string; rows:CostRow[]; amount:number }>();
    for (const stage of (data?.stages||[])) {
      for (const r of stage.rows) {
        const src = normalizeSource(r.data_source || r.cost_group);
        if (!map.has(src)) map.set(src, { source: src, rows: [], amount: 0 });
        const g = map.get(src)!;
        g.rows.push(r);
        g.amount += Number(r.actual_cost||0);
      }
    }
    const ordered = [...map.values()].sort((a,b)=>{
      const ia = SOURCE_ORDER.indexOf(a.source); const ib = SOURCE_ORDER.indexOf(b.source);
      return (ia<0?99:ia)-(ib<0?99:ib);
    });
    return ordered;
  },[data]);

  const buildExportRows = () => {
    const rows: string[][] = [];
    for (const g of sourceGroups) {
      for (const r of g.rows) {
        const amt = Number(r.actual_cost)||0;
        rows.push([
          g.source,
          r.item_group || '—',
          r.item_name || r.cost_category || '—',
          r.uom || '—',
          fmt(amt),
          fmt(measurementQty>0 ? amt/measurementQty : 0),
        ]);
      }
    }
    rows.push(['', '', 'TOTAL', '', fmt(totals.amount), fmt(measurementQty>0 ? totals.amount/measurementQty : 0)]);
    return rows;
  };

  const handleExportExcel = () => {
    if (!data) return;
    const rows = sourceGroups.flatMap(g => g.rows.map(r => {
      const amt = Number(r.actual_cost)||0;
      return {
        source: g.source,
        item_group: r.item_group || '',
        item_name: r.item_name || r.cost_category || '',
        uom: r.uom || '',
        actual_cost: fmt(amt),
        cost_per_sqft: fmt(measurementQty>0 ? amt/measurementQty : 0),
      };
    }));
    exportToExcel({
      data: rows,
      columns: [
        { key:'source', header:'Source' },
        { key:'item_group', header:'Item Group' },
        { key:'item_name', header:'Item Name' },
        { key:'uom', header:'UOM' },
        { key:'actual_cost', header:'Actual Cost (INR)' },
        { key:'cost_per_sqft', header:'Cost / Sq.Ft. (INR)' },
      ],
      fileName: `StandardCost_${data.order.order_no || 'sheet'}`,
    });
  };

  const handleExportPdf = () => {
    if (!data) return;
    downloadPDF({
      title: 'Standard Cost Sheet',
      subtitle: `${data.order.customer_name} · ${data.order.article} · ${data.order.order_no}`,
      columns: ['Source','Item Group','Item Name','UOM','Actual Cost (INR)','Cost / Sq.Ft. (INR)'],
      rows: buildExportRows(),
      accentColor: [37, 99, 235],
      fileName: `StandardCost_${data.order.order_no || 'sheet'}.pdf`,
    });
  };

  if(loading) return <div className="p-8 text-center text-gray-500">Loading standard cost sheet...</div>;
  if(!data) return <div className="p-8 text-center text-red-500">Production plan not found.</div>;
  return <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 bg-[#fafbfe] min-h-full">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-slate-800">Standard Cost Sheet</h1><span className="px-3 py-1 rounded bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200">Draft</span></div>
      <div className="flex gap-3">
        <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"><FileSpreadsheet size={16}/>Excel</button>
        <button onClick={handleExportPdf} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"><FileText size={16}/>PDF</button>
        <button onClick={()=>navigate('/standard-costing')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold"><X size={16}/>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"><Save size={16}/>{saving?'Saving...':'Save'}</button>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h2 className="font-bold text-slate-700 mb-3">Standard Cost Sheet Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <Field label="Effective From *"><input type="date" value={effectiveFrom} onChange={e=>setEffectiveFrom(e.target.value)} className="field"/></Field>
        <Field label="Prepared By *"><input value={user?.name||user?.full_name||'Costing Dept.'} readOnly className="field bg-slate-50"/></Field>
        <Field label="Description / Note"><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Standard cost prepared for export orders..." className="field"/></Field>
        <Field label="Cost Sheet No."><input value={costSheetNo || '(Auto-generated)'} readOnly className="field bg-slate-50"/></Field>
        <Field label="Currency"><select className="field" value={currency} onChange={e=>setCurrency(e.target.value)}><option>INR</option><option>USD</option><option>EUR</option></select></Field>
        <Field label="Status"><select className="field" value={status} onChange={e=>setStatus(e.target.value)}><option>Draft</option><option>Approved</option></select></Field>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 border border-slate-200 rounded-lg overflow-hidden">
        <Metric label="Customer" value={data.order.customer_name}/><Metric label="Article" value={data.order.article}/><Metric label="Color" value={data.order.color}/><Metric label="Order No." value={data.order.order_no}/><Metric label="Order Qty" value={`${fmtQty(data.order.order_qty)} Sq.Ft.`}/><Metric label="Completed Qty" value={`${fmtQty(data.order.completed_qty)} Sq.Ft.`} tone="green"/><Metric label="Balance Qty" value={`${fmtQty(data.order.balance_qty)} Sq.Ft.`} tone="amber"/>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center justify-between">
        <span>Cost Details</span>
        <span className="text-xs font-normal text-slate-500">Grouped by source · Cost/Sq.Ft. based on measurement qty ({fmtQty(measurementQty)} Sq.Ft.)</span>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-3 text-center w-10"></th><th className="p-3 text-left">Source</th><th className="p-3 text-left">Item Group</th><th className="p-3 text-left">Item Name</th><th className="p-3 text-left">UOM</th><th className="p-3 text-right">Actual Cost (₹)</th><th className="p-3 text-right">Cost/Sq.Ft. (₹)</th></tr></thead><tbody>
      {sourceGroups.length===0
        ? <tr><td colSpan={7} className="p-6 text-center text-slate-400">No cost entries</td></tr>
        : sourceGroups.map((g)=>(
          <SourceRows key={g.source} group={g} measurementQty={measurementQty} collapsed={!!collapsedSources[g.source]} onToggle={()=>toggleSource(g.source)} />
        ))}
      </tbody><tfoot className="border-t-2 border-slate-300 bg-slate-50"><tr><td colSpan={5} className="p-3 text-right font-bold text-slate-700">Total</td><td className="p-3 text-right font-bold text-blue-800">{fmt(totals.amount)}</td><td className="p-3 text-right font-bold text-blue-800">{fmt(measurementQty>0 ? totals.amount/measurementQty : 0)}</td></tr></tfoot></table></div>
    </div>
    {data.summary && data.summary.length>0 && <SummarySection summary={data.summary} meta={data.summary_meta}/>}
  </div>;
}

function SummarySection({summary,meta}:{summary:SummaryStage[];meta?:SummaryMeta}){
  const grand = summary.reduce((a,s)=>({amt:a.amt+s.total_with_rejection.amount, cpp:a.cpp+s.total_with_rejection.cost_per_piece}),{amt:0,cpp:0});
  return <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-200 font-bold text-slate-700">Summary</div>
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-700"><tr>
        <th className="p-3 text-left">Stage</th>
        <th className="p-3 text-left">Cost Component</th>
        <th className="p-3 text-right">Actual Cost (₹)</th>
        <th className="p-3 text-right">Cost/Piece (₹)</th>
        <th className="p-3 text-right">Cost/Sqft (₹)</th>
      </tr></thead>
      <tbody>
        {summary.map((s,si)=><SummaryStageRows key={si} s={s}/>)}
      </tbody>
      <tfoot className="border-t-2 border-slate-300 bg-slate-50"><tr>
        <td colSpan={2} className="p-3 text-right font-bold text-slate-700">Grand Total (incl. rejection)</td>
        <td className="p-3 text-right font-bold text-blue-800">{fmt(grand.amt)}</td>
        <td className="p-3 text-right font-bold text-blue-800">{fmt(grand.amt / (meta?.completed_qty > 0 ? meta.completed_qty : 1))}</td>
        <td className="p-3 text-right font-bold text-blue-800">{fmt(grand.cpp)}</td>
      </tr></tfoot>
    </table></div>
    {meta && <div className="px-4 py-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
      <div className="flex justify-between sm:flex-col sm:justify-start"><span className="text-slate-500 font-semibold">Order Qty</span><span className="font-bold text-slate-800">{fmtQty(meta.order_qty)} Sq.Ft.</span></div>
      <div className="flex justify-between sm:flex-col sm:justify-start"><span className="text-slate-500 font-semibold">Measurement Qty</span><span className="font-bold text-slate-800">{fmtQty(meta.completed_qty)} Sq.Ft.</span></div>
      <div className="flex justify-between sm:flex-col sm:justify-start"><span className="text-slate-500 font-semibold">Excess / Shortage</span><span className={`font-bold ${meta.excess_shortage>0?'text-amber-700':meta.excess_shortage<0?'text-green-700':'text-slate-800'}`}>{fmtQty(meta.excess_shortage)} Sq.Ft.</span></div>
    </div>}
  </div>;
}

function SummaryStageRows({s}:{s:SummaryStage}){
  const stageLabel = `${s.process_stage||'Stage'} - ${fmtQty(s.output_qty)} ${s.uom||''}`;
  return <>
    <tr className="border-t border-slate-200 bg-slate-50/70"><td colSpan={5} className="p-2.5 font-bold text-slate-800">{stageLabel}</td></tr>
    {s.lines.map((ln,i)=><tr key={i} className="border-t border-slate-100">
      <td className="p-2.5"></td>
      <td className="p-2.5">{ln.label}</td>
      <td className="p-2.5 text-right">{fmt(ln.amount)}</td>
      <td className="p-2.5 text-right">{fmt(ln.amount / (s.output_qty > 0 ? s.output_qty : 1))}</td>
      <td className="p-2.5 text-right">{fmt(ln.cost_per_piece)}</td>
    </tr>)}
    <tr className="border-t border-slate-100 bg-slate-50/40">
      <td className="p-2.5"></td>
      <td className="p-2.5 font-semibold text-slate-600">Total</td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(s.total.amount)}</td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(s.total.amount / (s.output_qty > 0 ? s.output_qty : 1))}</td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(s.total.cost_per_piece)}</td>
    </tr>
    <tr className="border-t border-slate-100">
      <td className="p-2.5"></td>
      <td className="p-2.5 text-rose-700">Rejection {fmtQty(s.rejection.qty)} {s.uom||''}</td>
      <td className="p-2.5 text-right text-rose-700">{fmt(s.rejection.amount)}</td>
      <td className="p-2.5 text-right text-rose-700">{fmt(s.rejection.amount / (s.rejection.qty > 0 ? s.rejection.qty : 1))}</td>
      <td className="p-2.5 text-right text-rose-700">{fmt(s.rejection.cost_per_piece)}</td>
    </tr>
    <tr className="border-t border-slate-100 bg-blue-50/40">
      <td className="p-2.5"></td>
      <td className="p-2.5 font-semibold text-blue-800">{s.process_stage} + Rejection</td>
      <td className="p-2.5 text-right font-semibold text-blue-800">{fmt(s.total_with_rejection.amount)}</td>
      <td className="p-2.5 text-right font-semibold text-blue-800">{fmt(s.total_with_rejection.amount / ((s.output_qty + s.rejection.qty) > 0 ? (s.output_qty + s.rejection.qty) : 1))}</td>
      <td className="p-2.5 text-right font-semibold text-blue-800">{fmt(s.total_with_rejection.cost_per_piece)}</td>
    </tr>
  </>;
}
// Collapsible section for one cost SOURCE (Material / Machine / General).
// Cost/Sq.Ft. is computed from the measurement qty, not the per-stage output.
function SourceRows({group,measurementQty,collapsed,onToggle}:{group:{source:string;rows:CostRow[];amount:number};measurementQty:number;collapsed:boolean;onToggle:()=>void}){
  const perSqft=(amt:number)=> measurementQty>0 ? amt/measurementQty : 0;
  return <>
    <tr className="border-t border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-slate-100/70" onClick={onToggle}>
      <td className="p-2.5 text-center text-slate-500">{collapsed ? <ChevronRight size={14}/> : <ChevronDown size={14}/>}</td>
      <td className="p-2.5 font-bold text-slate-800" colSpan={4}>{group.source} <span className="text-xs font-normal text-slate-500">({group.rows.length} item{group.rows.length!==1?'s':''})</span></td>
      <td className="p-2.5 text-right font-bold text-slate-700">{fmt(group.amount)}</td>
      <td className="p-2.5 text-right font-bold text-slate-700">{fmt(perSqft(group.amount))}</td>
    </tr>
    {!collapsed && (group.rows.length===0
      ? <tr className="border-t border-slate-100"><td></td><td colSpan={6} className="p-2.5 text-center text-slate-400">No cost entries</td></tr>
      : group.rows.map((r,i)=><tr key={`${group.source}-${i}`} className="border-t border-slate-100">
          <td className="p-2.5"></td>
          <td className="p-2.5 text-slate-500">{group.source}</td>
          <td className="p-2.5">{r.item_group||'—'}</td>
          <td className="p-2.5 font-medium">{r.item_name||r.cost_category||'—'}</td>
          <td className="p-2.5">{r.uom||'—'}</td>
          <td className="p-2.5 text-right">{fmt(r.actual_cost)}</td>
          <td className="p-2.5 text-right">{fmt(perSqft(Number(r.actual_cost)||0))}</td>
        </tr>))}
  </>;
}

function Field({label,children}:{label:string;children:ReactNode}){return <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>{children}</div>}
function Metric({label,value,tone}:{label:string;value:string;tone?:'green'|'amber'}){return <div className="p-3 border-r last:border-r-0 border-slate-200"><div className="text-xs font-semibold text-slate-600 mb-2">{label}</div><div className={`font-bold ${tone==='green'?'text-green-700':tone==='amber'?'text-amber-700':'text-slate-800'}`}>{value||'—'}</div></div>}
