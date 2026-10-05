import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ChevronDown, ChevronRight, Download, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { exportSectionedToExcel } from '../lib/excelExport';
import type { ExcelSection } from '../lib/excelExport';
import { previewSectionedPDF, downloadSectionedPDF } from '../lib/pdfExport';
import type { PdfSection, PdfKeyValue, SectionedPdfConfig } from '../lib/pdfExport';

// Normalize the various data_source labels into the 3 cost sources we classify by.
const SOURCE_LABELS: Record<string, string> = {
  'Material Issue': 'Material Cost',
  'Material Cost': 'Material Cost',
  'Machine Cost': 'Machine Cost',
  'General Cost': 'General Cost',
};
const SOURCE_ORDER = ['Material Cost', 'Machine Cost', 'General Cost'];
// Map any raw data_source label into one of our known cost sources. Unknown or
// unexpected values (e.g. a stray numeric id) collapse to "Other" so the Cost
// Details source column stays consistent with the Summary cost components.
const normalizeSource = (s: string) => {
  const mapped = SOURCE_LABELS[s];
  if (mapped) return mapped;
  if (SOURCE_ORDER.includes(s)) return s;
  return 'Other';
};

type CostRow = { data_source:string; item_group:string; item_name:string; cost_group:string; cost_category:string; uom:string; actual_cost:number; cost_per_uom:number };
type Stage = { id:number; process_stage:string; uom:string; order_qty:number; completed_qty:number; balance_qty:number; rejection_qty?:number; rows:CostRow[] };
type SummaryLine = { label:string; amount:number; cost_per_piece:number };
type SummaryStage = {
  process_stage:string; uom:string; output_qty:number; planned_qty?:number; rejection_qty:number;
  lines:SummaryLine[];
  total:{ amount:number; cost_per_piece:number };
  rejection:{ qty:number; amount:number; cost_per_piece:number };
  total_with_rejection:{ amount:number; cost_per_piece:number };
};
type SummaryMeta = { order_qty:number; completed_qty:number; measurement_sqft?:number; excess_shortage:number };
type SavedCostSheet = { id:number; cost_sheet_no:string; status:string; effective_from?:string; description?:string; currency?:string } | null;
type Detail = { order:{ customer_name:string; article:string; color:string; order_no:string; uom:string; order_qty:number; completed_qty:number; balance_qty:number; production_plan_id?:number }; stages:Stage[]; summary?:SummaryStage[]; summary_meta?:SummaryMeta; saved_cost_sheet?:SavedCostSheet };

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
      const saved = r.data?.saved_cost_sheet;
      if (saved) {
        // A standard cost sheet already exists for this order — reflect its real
        // saved status (e.g. Approved) instead of defaulting to Draft.
        if (saved.status) setStatus(saved.status);
        if (saved.cost_sheet_no) setCostSheetNo(saved.cost_sheet_no);
        if (saved.currency) setCurrency(saved.currency);
        if (saved.effective_from) setEffectiveFrom(saved.effective_from.slice(0,10));
        if (saved.description) setDescription(saved.description);
      } else {
        const cust = r.data?.order?.customer_name || '';
        const qs = cust ? `?customer_name=${encodeURIComponent(cust)}` : '';
        api<{data:{cost_sheet_no:string}}>(`/standard-costs/next-no${qs}`)
          .then(n=>setCostSheetNo(n.data?.cost_sheet_no||''))
          .catch(()=>{});
      }
    }).finally(()=>setLoading(false));
  },[id, planId]);
  // Two-level collapse state: stages collapse, and each source WITHIN a stage
  // collapses. Keyed by stage name and `stage::source`.
  const [collapsedStages,setCollapsedStages]=useState<Record<string,boolean>>({});
  const [collapsedStageSources,setCollapsedStageSources]=useState<Record<string,boolean>>({});
  const toggleStage=(stage:string)=>setCollapsedStages(prev=>({...prev,[stage]:!prev[stage]}));
  const toggleStageSource=(key:string)=>setCollapsedStageSources(prev=>({...prev,[key]:!prev[key]}));

  // Cost Details is collapsed by default: when the sheet loads, mark every
  // stage (and every stage::source) as collapsed so nothing is expanded until
  // the user clicks to open it.
  useEffect(()=>{
    if(!data) return;
    const stagesMap:Record<string,boolean>={};
    const sourcesMap:Record<string,boolean>={};
    for(const stage of data.stages||[]){
      stagesMap[stage.process_stage]=true;
      const seen=new Set<string>();
      for(const r of stage.rows){
        const src=normalizeSource(r.data_source || r.cost_group);
        if(!seen.has(src)){ seen.add(src); sourcesMap[`${stage.process_stage}::${src}`]=true; }
      }
    }
    setCollapsedStages(stagesMap);
    setCollapsedStageSources(sourcesMap);
  },[data]);

  const totals=useMemo(()=>{
    const rows=data?.stages.flatMap(s=>s.rows)||[];
    const amount=rows.reduce((a,r)=>a+Number(r.actual_cost||0),0);
    const out=data?.order.completed_qty||0;
    return {amount,costPerUom:out>0?amount/out:0};
  },[data]);

  // Build the Cost Details tree: STAGE -> SOURCE (Material / Machine / General)
  // -> line items. Each stage keeps its own output qty, and within it the rows
  // are classified by source so the UI can nest a source accordion under each
  // stage accordion.
  const stageTree = useMemo(()=>{
    return (data?.stages||[]).map(stage=>{
      const srcMap = new Map<string, { source:string; rows:CostRow[]; amount:number }>();
      for (const r of stage.rows) {
        const src = normalizeSource(r.data_source || r.cost_group);
        if (!srcMap.has(src)) srcMap.set(src, { source: src, rows: [], amount: 0 });
        const g = srcMap.get(src)!;
        g.rows.push(r);
        g.amount += Number(r.actual_cost||0);
      }
      const sources = [...srcMap.values()].sort((a,b)=>{
        const ia = SOURCE_ORDER.indexOf(a.source); const ib = SOURCE_ORDER.indexOf(b.source);
        return (ia<0?99:ia)-(ib<0?99:ib);
      });
      const amount = stage.rows.reduce((a,r)=>a+Number(r.actual_cost||0),0);
      return { stage, sources, amount };
    });
  },[data]);

  // ── Export: build the full document (Details + Cost Details + Summary +
  // Grand Total) once, reused by View PDF / Download PDF / Download Excel. ──
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setExportMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Section 1: Standard Cost Sheet Details (key/value block).
  const buildDetails = (): PdfKeyValue[] => {
    if (!data) return [];
    return [
      { label: 'Effective From', value: effectiveFrom },
      { label: 'Prepared By', value: user?.name || user?.full_name || 'Costing Dept.' },
      { label: 'Cost Sheet No.', value: costSheetNo || '(Auto-generated)' },
      { label: 'Currency', value: currency },
      { label: 'Status', value: status },
      { label: 'Description', value: description || '—' },
      { label: 'Customer', value: data.order.customer_name || '—' },
      { label: 'Article', value: data.order.article || '—' },
      { label: 'Color', value: data.order.color || '—' },
      { label: 'Order No.', value: data.order.order_no || '—' },
      { label: 'Order Qty', value: `${fmtQty(data.order.order_qty)} Sq.Ft.` },
      { label: 'Completed Qty', value: `${fmtQty(data.order.completed_qty)} Sq.Ft.` },
      { label: 'Balance Qty', value: `${fmtQty(data.order.balance_qty)} Sq.Ft.` },
    ];
  };

  // Section 2: Cost Details rows (Stage / Source / Item / Actual / Cost per Piece).
  const costDetailColumns = ['Stage','Source','Item Group','Item Name','UOM','Actual Cost (₹)','Cost/Piece (₹)'];
  const buildCostDetailRows = (): string[][] => {
    const rows: string[][] = [];
    for (const st of stageTree) {
      const stageQty = Number(st.stage.order_qty) || 0;
      for (const g of st.sources) {
        for (const r of g.rows) {
          const amt = Number(r.actual_cost)||0;
          rows.push([
            st.stage.process_stage || 'Stage',
            g.source,
            r.item_group || '—',
            r.item_name || r.cost_category || '—',
            r.uom || '—',
            fmt(amt),
            fmt(stageQty>0 ? amt/stageQty : 0),
          ]);
        }
      }
    }
    rows.push(['', '', '', 'TOTAL', '', fmt(totals.amount), '—']);
    return rows;
  };

  // Section 3: Summary rows (per stage: lines, total, rejection, +rejection).
  const summaryColumns = ['Stage','Cost Component','Actual Cost (₹)','Cost/Piece (₹)','Cost/Sqft (₹)'];
  const buildSummaryRows = (): string[][] => {
    const rows: string[][] = [];
    const summary = data?.summary || [];
    for (const s of summary) {
      const pieceQty = Number(s.planned_qty) || 0;
      const perPiece = (amt:number) => pieceQty > 0 ? amt / pieceQty : 0;
      rows.push([`${s.process_stage||'Stage'} - ${fmtQty(pieceQty)} ${s.uom||''}`, '', '', '', '']);
      for (const ln of s.lines) {
        rows.push(['', ln.label, fmt(ln.amount), fmt(perPiece(ln.amount)), fmt(ln.cost_per_piece)]);
      }
      rows.push(['', 'Total', fmt(s.total.amount), fmt(perPiece(s.total.amount)), fmt(s.total.cost_per_piece)]);
      rows.push(['', `Rejection ${fmtQty(s.rejection.qty)} ${s.uom||''}`, fmt(s.rejection.amount), fmt(s.rejection.qty>0 ? s.rejection.amount/s.rejection.qty : 0), fmt(s.rejection.cost_per_piece)]);
      rows.push(['', `${s.process_stage} + Rejection`, fmt(s.total_with_rejection.amount), fmt(perPiece(s.total_with_rejection.amount)), fmt(s.total_with_rejection.cost_per_piece)]);
    }
    return rows;
  };

  // Section 4: Grand Total (incl. rejection).
  const buildGrandTotalRows = (): string[][] => {
    const summary = data?.summary || [];
    const grand = summary.reduce((a,s)=>({ amt:a.amt+s.total_with_rejection.amount, cpp:a.cpp+s.total_with_rejection.cost_per_piece }),{amt:0,cpp:0});
    const meta = data?.summary_meta;
    return [
      ['Grand Total (incl. rejection)', fmt(grand.amt), '—', fmt(grand.cpp)],
      ['Order Qty', `${fmtQty(meta?.order_qty||0)} Sq.Ft.`, 'Measurement Qty', `${fmtQty(meta?.completed_qty||0)} Sq.Ft.`],
      ['Excess / Shortage', `${fmtQty(meta?.excess_shortage||0)} Sq.Ft.`, '', ''],
    ];
  };

  const buildPdfConfig = (): SectionedPdfConfig | null => {
    if (!data) return null;
    const sections: PdfSection[] = [
      { heading: 'Cost Details', columns: costDetailColumns, rows: buildCostDetailRows() },
    ];
    if ((data.summary||[]).length > 0) {
      sections.push({ heading: 'Summary', columns: summaryColumns, rows: buildSummaryRows() });
      sections.push({ heading: 'Grand Total', columns: ['', 'Actual Cost (₹)', 'Cost/Piece (₹)', 'Cost/Sqft (₹)'], rows: buildGrandTotalRows() });
    }
    return {
      title: 'Standard Cost Sheet',
      subtitle: `${data.order.customer_name} · ${data.order.article} · ${data.order.order_no}`,
      details: buildDetails(),
      sections,
      accentColor: [37, 99, 235],
      fileName: `StandardCost_${data.order.order_no || 'sheet'}.pdf`,
    };
  };

  const handleViewPdf = () => {
    const cfg = buildPdfConfig();
    if (cfg) previewSectionedPDF(cfg);
    setExportMenuOpen(false);
  };
  const handleDownloadPdf = () => {
    const cfg = buildPdfConfig();
    if (cfg) downloadSectionedPDF(cfg);
    setExportMenuOpen(false);
  };
  const handleDownloadExcel = () => {
    if (!data) { setExportMenuOpen(false); return; }
    const sections: ExcelSection[] = [
      { heading: 'Cost Details', columns: costDetailColumns, rows: buildCostDetailRows() },
    ];
    if ((data.summary||[]).length > 0) {
      sections.push({ heading: 'Summary', columns: summaryColumns, rows: buildSummaryRows() });
      sections.push({ heading: 'Grand Total', columns: ['', 'Actual Cost (₹)', 'Cost/Piece (₹)', 'Cost/Sqft (₹)'], rows: buildGrandTotalRows() });
    }
    exportSectionedToExcel({
      title: 'Standard Cost Sheet',
      details: buildDetails(),
      sections,
      fileName: `StandardCost_${data.order.order_no || 'sheet'}`,
    });
    setExportMenuOpen(false);
  };

  if(loading) return <div className="p-8 text-center text-gray-500">Loading standard cost sheet...</div>;
  if(!data) return <div className="p-8 text-center text-red-500">Production plan not found.</div>;
  return <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 bg-[#fafbfe] min-h-full">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-slate-800">Standard Cost Sheet</h1><span className={`px-3 py-1 rounded text-sm font-semibold border ${status==='Approved'?'bg-emerald-50 text-emerald-700 border-emerald-200':status==='Posted'?'bg-blue-50 text-blue-700 border-blue-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>{status}</span></div>
      <div className="flex gap-3">
        <div className="relative" ref={exportMenuRef}>
          <button onClick={()=>setExportMenuOpen(o=>!o)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50">
            <Download size={16}/>Export<ChevronDown size={14} className={`transition-transform ${exportMenuOpen?'rotate-180':''}`}/>
          </button>
          {exportMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-20 py-1">
              <button onClick={handleViewPdf} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Eye size={15}/>View PDF</button>
              <button onClick={handleDownloadPdf} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><FileText size={15}/>Download PDF</button>
              <button onClick={handleDownloadExcel} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><FileSpreadsheet size={15}/>Download Excel</button>
            </div>
          )}
        </div>
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
        <span className="text-xs font-normal text-slate-500">Stage-wise · classified by source · Cost/Piece based on each stage's qty</span>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-3 text-center w-10"></th><th className="p-3 text-left">Stage / Source</th><th className="p-3 text-left">Item Group</th><th className="p-3 text-left">Item Name</th><th className="p-3 text-left">UOM</th><th className="p-3 text-right">Actual Cost (₹)</th><th className="p-3 text-right">Cost/Piece (₹)</th></tr></thead><tbody>
      {stageTree.length===0
        ? <tr><td colSpan={7} className="p-6 text-center text-slate-400">No cost entries</td></tr>
        : stageTree.map((st,si)=>(
          <StageSourceRows
            key={st.stage.id ?? si}
            index={si+1}
            stageNode={st}
            stageCollapsed={!!collapsedStages[st.stage.process_stage]}
            onToggleStage={()=>toggleStage(st.stage.process_stage)}
            collapsedStageSources={collapsedStageSources}
            onToggleStageSource={toggleStageSource}
          />
        ))}
      </tbody><tfoot className="border-t-2 border-slate-300 bg-slate-50"><tr><td colSpan={5} className="p-3 text-right font-bold text-slate-700">Total</td><td className="p-3 text-right font-bold text-blue-800">{fmt(totals.amount)}</td><td className="p-3 text-right font-bold text-blue-800">—</td></tr></tfoot></table></div>
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
        <th className="p-3 text-left w-12"></th>
        <th className="p-3 text-left">Cost Component</th>
        <th className="p-3 text-right w-44">Actual Cost (₹)</th>
        <th className="p-3 text-right w-44">Cost/Piece (₹)</th>
        <th className="p-3 text-right w-44">Cost/Sqft (₹)</th>
      </tr></thead>
      <tbody>
        {summary.map((s,si)=><SummaryStageRows key={si} s={s}/>)}
      </tbody>
      <tfoot className="border-t-2 border-slate-300 bg-slate-50"><tr>
        <td colSpan={2} className="p-3 text-right font-bold text-slate-700">Grand Total (incl. rejection)</td>
        <td className="p-3 text-right font-bold text-blue-800">{fmt(grand.amt)}</td>
        <td className="p-3 text-right font-bold text-blue-800">—</td>
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
  // Label + Cost/Piece are based on the stage's PLANNED qty (matches the
  // Production Plan's "Plan Qty"), not the completed output qty. Cost/Sqft comes
  // from the backend (measurement Sq.Ft. basis) via cost_per_piece.
  const pieceQty = Number(s.planned_qty) || 0;
  const perPiece = (amt:number) => pieceQty > 0 ? amt / pieceQty : 0;
  const stageLabel = `${s.process_stage||'Stage'} - ${fmtQty(pieceQty)} ${s.uom||''}`;
  return <>
    <tr className="border-t border-slate-200 bg-slate-50/70"><td colSpan={5} className="p-2.5 font-bold text-slate-800">{stageLabel}</td></tr>
    {s.lines.map((ln,i)=><tr key={i} className="border-t border-slate-100">
      <td className="p-2.5"></td>
      <td className="p-2.5">{ln.label}</td>
      <td className="p-2.5 text-right">{fmt(ln.amount)}</td>
      <td className="p-2.5 text-right">{fmt(perPiece(ln.amount))}</td>
      <td className="p-2.5 text-right">{fmt(ln.cost_per_piece)}</td>
    </tr>)}
    <tr className="border-t border-slate-100 bg-slate-50/40">
      <td className="p-2.5"></td>
      <td className="p-2.5 font-semibold text-slate-600">Total</td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(s.total.amount)}</td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(perPiece(s.total.amount))}</td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(s.total.cost_per_piece)}</td>
    </tr>
    <tr className="border-t border-slate-100">
      <td className="p-2.5"></td>
      <td className="p-2.5 text-rose-700">Rejection {fmtQty(s.rejection.qty)} {s.uom||''}</td>
      <td className="p-2.5 text-right text-rose-700">{fmt(s.rejection.amount)}</td>
      <td className="p-2.5 text-right text-rose-700">{fmt(s.rejection.qty > 0 ? s.rejection.amount / s.rejection.qty : 0)}</td>
      <td className="p-2.5 text-right text-rose-700">{fmt(s.rejection.cost_per_piece)}</td>
    </tr>
    <tr className="border-t border-slate-100 bg-blue-50/40">
      <td className="p-2.5"></td>
      <td className="p-2.5 font-semibold text-blue-800">{s.process_stage} + Rejection</td>
      <td className="p-2.5 text-right font-semibold text-blue-800">{fmt(s.total_with_rejection.amount)}</td>
      <td className="p-2.5 text-right font-semibold text-blue-800">{fmt(perPiece(s.total_with_rejection.amount))}</td>
      <td className="p-2.5 text-right font-semibold text-blue-800">{fmt(s.total_with_rejection.cost_per_piece)}</td>
    </tr>
  </>;
}
// Nested accordion: one STAGE row that expands into its SOURCE sub-accordions
// (Material / Machine / General), each of which expands into its line items.
// Cost/Sq.Ft. is computed from the measurement qty, not the per-stage output.
type StageNode = { stage:Stage; sources:{ source:string; rows:CostRow[]; amount:number }[]; amount:number };
function StageSourceRows({
  index, stageNode, stageCollapsed, onToggleStage, collapsedStageSources, onToggleStageSource,
}:{
  index:number; stageNode:StageNode; stageCollapsed:boolean; onToggleStage:()=>void;
  collapsedStageSources:Record<string,boolean>; onToggleStageSource:(key:string)=>void;
}){
  const { stage } = stageNode;
  // Cost/Piece is based on THIS stage's own qty. When a stage has no qty
  // (e.g. Measurement = 0), its Cost/Piece is 0.
  const stageQty = Number(stage.order_qty) || 0;
  const perPiece=(amt:number)=> stageQty>0 ? amt/stageQty : 0;
  const stageLabel=`${stage.process_stage || 'Stage'} - ${fmtQty(stageQty)} ${stage.uom||''}`;
  return <>
    {/* Stage header (level 1 accordion) */}
    <tr className="border-t border-slate-200 bg-slate-100/80 cursor-pointer hover:bg-slate-200/70" onClick={onToggleStage}>
      <td className="p-2.5 text-center text-slate-600">{stageCollapsed ? <ChevronRight size={15}/> : <ChevronDown size={15}/>}</td>
      <td className="p-2.5 font-bold text-slate-800" colSpan={4}>{index}. {stageLabel}</td>
      <td className="p-2.5 text-right font-bold text-slate-800">{fmt(stageNode.amount)}</td>
      <td className="p-2.5 text-right font-bold text-slate-800">{fmt(perPiece(stageNode.amount))}</td>
    </tr>
    {!stageCollapsed && (stageNode.sources.length===0
      ? <tr className="border-t border-slate-100"><td></td><td colSpan={6} className="p-2.5 text-center text-slate-400">No cost entries for this stage</td></tr>
      : <>
          {stageNode.sources.map((g)=>{
            const key=`${stage.process_stage}::${g.source}`;
            const srcCollapsed=!!collapsedStageSources[key];
            return <SourceSubRows key={key} stageLabel={stage.process_stage} group={g} stageQty={stageQty} collapsed={srcCollapsed} onToggle={()=>onToggleStageSource(key)} />;
          })}
          {/* Stage total footer so the stage's cost is clearly labelled even when sources are expanded */}
          <tr className="border-t border-slate-200 bg-blue-50/50">
            <td className="p-2.5"></td>
            <td className="p-2.5 pl-8 text-right font-bold text-blue-800" colSpan={4}>{stage.process_stage || 'Stage'} Total</td>
            <td className="p-2.5 text-right font-bold text-blue-800">{fmt(stageNode.amount)}</td>
            <td className="p-2.5 text-right font-bold text-blue-800">{fmt(perPiece(stageNode.amount))}</td>
          </tr>
        </>)}
  </>;
}

