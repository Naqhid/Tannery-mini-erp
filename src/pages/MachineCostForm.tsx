import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Trash2, Printer, Download, Send, Save, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { usePermission } from '../lib/usePermission';
import api from '../lib/api';

interface CostItem { id?: number; machine_name: string; uom: string; amount: number; cost_per_piece: number; remarks: string; }

interface MachineCostData {
  id?: number; transaction_no: string; production_plan_id: number; production_date: string; process_stage: string;
  total_amount: number; total_cost_per_piece: number; cost_after_adjustments: number; status: string; remarks: string;
  customer_name: string; order_no: string; article: string; color: string; order_qty: number; planned_qty: number; output_qty: number; completed_qty: number;
  production_qty: number; balance_qty: number; plan_status: string; uom: string; created_by_name: string; created_at: string; items: CostItem[];
}

export default function MachineCostForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const { canWrite } = usePermission();

  const [formData, setFormData] = useState<MachineCostData>({
    transaction_no: '', production_plan_id: 0, production_date: new Date().toISOString().split('T')[0],
    process_stage: 'All', total_amount: 0, total_cost_per_piece: 0, cost_after_adjustments: 0,
    status: 'Pending', remarks: '', customer_name: '', order_no: '', article: '', color: '',
    order_qty: 0, planned_qty: 0, output_qty: 0, completed_qty: 0, production_qty: 0, balance_qty: 0, plan_status: '', uom: 'Pcs',
    created_by_name: '', created_at: '', items: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPostConfirm, setShowPostConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const isPosted = formData.status === 'Posted';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!isNew && id) {
          const res = await api<{ data: MachineCostData }>(`/machine-costs/${id}`);
          setFormData(res.data);
        } else if (planId) {
          const [planRes, noRes] = await Promise.all([
            api<{ data: any }>(`/production-status/orders/${planId}`),
            api<{ data: { transaction_no: string } }>('/machine-costs/next-no'),
          ]);
          const plan = planRes.data;
          setFormData(prev => ({ ...prev, production_plan_id: Number(planId), transaction_no: noRes.data.transaction_no,
            customer_name: plan.customer_name || '', order_no: plan.order_no || '',
            article: plan.article || '', color: plan.color || '', order_qty: plan.issued_qty || 0,
            planned_qty: plan.issued_qty || 0, output_qty: plan.completed_qty || 0,
            completed_qty: plan.completed_qty || 0, balance_qty: plan.balance_qty || Math.max(0, (plan.issued_qty || 0) - (plan.completed_qty || 0)),
            plan_status: plan.status || '', process_stage: plan.process_stage || 'All', uom: plan.uom || 'Pcs',
          }));
        }
      } catch { toast.error('Failed to load data'); } finally { setLoading(false); }
    };
    loadData();
  }, [id, isNew, planId]);

  useEffect(() => {
    if (!formData.production_plan_id || !formData.production_date) return;
    api<{ data: { planned_qty: number; output_qty: number } }>(`/production-status/orders/${formData.production_plan_id}/date-summary?date=${formData.production_date}`)
      .then((res) => setFormData((prev) => ({
        ...prev,
        planned_qty: Number(res.data.planned_qty || 0),
        output_qty: Number(res.data.output_qty || 0),
      })))
      .catch(() => {});
  }, [formData.production_plan_id, formData.production_date]);

  const recalculate = useCallback((items: CostItem[]) => {
    const totalAmount = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalCostPerPiece = items.reduce((sum, i) => sum + (Number(i.cost_per_piece) || 0), 0);
    setFormData(prev => ({ ...prev, items, total_amount: totalAmount, total_cost_per_piece: totalCostPerPiece, cost_after_adjustments: totalCostPerPiece }));
  }, []);

  const addLine = () => recalculate([...formData.items, { machine_name: '', uom: 'Sq.Ft.', amount: 0, cost_per_piece: 0, remarks: '' }]);
  const removeLine = (index: number) => recalculate(formData.items.filter((_, i) => i !== index));
  const updateLine = (index: number, field: keyof CostItem, value: string | number) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'amount') {
      const divideBy = formData.production_qty || formData.order_qty || 1;
      items[index].cost_per_piece = Number((Number(value) / divideBy).toFixed(2));
    }
    recalculate(items);
  };

  const handleSave = async () => {
    if (!formData.production_plan_id) { toast.error('No production plan linked'); return; }
    if (formData.items.length === 0) { toast.error('Add at least one machine'); return; }
    setSaving(true);
    try {
      const payload = { production_plan_id: formData.production_plan_id, production_date: formData.production_date,
        process_stage: formData.process_stage, cost_after_adjustments: formData.cost_after_adjustments,
        order_qty: formData.order_qty, production_qty: formData.production_qty, remarks: formData.remarks,
        items: formData.items.map(i => ({ machine_name: i.machine_name, uom: i.uom, amount: i.amount, cost_per_piece: i.cost_per_piece, remarks: i.remarks })),
      };
      if (isNew) {
        const res = await api<{ data: any; message: string }>('/machine-costs', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message);
      } else {
        const res = await api<{ data: any; message: string }>(`/machine-costs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message);
      }
      navigate('/machine-cost', { replace: true });
    } catch (err) { toast.error((err as Error).message || 'Save failed'); } finally { setSaving(false); }
  };

  const handlePost = async () => {
    setShowPostConfirm(false);
    try {
      const res = await api<{ message: string }>(`/machine-costs/${id}/post`, { method: 'POST', body: '{}' });
      toast.success(res.message);
      navigate('/machine-cost', { replace: true });
    } catch (err) { toast.error((err as Error).message || 'Post failed'); }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatDateTime = (d: string) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

  if (loading) return <div className="p-4 md:p-6 max-w-[1200px] mx-auto"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-44 bg-gray-100 rounded-xl" /><div className="h-64 bg-gray-100 rounded-xl" /></div></div>;

  const statusColor = formData.plan_status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : formData.plan_status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/machine-cost')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"><ArrowLeft size={20} className="text-gray-600" /></button>
          <div><h1 className="text-xl md:text-2xl font-bold text-gray-900">Machine Cost</h1><p className="text-xs md:text-sm text-gray-500">Capture machine cost components per Pc for the selected order.</p></div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"><Printer size={14} /> <span className="hidden sm:inline">Print</span></button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"><Download size={14} /> <span className="hidden sm:inline">Export</span> <ChevronDown size={12} /></button>
            {showExportMenu && <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1"><button onClick={() => setShowExportMenu(false)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Export as PDF</button><button onClick={() => setShowExportMenu(false)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Export as Excel</button></div>}
          </div>
          {!isPosted && canWrite && !isNew && <button onClick={() => setShowPostConfirm(true)} className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/20"><Send size={14} /> Post</button>}
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 mb-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4 mb-4 pb-4 border-b border-gray-100">
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Production Date</label>{isPosted ? <span className="text-xs md:text-sm font-medium text-gray-900">{formatDate(formData.production_date)}</span> : <input type="date" value={formData.production_date} onChange={e => setFormData(prev => ({ ...prev, production_date: e.target.value }))} className="w-full px-2 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500" />}</div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Transaction No.</label><p className="text-xs md:text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 truncate">{formData.transaction_no || 'Auto'}</p></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Customer</label><p className="text-xs md:text-sm font-medium text-gray-900 truncate">{formData.customer_name || '—'}</p></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Order No.</label><p className="text-xs md:text-sm font-mono font-medium text-blue-700 truncate">{formData.order_no || '—'}</p></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Article</label><p className="text-xs md:text-sm text-gray-900 truncate">{formData.article || '—'}</p></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Color</label><p className="text-xs md:text-sm text-gray-900">{formData.color || '—'}</p></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-3">
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Planned Qty (Pcs)</label><p className="text-sm md:text-base font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.planned_qty || formData.order_qty)}</p></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Output Qty</label><p className="text-sm md:text-base font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.output_qty || 0)}</p></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Completed Qty</label><p className="text-sm md:text-base font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.completed_qty)}</p></div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Production Qty (Pcs)</label>
            {isPosted ? (
              <p className="text-sm md:text-base font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.production_qty || 0)}</p>
            ) : (
              <input type="number" value={formData.production_qty || ''} onChange={e => {
                const prodQty = Number(e.target.value) || 0;
                const maxQty = formData.planned_qty || formData.order_qty || 9999999;
                if (prodQty > maxQty) { toast.error('Production qty cannot exceed planned qty'); return; }
                setFormData(prev => ({ ...prev, production_qty: prodQty, balance_qty: Math.max(0, (prev.planned_qty || prev.order_qty) - (prev.completed_qty + prodQty)) }));
              }} placeholder="0" className="w-full px-2 py-1.5 text-xs md:text-sm border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 tabular-nums font-semibold" />
            )}
          </div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Balance Qty</label><p className={`text-sm md:text-base font-bold tabular-nums ${formData.balance_qty > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{new Intl.NumberFormat('en-IN').format(formData.balance_qty)}</p></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Status</label><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-semibold border ${statusColor}`}>{formData.plan_status || '—'}</span></div>
          <div><label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Process Stage</label>{isPosted ? <p className="text-xs md:text-sm font-medium text-gray-900">{formData.process_stage}</p> : <select value={formData.process_stage} onChange={e => setFormData(prev => ({ ...prev, process_stage: e.target.value }))} className="w-full px-2 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"><option value="All">All</option><option value="Wet End">Wet End</option><option value="Crust">Crust</option><option value="Finishing">Finishing</option><option value="Packing">Packing</option></select>}</div>
        </div>
      </div>

      {/* Machine Cost Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-sm md:text-base font-bold text-gray-900">Machine Cost (Per Pc)</h2>
          {!isPosted && canWrite && <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"><Plus size={14} /> Add Line</button>}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase min-w-[200px]">Machine Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-32">UOM</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-40">Amount (INR)</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-44">Machine Cost (Per Pc) (INR)</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase min-w-[180px]">Remarks</th>
              {!isPosted && canWrite && <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-16">Action</th>}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {formData.items.length === 0 ? (
                <tr><td colSpan={isPosted ? 6 : 7} className="px-4 py-12 text-center"><div className="text-gray-400"><Plus size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No machines added</p><p className="text-xs mt-0.5">Click "+ Add Line" to start.</p></div></td></tr>
              ) : formData.items.map((item, idx) => (
                <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/30`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">{isPosted ? <span className="text-sm font-medium text-gray-900">{item.machine_name}</span> : <input type="text" value={item.machine_name} onChange={e => updateLine(idx, 'machine_name', e.target.value)} placeholder="e.g. Clicking Press Machine" className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />}</td>
                  <td className="px-4 py-3">{isPosted ? <span className="text-sm text-gray-700">{item.uom}</span> : <select value={item.uom} onChange={e => updateLine(idx, 'uom', e.target.value)} className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"><option value="Sq.Ft.">Sq.Ft.</option><option value="Per Order">Per Order</option><option value="Per Piece">Per Piece</option><option value="Per Hour">Per Hour</option></select>}</td>
                  <td className="px-4 py-3">{isPosted ? <span className="text-sm font-semibold text-gray-900 block text-right tabular-nums">{formatCurrency(item.amount)}</span> : <input type="number" step="0.01" value={item.amount || ''} onChange={e => updateLine(idx, 'amount', Number(e.target.value))} placeholder="0.00" className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500 bg-white tabular-nums" />}</td>
                  <td className="px-4 py-3">{isPosted ? <span className="text-sm font-semibold text-gray-900 block text-right tabular-nums">{formatCurrency(item.cost_per_piece)}</span> : <input type="number" step="0.01" value={item.cost_per_piece || ''} onChange={e => updateLine(idx, 'cost_per_piece', Number(e.target.value))} placeholder="0.00" className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500 bg-white tabular-nums" />}</td>
                  <td className="px-4 py-3">{isPosted ? <span className="text-sm text-gray-600">{item.remarks || '—'}</span> : <input type="text" value={item.remarks} onChange={e => updateLine(idx, 'remarks', e.target.value)} placeholder="Optional" className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />}</td>
                  {!isPosted && canWrite && <td className="px-4 py-3 text-center"><button onClick={() => removeLine(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {formData.items.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-400"><Plus size={28} className="mx-auto mb-2 opacity-40" /><p className="text-sm font-medium">No machines added</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {formData.items.map((item, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">{idx + 1}</span>
                    {!isPosted && canWrite && <button onClick={() => removeLine(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>}
                  </div>
                  <div className="space-y-3">
                    <div><label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Machine Name</label>{isPosted ? <p className="text-sm font-medium text-gray-900">{item.machine_name}</p> : <input type="text" value={item.machine_name} onChange={e => updateLine(idx, 'machine_name', e.target.value)} placeholder="e.g. Clicking Press" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white" />}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">UOM</label>{isPosted ? <p className="text-sm text-gray-700">{item.uom}</p> : <select value={item.uom} onChange={e => updateLine(idx, 'uom', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"><option value="Sq.Ft.">Sq.Ft.</option><option value="Per Order">Per Order</option><option value="Per Piece">Per Piece</option><option value="Per Hour">Per Hour</option></select>}</div>
                      <div><label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Amount (INR)</label>{isPosted ? <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(item.amount)}</p> : <input type="number" step="0.01" value={item.amount || ''} onChange={e => updateLine(idx, 'amount', Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-right bg-white tabular-nums" />}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Cost/Pc (INR)</label>{isPosted ? <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(item.cost_per_piece)}</p> : <input type="number" step="0.01" value={item.cost_per_piece || ''} onChange={e => updateLine(idx, 'cost_per_piece', Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-right bg-white tabular-nums" />}</div>
                      <div><label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Remarks</label>{isPosted ? <p className="text-sm text-gray-600">{item.remarks || '—'}</p> : <input type="text" value={item.remarks} onChange={e => updateLine(idx, 'remarks', e.target.value)} placeholder="Optional" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white" />}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Summary */}
        {formData.items.length > 0 && (
          <div className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 md:px-5 py-4 md:py-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3 md:mb-4">Cost Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase mb-1">Total Amount (INR)</p><p className="text-base md:text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(formData.total_amount)}</p></div>
              <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase mb-1">Total Machine Cost/Pc (INR)</p><p className="text-base md:text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(formData.total_cost_per_piece)}</p></div>
              <div className="bg-white border border-gray-200 rounded-lg p-3"><p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase mb-1">Order Qty (Pcs)</p><p className="text-base md:text-xl font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.order_qty)}</p></div>
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-3"><p className="text-[10px] md:text-[11px] font-semibold text-emerald-600 uppercase mb-1">Machine Cost (Per Pc) After Adjustments (INR)</p><p className="text-lg md:text-2xl font-bold text-emerald-700 tabular-nums">{formatCurrency(formData.cost_after_adjustments)}</p></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-5 py-3 border-t border-gray-200 bg-gray-50/50 text-[10px] md:text-[11px] text-gray-400 gap-1">
          <p>Note: All costs are standard rates. Actual cost may vary based on production performance.</p>
          <div className="flex gap-4">
            {formData.created_by_name && <span>By: <span className="text-gray-600 font-medium">{formData.created_by_name}</span></span>}
            {formData.created_at && <span>On: <span className="text-gray-600 font-medium">{formatDateTime(formData.created_at)}</span></span>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-5">
        <button onClick={() => navigate('/machine-cost')} className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
        {!isPosted && canWrite && <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 md:px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm shadow-blue-600/20"><Save size={15} />{saving ? 'Saving...' : 'Save & Return'}</button>}
      </div>

      <ConfirmDialog open={showPostConfirm} title="Post Machine Cost" message="Once posted, this entry cannot be edited. Are you sure?" confirmLabel="Post" onConfirm={handlePost} onCancel={() => setShowPostConfirm(false)} />
    </div>
  );
}
