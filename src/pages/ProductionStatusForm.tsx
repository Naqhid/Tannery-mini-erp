import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Trash2, Plus, RefreshCw, Pencil, Send,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import SearchableSelect from '../components/ui/SearchableSelect';

interface PlanOption { id: number; plan_no: string; plan_date: string; customer_name: string; article: string; color: string; }
interface ProcessStageOption { id: number; name: string; uom: string; }

interface OrderData {
  order_no: string;
  customer_name: string;
  customer_id: string;
  article: string;
  color: string;
  process_stage: string;
  issued_qty: string;
  completed_qty: string;
  balance_qty: string;
  uom: string;
  status: string;
  remarks: string;
  production_plan_id: string;
  plan_date: string;
  posted_at: string | null;
}

interface TransactionRow {
  id: number;
  transaction_no: string;
  production_date: string;
  opening_qty: number;
  input_qty: number;
  output_qty: number;
  rejection_qty: number;
  wip_qty: number;
  remarks: string;
}

interface TransactionSummary {
  total_opening_qty: number;
  total_input_qty: number;
  total_output_qty: number;
  total_rejection_qty: number;
  total_wip_qty: number;
}

export default function ProductionStatusForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState<OrderData>({
    order_no: '', customer_name: '', customer_id: '', article: '', color: '',
    process_stage: '', issued_qty: '0', completed_qty: '0', balance_qty: '0',
    uom: '', status: 'In-Process', remarks: '', production_plan_id: '', plan_date: '', posted_at: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dropdowns
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [processStages, setProcessStages] = useState<ProcessStageOption[]>([]);
  const [stageUom, setStageUom] = useState('');

  // Transactions state (only in edit mode)
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnSummary, setTxnSummary] = useState<TransactionSummary>({ total_opening_qty: 0, total_input_qty: 0, total_output_qty: 0, total_rejection_qty: 0, total_wip_qty: 0 });
  const [txnPage, setTxnPage] = useState(1);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnTotalPages, setTxnTotalPages] = useState(0);

  // Transaction form (inline add/edit)
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState<TransactionRow | null>(null);
  const [txnForm, setTxnForm] = useState({ production_date: new Date().toISOString().split('T')[0], opening_qty: '', input_qty: '', output_qty: '', rejection_qty: '', wip_qty: '', remarks: '' });
  const [txnSaving, setTxnSaving] = useState(false);
  const [deletingTxn, setDeletingTxn] = useState<TransactionRow | null>(null);

  const isPosted = !!form.posted_at;

  // Fetch dropdowns
  useEffect(() => {
    (async () => {
      try {
        const [plansRes, stagesRes] = await Promise.all([
          api<{ data: any[] }>('/production-plans?limit=500&sortBy=id&sortOrder=desc'),
          api<{ data: ProcessStageOption[] }>('/process-stages?limit=100'),
        ]);
        setPlans((plansRes.data || []).map((p: any) => ({
          id: p.id, plan_no: p.plan_no, plan_date: p.plan_date?.split('T')[0] || '',
          customer_name: p.customer_name || '', article: p.article || '', color: p.color || '',
        })));
        setProcessStages(stagesRes.data || []);
      } catch {}
    })();
  }, []);

  // Load order for edit
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api<{ data: any }>(`/production-status/orders/${id}`)
      .then(res => {
        const d = res.data;
        setForm({
          order_no: d.order_no || '',
          customer_name: d.customer_name || '',
          customer_id: String(d.customer_id || ''),
          article: d.article || '',
          color: d.color || '',
          process_stage: d.process_stage || '',
          issued_qty: String(d.issued_qty || 0),
          completed_qty: String(d.completed_qty || 0),
          balance_qty: String(d.balance_qty || 0),
          uom: d.uom || '',
          status: d.status || 'In-Process',
          remarks: d.remarks || '',
          production_plan_id: String(d.production_plan_id || ''),
          plan_date: d.plan_date?.split('T')[0] || '',
          posted_at: d.posted_at || null,
        });
        // Set UOM from process stage
        if (d.process_stage) {
          const ps = (processStages || []).find(s => s.name === d.process_stage);
          if (ps) setStageUom(ps.uom || '');
        }
      })
      .catch(() => toast.error('Failed to load record'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // Update stage UOM when process_stage or processStages changes
  useEffect(() => {
    if (form.process_stage && processStages.length > 0) {
      const ps = processStages.find(s => s.name === form.process_stage);
      setStageUom(ps?.uom || '');
    }
  }, [form.process_stage, processStages]);

  // Load transactions
  const fetchTransactions = useCallback(async () => {
    if (!isEdit) return;
    setTxnLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('production_status_order_id', id!);
      params.set('page', String(txnPage));
      params.set('limit', '10');
      const res = await api<{ data: TransactionRow[]; total: number; totalPages: number; summary: TransactionSummary }>(`/production-status/transactions?${params.toString()}`);
      setTransactions(res.data || []);
      setTxnTotal(res.total || 0);
      setTxnTotalPages(res.totalPages || 0);
      setTxnSummary(res.summary || { total_opening_qty: 0, total_input_qty: 0, total_output_qty: 0, total_rejection_qty: 0, total_wip_qty: 0 });
    } catch {
      setTransactions([]);
    } finally {
      setTxnLoading(false);
    }
  }, [id, isEdit, txnPage]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Handle Plan selection
  const handlePlanChange = (val: string) => {
    const plan = plans.find(p => String(p.id) === val);
    if (plan) {
      setForm(prev => ({
        ...prev,
        production_plan_id: val,
        order_no: plan.plan_no,
        plan_date: plan.plan_date,
        customer_name: plan.customer_name,
        article: plan.article,
        color: plan.color,
      }));
    } else {
      setForm(prev => ({ ...prev, production_plan_id: val }));
    }
  };

  // Handle Process Stage change
  const handleStageChange = (val: string) => {
    const ps = processStages.find(s => s.name === val);
    setForm(prev => ({ ...prev, process_stage: val, uom: ps?.uom || prev.uom }));
    setStageUom(ps?.uom || '');
  };

  const handleSave = async () => {
    if (!form.order_no && !form.article) { toast.error('Please select a Production Plan'); return; }
    setSaving(true);
    try {
      const payload = { ...form, production_plan_id: form.production_plan_id ? Number(form.production_plan_id) : null, customer_id: form.customer_id ? Number(form.customer_id) : null };
      if (isEdit) {
        await api(`/production-status/orders/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Record updated!');
        navigate('/production-status');
      } else {
        await api<{ data: { id: number } }>('/production-status/orders', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Record created!');
        navigate('/production-status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePost = async () => {
    if (isPosted) { toast.info('Already posted'); return; }
    setPosting(true);
    try {
      await api(`/production-status/orders/${id}/post`, { method: 'POST' });
      toast.success('Posted successfully!');
      setForm(prev => ({ ...prev, posted_at: new Date().toISOString(), status: 'Posted' }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api(`/production-status/orders/${id}`, { method: 'DELETE' });
      toast.success('Record deleted!');
      navigate('/production-status');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // Auto-calculate WIP
  const calcWip = (opening: string, input: string, output: string, rejection: string) => {
    const wip = (parseFloat(opening) || 0) + (parseFloat(input) || 0) - (parseFloat(output) || 0) - (parseFloat(rejection) || 0);
    return Math.max(0, wip).toFixed(2);
  };

  const updateTxnField = (field: string, value: string) => {
    setTxnForm(prev => {
      const updated = { ...prev, [field]: value };
      updated.wip_qty = calcWip(updated.opening_qty, updated.input_qty, updated.output_qty, updated.rejection_qty);
      return updated;
    });
  };

  // Transaction CRUD
  const openAddTxn = () => {
    setEditingTxn(null);
    // Default opening to 0; carry-forward logic will be handled when previous WIP exists
    const lastWip = Number(txnSummary.total_wip_qty) || 0;
    const newForm = { production_date: new Date().toISOString().split('T')[0], opening_qty: lastWip > 0 ? lastWip.toFixed(2) : '0', input_qty: '', output_qty: '', rejection_qty: '', wip_qty: '', remarks: '' };
    newForm.wip_qty = calcWip(newForm.opening_qty, newForm.input_qty, newForm.output_qty, newForm.rejection_qty);
    setTxnForm(newForm);
    setShowTxnForm(true);
  };

  const openEditTxn = (txn: TransactionRow) => {
    setEditingTxn(txn);
    const newForm = {
      production_date: txn.production_date?.split('T')[0] || '',
      opening_qty: String(txn.opening_qty || 0),
      input_qty: String(txn.input_qty || 0),
      output_qty: String(txn.output_qty || 0),
      rejection_qty: String(txn.rejection_qty || 0),
      wip_qty: String(txn.wip_qty || 0),
      remarks: txn.remarks || '',
    };
    newForm.wip_qty = calcWip(newForm.opening_qty, newForm.input_qty, newForm.output_qty, newForm.rejection_qty);
    setTxnForm(newForm);
    setShowTxnForm(true);
  };

  const handleSaveTxn = async () => {
    if (!txnForm.production_date) { toast.error('Production date is required'); return; }
    // Validation: Output + Rejection <= Opening + Input
    const opening = parseFloat(txnForm.opening_qty) || 0;
    const input = parseFloat(txnForm.input_qty) || 0;
    const output = parseFloat(txnForm.output_qty) || 0;
    const rejection = parseFloat(txnForm.rejection_qty) || 0;
    const available = opening + input;
    if (output > available) { toast.error(`Output Qty (${output.toFixed(2)}) cannot exceed available qty (${available.toFixed(2)})`); return; }
    if (output + rejection > available) { toast.error(`Output (${output.toFixed(2)}) + Rejection (${rejection.toFixed(2)}) cannot exceed available qty (${available.toFixed(2)})`); return; }
    setTxnSaving(true);
    try {
      if (editingTxn) {
        await api(`/production-status/transactions/${editingTxn.id}`, { method: 'PUT', body: JSON.stringify(txnForm) });
        toast.success('Transaction updated!');
      } else {
        await api('/production-status/transactions', {
          method: 'POST',
          body: JSON.stringify({ ...txnForm, production_status_order_id: Number(id) }),
        });
        toast.success('Transaction added!');
      }
      setShowTxnForm(false);
      fetchTransactions();
      // Reload order to get updated totals
      const res = await api<{ data: any }>(`/production-status/orders/${id}`);
      const d = res.data;
      setForm(prev => ({ ...prev, issued_qty: String(d.issued_qty || 0), completed_qty: String(d.completed_qty || 0), balance_qty: String(d.balance_qty || 0), status: d.status || prev.status }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to save transaction');
    } finally {
      setTxnSaving(false);
    }
  };

  const handleDeleteTxn = async () => {
    if (!deletingTxn) return;
    try {
      await api(`/production-status/transactions/${deletingTxn.id}`, { method: 'DELETE' });
      toast.success('Transaction deleted!');
      setDeletingTxn(null);
      fetchTransactions();
      // Reload order totals
      const res = await api<{ data: any }>(`/production-status/orders/${id}`);
      const d = res.data;
      setForm(prev => ({ ...prev, issued_qty: String(d.issued_qty || 0), completed_qty: String(d.completed_qty || 0), balance_qty: String(d.balance_qty || 0), status: d.status || prev.status }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const formatNumber = (n: number) => new Intl.NumberFormat('en-IN').format(n || 0);
  const formatDate = (d: string) => { if (!d) return '—'; return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
        <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-60 bg-gray-100 rounded-xl" /></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/production-status')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{isEdit ? 'Daily Production' : 'New Daily Production'}</h1>
          {isPosted && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">Posted</span>}
        </div>
        <div className="flex items-center gap-2">
          {isEdit && !isPosted && (
            <button onClick={handlePost} disabled={posting} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm">
              <Send size={14} /> {posting ? 'Posting...' : 'Post'}
            </button>
          )}
          {isEdit && !isPosted && (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 size={14} /> Delete
            </button>
          )}
          {!isPosted && (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
              <Save size={14} /> {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Order Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Production Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Number <span className="text-rose-500">*</span></label>
            <SearchableSelect
              options={plans.map(p => ({ value: String(p.id), label: `${p.plan_no} - ${p.article}` }))}
              value={form.production_plan_id}
              onChange={handlePlanChange}
              placeholder="Select Production Plan..."
              disabled={isPosted}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Date</label>
            <input type="date" value={form.plan_date} readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input type="text" value={form.customer_name} readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700" placeholder="From Plan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
            <input type="text" value={form.article} readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700" placeholder="From Plan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input type="text" value={form.color} readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700" placeholder="From Plan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process Stage</label>
            <select value={form.process_stage} onChange={e => handleStageChange(e.target.value)} disabled={isPosted}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50">
              <option value="">Select</option>
              {processStages.map(ps => <option key={ps.id} value={ps.name}>{ps.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
            <input type="text" value={stageUom || form.uom || '—'} readOnly
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} disabled={isPosted}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50">
              <option value="Pending">Pending</option>
              <option value="In-Process">In-Process</option>
              <option value="Completed">Completed</option>
              <option value="Posted">Posted</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} disabled={isPosted}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50" placeholder="Optional notes" />
          </div>
        </div>

        {/* KPIs (read-only, driven by transactions) */}
        {isEdit && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Input Qty</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{formatNumber(txnSummary.total_input_qty)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Output Qty</p>
              <p className="text-lg font-bold text-purple-700 mt-1">{formatNumber(txnSummary.total_output_qty)}</p>
            </div>
            <div className="text-center p-3 bg-rose-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Rejection Qty</p>
              <p className="text-lg font-bold text-rose-700 mt-1">{formatNumber(txnSummary.total_rejection_qty)}</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">WIP</p>
              <p className="text-lg font-bold text-amber-700 mt-1">{formatNumber(txnSummary.total_wip_qty)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Section (only in edit mode) */}
      {isEdit && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Transactions</h3>
            <div className="flex items-center gap-2">
              <button onClick={fetchTransactions} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <RefreshCw size={14} className={txnLoading ? 'animate-spin text-blue-600' : 'text-gray-500'} />
              </button>
              {!isPosted && (
                <button onClick={openAddTxn} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={12} /> Add Row
                </button>
              )}
            </div>
          </div>

          {/* Transaction Form (inline) */}
          {showTxnForm && !isPosted && (
            <div className="px-5 py-4 bg-blue-50/50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-3">{editingTxn ? 'Edit Transaction' : 'New Transaction'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" value={txnForm.production_date} onChange={e => updateTxnField('production_date', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Opening Qty</label>
                  <input type="number" step="0.01" value={txnForm.opening_qty} onChange={e => updateTxnField('opening_qty', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Input Qty</label>
                  <input type="number" step="0.01" value={txnForm.input_qty} onChange={e => updateTxnField('input_qty', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Output Qty</label>
                  <input type="number" step="0.01" value={txnForm.output_qty} onChange={e => updateTxnField('output_qty', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Rejection Qty</label>
                  <input type="number" step="0.01" value={txnForm.rejection_qty} onChange={e => updateTxnField('rejection_qty', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">WIP Qty</label>
                  <input type="number" step="0.01" value={txnForm.wip_qty} readOnly
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-amber-50 text-amber-800 font-semibold" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Remarks</label>
                  <input type="text" value={txnForm.remarks} onChange={e => setTxnForm({ ...txnForm, remarks: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="—" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setShowTxnForm(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveTxn} disabled={txnSaving} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {txnSaving ? 'Saving...' : editingTxn ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          {txnLoading ? (
            <div className="p-4"><div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded" />)}</div></div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No transactions yet. Click "Add Row" to create one.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Txn No.</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Opening</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Input</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Output</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">Rejection</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">WIP</th>
                      {!isPosted && <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((txn, idx) => (
                      <tr key={txn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                        <td className="px-4 py-2.5 text-gray-700">{formatDate(txn.production_date)}</td>
                        <td className="px-4 py-2.5 text-blue-700 font-mono font-medium">{txn.transaction_no}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatNumber(txn.opening_qty)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatNumber(txn.input_qty)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatNumber(txn.output_qty)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-rose-600">{formatNumber(txn.rejection_qty)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-amber-700">{formatNumber(txn.wip_qty)}</td>
                        {!isPosted && (
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => openEditTxn(txn)} className="p-1 rounded text-blue-600 hover:bg-blue-50" title="Edit"><Pencil size={13} /></button>
                              <button onClick={() => setDeletingTxn(txn)} className="p-1 rounded text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {/* Totals */}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="px-4 py-2.5 text-blue-700" colSpan={2}>Total</td>
                      <td className="px-4 py-2.5 text-blue-700 text-right tabular-nums">{formatNumber(txnSummary.total_opening_qty)}</td>
                      <td className="px-4 py-2.5 text-blue-700 text-right tabular-nums">{formatNumber(txnSummary.total_input_qty)}</td>
                      <td className="px-4 py-2.5 text-blue-700 text-right tabular-nums">{formatNumber(txnSummary.total_output_qty)}</td>
                      <td className="px-4 py-2.5 text-rose-700 text-right tabular-nums">{formatNumber(txnSummary.total_rejection_qty)}</td>
                      <td className="px-4 py-2.5 text-amber-700 text-right tabular-nums">{formatNumber(txnSummary.total_wip_qty)}</td>
                      {!isPosted && <td></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {txnTotal > 10 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50/50">
                  <p className="text-xs text-gray-500">Page {txnPage} of {txnTotalPages}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setTxnPage(1)} disabled={txnPage === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronsLeft size={12} /></button>
                    <button onClick={() => setTxnPage(p => Math.max(1, p - 1))} disabled={txnPage === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronLeft size={12} /></button>
                    <button onClick={() => setTxnPage(p => Math.min(txnTotalPages, p + 1))} disabled={txnPage === txnTotalPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronRight size={12} /></button>
                    <button onClick={() => setTxnPage(txnTotalPages)} disabled={txnPage === txnTotalPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronsRight size={12} /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete Order Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={20} className="text-red-600" /></div>
              <div><h3 className="text-lg font-bold text-gray-900">Delete Record</h3><p className="text-sm text-gray-500">This will also remove all transactions.</p></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation */}
      {deletingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeletingTxn(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={20} className="text-red-600" /></div>
              <div><h3 className="text-lg font-bold text-gray-900">Delete Transaction</h3><p className="text-sm text-gray-500">{deletingTxn.transaction_no}</p></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingTxn(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDeleteTxn} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
