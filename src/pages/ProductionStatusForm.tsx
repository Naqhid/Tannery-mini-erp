import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Trash2, Plus, RefreshCw, Pencil,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';

interface OrderData {
  order_no: string;
  customer_name: string;
  article: string;
  color: string;
  process_stage: string;
  issued_qty: string;
  completed_qty: string;
  balance_qty: string;
  uom: string;
  status: string;
  remarks: string;
}

interface TransactionRow {
  id: number;
  transaction_no: string;
  production_date: string;
  opening_qty: number;
  input_qty: number;
  output_qty: number;
  wip_qty: number;
  remarks: string;
}

interface TransactionSummary {
  total_opening_qty: number;
  total_input_qty: number;
  total_output_qty: number;
  total_wip_qty: number;
}

export default function ProductionStatusForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState<OrderData>({
    order_no: '', customer_name: '', article: '', color: '',
    process_stage: '', issued_qty: '0', completed_qty: '0', balance_qty: '0',
    uom: 'Pcs', status: 'In-Process', remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Transactions state (only in edit mode)
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnSummary, setTxnSummary] = useState<TransactionSummary>({ total_opening_qty: 0, total_input_qty: 0, total_output_qty: 0, total_wip_qty: 0 });
  const [txnPage, setTxnPage] = useState(1);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnTotalPages, setTxnTotalPages] = useState(0);

  // Transaction form (inline add/edit)
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState<TransactionRow | null>(null);
  const [txnForm, setTxnForm] = useState({ production_date: new Date().toISOString().split('T')[0], opening_qty: '', input_qty: '', output_qty: '', wip_qty: '', remarks: '' });
  const [txnSaving, setTxnSaving] = useState(false);
  const [deletingTxn, setDeletingTxn] = useState<TransactionRow | null>(null);

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
          article: d.article || '',
          color: d.color || '',
          process_stage: d.process_stage || '',
          issued_qty: String(d.issued_qty || 0),
          completed_qty: String(d.completed_qty || 0),
          balance_qty: String(d.balance_qty || 0),
          uom: d.uom || 'Pcs',
          status: d.status || 'In-Process',
          remarks: d.remarks || '',
        });
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

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
      setTxnSummary(res.summary || { total_opening_qty: 0, total_input_qty: 0, total_output_qty: 0, total_wip_qty: 0 });
    } catch {
      setTransactions([]);
    } finally {
      setTxnLoading(false);
    }
  }, [id, isEdit, txnPage]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleSave = async () => {
    if (!form.order_no && !form.article) { toast.error('Order No or Article is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await api(`/production-status/orders/${id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Order updated!');
        navigate('/production-status');
      } else {
        const res = await api<{ data: { id: number } }>('/production-status/orders', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Order created!');
        navigate('/production-status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api(`/production-status/orders/${id}`, { method: 'DELETE' });
      toast.success('Order deleted!');
      navigate('/production-status');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // Transaction CRUD
  const openAddTxn = () => {
    setEditingTxn(null);
    setTxnForm({ production_date: new Date().toISOString().split('T')[0], opening_qty: '', input_qty: '', output_qty: '', wip_qty: '', remarks: '' });
    setShowTxnForm(true);
  };

  const openEditTxn = (txn: TransactionRow) => {
    setEditingTxn(txn);
    setTxnForm({
      production_date: txn.production_date?.split('T')[0] || '',
      opening_qty: String(txn.opening_qty || 0),
      input_qty: String(txn.input_qty || 0),
      output_qty: String(txn.output_qty || 0),
      wip_qty: String(txn.wip_qty || 0),
      remarks: txn.remarks || '',
    });
    setShowTxnForm(true);
  };

  const handleSaveTxn = async () => {
    if (!txnForm.production_date) { toast.error('Production date is required'); return; }
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{isEdit ? 'Edit Order' : 'New Order'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            <Save size={14} /> {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      {/* Order Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order No.</label>
            <input type="text" value={form.order_no} onChange={e => setForm({ ...form, order_no: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SO-25-00045" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input type="text" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Customer name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
            <input type="text" value={form.article} onChange={e => setForm({ ...form, article: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Finished Leather A101" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input type="text" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process Stage</label>
            <select value={form.process_stage} onChange={e => setForm({ ...form, process_stage: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select</option>
              <option value="Wet End">Wet End</option>
              <option value="Finishing">Finishing</option>
              <option value="Packing">Packing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="Pending">Pending</option>
              <option value="In-Process">In-Process</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Optional notes" />
          </div>
        </div>

        {/* KPIs (read-only, driven by transactions) */}
        {isEdit && (
          <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-gray-100">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Issued-Qty (Pcs)</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{formatNumber(Number(form.issued_qty))}</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Completed-Qty (Pcs)</p>
              <p className="text-lg font-bold text-emerald-700 mt-1">{formatNumber(Number(form.completed_qty))}</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Balance-Qty (Pcs)</p>
              <p className="text-lg font-bold text-amber-700 mt-1">{formatNumber(Number(form.balance_qty))}</p>
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
              <button onClick={openAddTxn} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={12} /> Add Row
              </button>
            </div>
          </div>

          {/* Transaction Form (inline) */}
          {showTxnForm && (
            <div className="px-5 py-4 bg-blue-50/50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-3">{editingTxn ? 'Edit Transaction' : 'New Transaction'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" value={txnForm.production_date} onChange={e => setTxnForm({ ...txnForm, production_date: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Opening Qty</label>
                  <input type="number" value={txnForm.opening_qty} onChange={e => setTxnForm({ ...txnForm, opening_qty: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Input Qty</label>
                  <input type="number" value={txnForm.input_qty} onChange={e => setTxnForm({ ...txnForm, input_qty: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Output Qty</label>
                  <input type="number" value={txnForm.output_qty} onChange={e => setTxnForm({ ...txnForm, output_qty: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">WIP Qty</label>
                  <input type="number" value={txnForm.wip_qty} onChange={e => setTxnForm({ ...txnForm, wip_qty: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" placeholder="0" />
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
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase">WIP</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
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
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatNumber(txn.wip_qty)}</td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEditTxn(txn)} className="p-1 rounded text-blue-600 hover:bg-blue-50" title="Edit"><Pencil size={13} /></button>
                            <button onClick={() => setDeletingTxn(txn)} className="p-1 rounded text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Totals */}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="px-4 py-2.5 text-blue-700" colSpan={2}>Total</td>
                      <td className="px-4 py-2.5 text-blue-700 text-right tabular-nums">{formatNumber(txnSummary.total_opening_qty)}</td>
                      <td className="px-4 py-2.5 text-blue-700 text-right tabular-nums">{formatNumber(txnSummary.total_input_qty)}</td>
                      <td className="px-4 py-2.5 text-blue-700 text-right tabular-nums">{formatNumber(txnSummary.total_output_qty)}</td>
                      <td className="px-4 py-2.5 text-blue-700 text-right tabular-nums">{formatNumber(txnSummary.total_wip_qty)}</td>
                      <td></td>
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
              <div><h3 className="text-lg font-bold text-gray-900">Delete Order</h3><p className="text-sm text-gray-500">This will also remove all transactions.</p></div>
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