// Source sub-accordion rendered inside a stage. Cost/Piece uses the stage qty.
function SourceSubRows({stageLabel,group,stageQty,collapsed,onToggle}:{stageLabel:string;group:{source:string;rows:CostRow[];amount:number};stageQty:number;collapsed:boolean;onToggle:()=>void}){
  const perPiece=(amt:number)=> stageQty>0 ? amt/stageQty : 0;
  return <>
    <tr className="border-t border-slate-100 bg-slate-50/70 cursor-pointer hover:bg-slate-100/70" onClick={onToggle}>
      <td className="p-2.5"></td>
      <td className="p-2.5 pl-8 font-semibold text-slate-700" colSpan={4}>
        <span className="inline-flex items-center gap-1.5">{collapsed ? <ChevronRight size={13}/> : <ChevronDown size={13}/>}{group.source} <span className="text-xs font-normal text-slate-500">({group.rows.length} item{group.rows.length!==1?'s':''})</span></span>
      </td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(group.amount)}</td>
      <td className="p-2.5 text-right font-semibold text-slate-700">{fmt(perPiece(group.amount))}</td>
    </tr>
    {!collapsed && group.rows.map((r,i)=><tr key={`${stageLabel}-${group.source}-${i}`} className="border-t border-slate-100">
      <td className="p-2.5"></td>
      <td className="p-2.5 pl-12 text-slate-500">{group.source}</td>
      <td className="p-2.5">{r.item_group||'—'}</td>
      <td className="p-2.5 font-medium">{r.item_name||r.cost_category||'—'}</td>
      <td className="p-2.5">{r.uom||'—'}</td>
      <td className="p-2.5 text-right">{fmt(r.actual_cost)}</td>
      <td className="p-2.5 text-right">{fmt(perPiece(Number(r.actual_cost)||0))}</td>
    </tr>)}
  </>;
}

function Field({label,children}:{label:string;children:ReactNode}){return <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>{children}</div>}
function Metric({label,value,tone}:{label:string;value:string;tone?:'green'|'amber'}){return <div className="p-3 border-r last:border-r-0 border-slate-200"><div className="text-xs font-semibold text-slate-600 mb-2">{label}</div><div className={`font-bold ${tone==='green'?'text-green-700':tone==='amber'?'text-amber-700':'text-slate-800'}`}>{value||'—'}</div></div>}
