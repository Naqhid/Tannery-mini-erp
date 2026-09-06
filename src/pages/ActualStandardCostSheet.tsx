import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';

type CostRow = { cost_group: string; cost_category: string; uom: string; actual_cost: number; cost_per_uom: number };
type Stage = { id:number; process_stage:string; uom:string; order_qty:number; completed_qty:number; balance_qty:number; rows:CostRow[] };
type Detail = { order:{ customer_name:string; article:string; color:string; order_no:string; uom:string; order_qty:number; completed_qty:number; balance_qty:number; production_plan_id?:number }; stages:Stage[] };

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
        total_cost_per_uom: totals.costPerUom,
      };
      await api('/standard-costs', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Standard Cost Sheet saved successfully!');
      navigate('/standard-costing');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };
  const user=JSON.parse(localStorage.getItem('tannery_user')||'{}');
  useEffect(()=>{
    const endpoint = planId ? `/costing-report/plan/${planId}/detail` : `/costing-report/${id}/detail`;
    api<{data:Detail}>(endpoint).then(r=>setData(r.data)).finally(()=>setLoading(false));
  },[id, planId]);
  const totals=useMemo(()=>{
    const rows=data?.stages.flatMap(s=>s.rows)||[];
    const amount=rows.reduce((a,r)=>a+Number(r.actual_cost||0),0);
    const out=data?.order.completed_qty||0;
    return {amount,costPerUom:out>0?amount/out:0};
  },[data]);
  if(loading) return <div className="p-8 text-center text-gray-500">Loading standard cost sheet...</div>;
  if(!data) return <div className="p-8 text-center text-red-500">Production plan not found.</div>;
  return <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 bg-[#fafbfe] min-h-full">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-slate-800">Standard Cost Sheet</h1><span className="px-3 py-1 rounded bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200">Draft</span></div>
      <div className="flex gap-3"><button onClick={()=>navigate('/standard-costing')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold"><X size={16}/>Cancel</button><button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"><Save size={16}/>{saving?'Saving...':'Save'}</button></div>
    </div>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h2 className="font-bold text-slate-700 mb-3">Standard Cost Sheet Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <Field label="Effective From *"><input type="date" value={effectiveFrom} onChange={e=>setEffectiveFrom(e.target.value)} className="field"/></Field>
        <Field label="Prepared By *"><input value={user?.name||user?.full_name||'Costing Dept.'} readOnly className="field bg-slate-50"/></Field>
        <Field label="Description / Note"><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Standard cost prepared for export orders..." className="field"/></Field>
        <Field label="Cost Sheet No."><input value="(Auto-generated)" readOnly className="field bg-slate-50"/></Field>
        <Field label="Currency"><select className="field" value={currency} onChange={e=>setCurrency(e.target.value)}><option>INR</option><option>USD</option><option>EUR</option></select></Field>
        <Field label="Status"><select className="field" value={status} onChange={e=>setStatus(e.target.value)}><option>Draft</option><option>Approved</option></select></Field>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 border border-slate-200 rounded-lg overflow-hidden">
        <Metric label="Customer" value={data.order.customer_name}/><Metric label="Article" value={data.order.article}/><Metric label="Color" value={data.order.color}/><Metric label="Order No." value={data.order.order_no}/><Metric label="Order Qty" value={`${fmtQty(data.order.order_qty)} ${data.order.uom||''}`}/><Metric label="Completed Qty" value={`${fmtQty(data.order.completed_qty)} ${data.order.uom||''}`} tone="green"/><Metric label="Balance Qty" value={`${fmtQty(data.order.balance_qty)} ${data.order.uom||''}`} tone="amber"/>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 font-bold text-slate-700">Cost Details</div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-700"><tr><th className="p-3 text-center w-16">#</th><th className="p-3 text-left">Cost Group</th><th className="p-3 text-left">Cost Category</th><th className="p-3 text-left">UOM</th><th className="p-3 text-right">Amount (INR)</th><th className="p-3 text-right">Cost/UOM (INR)</th></tr></thead><tbody>
      {data.stages.map((stage,si)=><StageRows key={stage.id} stage={stage} index={si+1}/>)}</tbody><tfoot className="border-t-2 border-slate-300 bg-slate-50"><tr><td></td><td colSpan={2} className="p-3 text-right font-bold text-slate-700">Total</td><td className="p-3 text-center">-</td><td className="p-3 text-right font-bold text-blue-800">{fmt(totals.amount)}</td><td className="p-3 text-right font-bold text-blue-800">{fmt(totals.costPerUom)}</td></tr></tfoot></table></div>
    </div>
  </div>;
}
function Field({label,children}:{label:string;children:ReactNode}){return <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>{children}</div>}
function Metric({label,value,tone}:{label:string;value:string;tone?:'green'|'amber'}){return <div className="p-3 border-r last:border-r-0 border-slate-200"><div className="text-xs font-semibold text-slate-600 mb-2">{label}</div><div className={`font-bold ${tone==='green'?'text-green-700':tone==='amber'?'text-amber-700':'text-slate-800'}`}>{value||'—'}</div></div>}
function StageRows({stage,index}:{stage:Stage;index:number}){const planned=stage.order_qty||0; const label=`${stage.process_stage || 'Stage'} - ${fmtQty(planned)} ${stage.uom||''}`; if(!stage.rows.length)return <tr><td className="p-3 text-center font-bold">{index}</td><td className="p-3 font-bold">{label}</td><td colSpan={4} className="p-3 text-center text-slate-400">No cost entries</td></tr>; return <>{stage.rows.map((r,i)=><tr key={`${stage.id}-${i}`} className="border-t border-slate-100"><td className="p-2.5 text-center">{i===0?index:`${index}.${i}`}</td><td className="p-2.5 font-medium">{i===0?label:r.cost_group}</td><td className="p-2.5">{r.cost_category}</td><td className="p-2.5">{r.uom||stage.uom||'—'}</td><td className="p-2.5 text-right">{fmt(r.actual_cost)}</td><td className="p-2.5 text-right">{fmt(r.cost_per_uom)}</td></tr>)}</>}
