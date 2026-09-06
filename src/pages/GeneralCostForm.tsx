import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Trash2, Printer, Download, Send, Save, ChevronDown } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { usePermission } from '../lib/usePermission';
import SearchableSelect from '../components/ui/SearchableSelect';
import api from '../lib/api';

interface CostItem {
  id?: number;
  cost_category: string;
  cost_category_id: number;
  group_name: string;
  uom: string;
  amount: number;
  cost_per_piece: number;
  remarks: string;
}

interface GeneralCostData {
  id?: number;
  transaction_no: string;
  production_plan_id: number;
  production_date: string;
  process_stage: string;
  total_amount: number;
  total_cost_per_piece: number;
  cost_after_adjustments: number;
  status: string;
  remarks: string;
  customer_name: string;
  order_no: string;
  article: string;
  color: string;
  order_qty: number;
  planned_qty: number;
  output_qty: number;
  production_qty: number;
  completed_qty: number;
  balance_qty: number;
  plan_status: string;
  uom: string;
  created_by_name: string;
  created_at: string;
  items: CostItem[];
}

interface CostComponentOption {
  id: number;
  name: string;
  uom: string;
  primary_uom_name: string;
  rate: number;
  group_name: string;
}

export default function GeneralCostForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const { canWrite } = usePermission();

  const [formData, setFormData] = useState<GeneralCostData>({
    transaction_no: '',
    production_plan_id: 0,
    production_date: new Date().toISOString().split('T')[0],
    process_stage: 'All',
    total_amount: 0,
    total_cost_per_piece: 0,
    cost_after_adjustments: 0,
    status: 'Pending',
    remarks: '',
    customer_name: '',
    order_no: '',
    article: '',
    color: '',
    order_qty: 0,
    planned_qty: 0,
    output_qty: 0,
    production_qty: 0,
    completed_qty: 0,
    balance_qty: 0,
    plan_status: '',
    uom: 'Pcs',
    created_by_name: '',
    created_at: '',
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPostConfirm, setShowPostConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [costComponents, setCostComponents] = useState<CostComponentOption[]>([]);
  const [processStages, setProcessStages] = useState<{ id: number; name: string }[]>([]);
  const isPosted = formData.status === 'Posted';

  // Fetch cost component options (materials with category = 'Cost Component')
  useEffect(() => {
    api<{ data: any[] }>('/materials?limit=500&category=Cost Component')
      .then(res => setCostComponents((res.data || []).map((m: any) => ({ id: m.id, name: m.name, uom: m.uom || m.primary_uom_name || '', primary_uom_name: m.uom || m.primary_uom_name || '', rate: Number(m.rate || m.last_purchase_price || m.standard_cost || 0), group_name: m.group_name || m.chemical_group || '' }))))
      .catch(() => {});
  }, []);

  // Fetch process stages for the Process Stage dropdown
  useEffect(() => {
    api<{ data: { id: number; name: string }[] }>('/process-stages/dropdown')
      .then(res => setProcessStages(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!isNew && id) {
          const res = await api<{ data: GeneralCostData }>(`/general-costs/${id}`);
          const data = res.data;
          // Normalize production_date: strip time portion so <input type="date"> renders correctly
          if (data.production_date) {
            data.production_date = data.production_date.toString().split('T')[0];
          }
          setFormData(data);
        } else if (planId) {
          const [planRes, noRes] = await Promise.all([
            api<{ data: any }>(`/production-status/orders/${planId}`),
            api<{ data: { transaction_no: string } }>('/general-costs/next-no'),
          ]);
          const plan = planRes.data;
          setFormData(prev => ({
            ...prev,
            production_plan_id: Number(planId),
            transaction_no: noRes.data.transaction_no,
            customer_name: plan.customer_name || '',
            order_no: plan.order_no || '',
            article: plan.article || '',
            color: plan.color || '',
            order_qty: plan.issued_qty || 0,
            planned_qty: plan.issued_qty || 0,
            output_qty: plan.completed_qty || 0,
            completed_qty: plan.completed_qty || 0,
            balance_qty: plan.balance_qty || Math.max(0, (plan.issued_qty || 0) - (plan.completed_qty || 0)),
            plan_status: plan.status || '',
            process_stage: plan.process_stage || 'All',
            uom: plan.uom || 'Pcs',
          }));
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isNew, planId]);

  // Back-fill cost_category_id on existing items (items loaded from DB only have
  // the string name, not the FK id). This must react to BOTH costComponents and
  // the items loading, since the order of the two async loads is not guaranteed.
  useEffect(() => {
    if (!costComponents.length || !formData.items.length) return;
    setFormData(prev => {
      let changed = false;
      const items = prev.items.map(item => {
        if (item.cost_category_id) return item; // already resolved
        const match = costComponents.find(c => c.name === item.cost_category);
        if (match) { changed = true; return { ...item, cost_category_id: match.id, group_name: item.group_name || match.group_name || '' }; }
        return item;
      });
      return changed ? { ...prev, items } : prev;
    });
  }, [costComponents, formData.items]);

  useEffect(() => {
    if (!formData.production_plan_id) return;
    // Fetch total output from Daily Production (all dates combined)
    api<{ data: any }>(`/production-status/orders/${formData.production_plan_id}`)
      .then((res) => {
        const d = res.data;
        if (d) {
          const outputQty = Number(d.completed_qty || 0);
          const plannedQty = formData.order_qty || formData.planned_qty || 0;
          setFormData((prev) => ({
            ...prev,
            output_qty: outputQty,
            balance_qty: Math.max(0, (prev.order_qty || prev.planned_qty) - outputQty),
          }));
        }
      })
      .catch(() => {});
  }, [formData.production_plan_id]);

  const recalculate = useCallback((items: CostItem[]) => {
    const totalAmount = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalCostPerPiece = items.reduce((sum, i) => sum + (Number(i.cost_per_piece) || 0), 0);
    setFormData(prev => ({
      ...prev,
      items,
      total_amount: totalAmount,
      total_cost_per_piece: totalCostPerPiece,
      cost_after_adjustments: totalCostPerPiece,
    }));
  }, []);

  const addLine = () => {
    const newItem: CostItem = { cost_category: '', cost_category_id: 0, group_name: '', uom: 'Sq.Ft.', amount: 0, cost_per_piece: 0, remarks: '' };
    recalculate([...formData.items, newItem]);
  };

  const removeLine = (index: number) => {
    recalculate(formData.items.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof CostItem, value: string | number) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };

    // When cost_category_id changes, auto-populate name, UOM, and amount from rate
    if (field === 'cost_category_id') {
      const comp = costComponents.find(c => c.id === Number(value));
      if (comp) {
        items[index].cost_category = comp.name;
        items[index].group_name = comp.group_name || '';
        items[index].uom = comp.primary_uom_name || comp.uom || 'Sq.Ft.';
        items[index].amount = comp.rate || 0;
        const divideBy = formData.output_qty || formData.planned_qty || 1;
        items[index].cost_per_piece = divideBy > 0 ? Number((items[index].amount / divideBy).toFixed(2)) : 0;
      }
    }

    // cost_per_piece = amount / output_qty
    if (field === 'amount') {
      const divideBy = formData.output_qty || formData.planned_qty || 1;
      items[index].cost_per_piece = divideBy > 0 ? Number((Number(value) / divideBy).toFixed(2)) : 0;
    }

    recalculate(items);
  };

  const handleSave = async () => {
    if (!formData.production_plan_id) {
      toast.error('No production plan linked');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Add at least one cost component');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        production_plan_id: formData.production_plan_id,
        production_date: formData.production_date,
        process_stage: formData.process_stage,
        cost_after_adjustments: formData.cost_after_adjustments,
        order_qty: formData.order_qty,
        planned_qty: formData.planned_qty,
        production_qty: formData.production_qty,
        remarks: formData.remarks,
        items: formData.items.map(i => ({
          cost_category: i.cost_category,
          uom: i.uom,
          amount: i.amount,
          cost_per_piece: i.cost_per_piece,
          remarks: i.remarks,
        })),
      };

      if (isNew) {
        const res = await api<{ data: any; message: string }>('/general-costs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success(res.message);
        navigate('/general-cost', { replace: true });
      } else {
        const res = await api<{ data: any; message: string }>(`/general-costs/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success(res.message);
        navigate('/general-cost', { replace: true });
      }
    } catch (err) {
      toast.error((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePost = async () => {
    setShowPostConfirm(false);
    try {
      const res = await api<{ message: string }>(`/general-costs/${id}/post`, { method: 'POST', body: '{}' });
      toast.success(res.message);
      navigate('/general-cost', { replace: true });
    } catch (err) {
      toast.error((err as Error).message || 'Post failed');
    }
  };

  const handlePrint = () => window.print();

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatDateTime = (d: string) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-44 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const statusColor = formData.plan_status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : formData.plan_status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/general-cost')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 shrink-0">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">General Cost</h1>
            <p className="text-xs md:text-sm text-gray-500">Capture general cost components per Pc for the selected order.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Printer size={14} /> <span className="hidden sm:inline">Print</span>
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Download size={14} /> <span className="hidden sm:inline">Export</span> <ChevronDown size={12} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                <button onClick={() => setShowExportMenu(false)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Export as PDF</button>
                <button onClick={() => setShowExportMenu(false)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Export as Excel</button>
              </div>
            )}
          </div>
          {!isPosted && canWrite && !isNew && (
            <button onClick={() => setShowPostConfirm(true)} className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
              <Send size={14} /> Post
            </button>
          )}
        </div>
      </div>

      {/* Header Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 mb-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4 mb-4 pb-4 border-b border-gray-100">
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Production Date</label>
            {isPosted ? (
              <span className="text-xs md:text-sm font-medium text-gray-900">{formatDate(formData.production_date)}</span>
            ) : (
              <input
                type="date"
                value={formData.production_date}
                onChange={e => setFormData(prev => ({ ...prev, production_date: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
              />
            )}
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Transaction No.</label>
            <p className="text-xs md:text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 truncate">{formData.transaction_no || 'Auto'}</p>
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Customer</label>
            <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{formData.customer_name || '—'}</p>
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Order No.</label>
            <p className="text-xs md:text-sm font-mono font-medium text-blue-700 truncate">{formData.order_no || '—'}</p>
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Article</label>
            <p className="text-xs md:text-sm text-gray-900 truncate">{formData.article || '—'}</p>
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Color</label>
            <p className="text-xs md:text-sm text-gray-900">{formData.color || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4">
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Process Stage</label>
            {isPosted ? (
              <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{formData.process_stage || 'All'}</p>
            ) : (
              <select
                value={formData.process_stage || 'All'}
                onChange={e => setFormData(prev => ({ ...prev, process_stage: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs md:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
              >
                <option value="All">All</option>
                {formData.process_stage && formData.process_stage !== 'All' && !processStages.some(s => s.name === formData.process_stage) && (
                  <option value={formData.process_stage}>{formData.process_stage}</option>
                )}
                {processStages.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Planned Qty (Pcs)</label>
            <p className="text-sm md:text-base font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.planned_qty || formData.order_qty)}</p>
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Output Qty</label>
            <p className="text-sm md:text-base font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.output_qty || 0)}</p>
          </div>
          <div>
            <label className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Balance Qty</label>
            <p className={`text-sm md:text-base font-bold tabular-nums ${(formData.planned_qty - formData.output_qty) > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
              {new Intl.NumberFormat('en-IN').format(Math.max(0, formData.planned_qty - formData.output_qty))}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Components */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-sm md:text-base font-bold text-gray-900">Cost Components (Per Pc)</h2>
          {!isPosted && canWrite && (
            <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
              <Plus size={14} /> Add Line
            </button>
          )}
        </div>

        {/* Desktop Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Group</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Cost Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">UOM</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Amount (INR)</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Cost / Piece (INR)</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[180px]">Remarks</th>
                {!isPosted && canWrite && <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.items.length === 0 ? (
                <tr>
                  <td colSpan={isPosted ? 7 : 8} className="px-4 py-12 text-center">
                    <div className="text-gray-400">
                      <Plus size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium">No cost components added</p>
                      <p className="text-xs mt-0.5">Click "+ Add Line" to start adding cost components.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                formData.items.map((item, idx) => (
                  <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/30`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{item.group_name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isPosted ? (
                        <span className="text-sm font-medium text-gray-900">{item.cost_category}</span>
                      ) : (
                        <SearchableSelect
                          options={[{ value: '', label: 'Select Cost Component' }, ...costComponents.map(c => ({ value: String(c.id), label: c.name }))]}
                          value={item.cost_category_id ? String(item.cost_category_id) : ''}
                          onChange={val => updateLine(idx, 'cost_category_id', Number(val))}
                          placeholder="Search cost category..."
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{item.uom || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isPosted ? <span className="text-sm font-semibold text-gray-900 block text-right tabular-nums">{formatCurrency(item.amount)}</span> : (
                        <input type="number" step="0.01" value={item.amount || ''} onChange={e => updateLine(idx, 'amount', Number(e.target.value))} placeholder="0.00"
                          className="w-24 px-2 py-2 text-sm border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white tabular-nums" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isPosted ? <span className="text-sm font-semibold text-gray-900 block text-right tabular-nums">{formatCurrency(item.cost_per_piece)}</span> : (
                        <input type="number" step="0.01" value={item.cost_per_piece || ''} onChange={e => updateLine(idx, 'cost_per_piece', Number(e.target.value))} placeholder="0.00"
                          className="w-24 px-2 py-2 text-sm border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white tabular-nums" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isPosted ? <span className="text-sm text-gray-600">{item.remarks || '—'}</span> : (
                        <input type="text" value={item.remarks} onChange={e => updateLine(idx, 'remarks', e.target.value)} placeholder="Optional"
                          className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                      )}
                    </td>
                    {!isPosted && canWrite && (
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeLine(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Remove line">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View for Cost Items */}
        <div className="md:hidden">
          {formData.items.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-400">
              <Plus size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No cost components added</p>
              <p className="text-xs mt-0.5">Tap "+ Add Line" to start.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {formData.items.map((item, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">{idx + 1}</span>
                    {!isPosted && canWrite && (
                      <button onClick={() => removeLine(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Group</label>
                      <p className="text-sm text-gray-700">{item.group_name || '—'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Cost Category</label>
                      {isPosted ? (
                        <p className="text-sm font-medium text-gray-900">{item.cost_category}</p>
                      ) : (
                        <SearchableSelect
                          options={[{ value: '', label: 'Select Cost Component' }, ...costComponents.map(c => ({ value: String(c.id), label: c.name }))]}
                          value={item.cost_category_id ? String(item.cost_category_id) : ''}
                          onChange={val => updateLine(idx, 'cost_category_id', Number(val))}
                          placeholder="Search cost category..."
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">UOM</label>
                        <p className="text-sm text-gray-700">{item.uom || '—'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Amount (INR)</label>
                        {isPosted ? <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(item.amount)}</p> : (
                          <input type="number" step="0.01" value={item.amount || ''} onChange={e => updateLine(idx, 'amount', Number(e.target.value))} placeholder="0.00"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500 bg-white tabular-nums" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Cost / Piece (INR)</label>
                        {isPosted ? <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(item.cost_per_piece)}</p> : (
                          <input type="number" step="0.01" value={item.cost_per_piece || ''} onChange={e => updateLine(idx, 'cost_per_piece', Number(e.target.value))} placeholder="0.00"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500 bg-white tabular-nums" />
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Remarks</label>
                        {isPosted ? <p className="text-sm text-gray-600">{item.remarks || '—'}</p> : (
                          <input type="text" value={item.remarks} onChange={e => updateLine(idx, 'remarks', e.target.value)} placeholder="Optional"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
                        )}
                      </div>
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
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Amount (INR)</p>
                <p className="text-base md:text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(formData.total_amount)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Cost / Piece (INR)</p>
                <p className="text-base md:text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(formData.total_cost_per_piece)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Order Qty (Pcs)</p>
                <p className="text-base md:text-xl font-bold text-gray-900 tabular-nums">{new Intl.NumberFormat('en-IN').format(formData.order_qty)}</p>
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-3">
                <p className="text-[10px] md:text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">After Adjustments (INR)</p>
                <p className="text-lg md:text-2xl font-bold text-emerald-700 tabular-nums">{formatCurrency(formData.cost_after_adjustments)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-5 py-3 border-t border-gray-200 bg-gray-50/50 text-[10px] md:text-[11px] text-gray-400 gap-1">
          <p>Note: All costs are standard rates. Actual cost may vary.</p>
          <div className="flex gap-4">
            {formData.created_by_name && <span>By: <span className="text-gray-600 font-medium">{formData.created_by_name}</span></span>}
            {formData.created_at && <span>On: <span className="text-gray-600 font-medium">{formatDateTime(formData.created_at)}</span></span>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-5">
        <button onClick={() => navigate('/general-cost')} className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        {!isPosted && canWrite && (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 md:px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20 transition-all">
            <Save size={15} />
            {saving ? 'Saving...' : 'Save & Return'}
          </button>
        )}
      </div>

      {/* Post Confirm Dialog */}
      <ConfirmDialog
        open={showPostConfirm}
        title="Post General Cost"
        message="Once posted, this entry cannot be edited. Are you sure you want to post?"
        confirmLabel="Post"
        onConfirm={handlePost}
        onCancel={() => setShowPostConfirm(false)}
      />
    </div>
  );
}
