import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Factory } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = {
  Posted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Cancelled: 'bg-rose-100 text-rose-600 border border-rose-200',
};

export default function MaterialIssueToBatch() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, posted: 0, draft: 0, total_value: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/material-issues/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

  const columns = [
    { key: 'issue_no', header: 'Issue No.', sortable: true, render: (row: any) => <span className="font-mono text-xs font-medium text-blue-700">{row.issue_no}</span> },
    { key: 'issue_date', header: 'Date', sortable: true, render: (row: any) => <span className="text-xs text-gray-600">{formatDate(row.issue_date)}</span> },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'production_batch', header: 'Batch', sortable: true },
    { key: 'warehouse_name', header: 'Warehouse', sortable: true },
    { key: 'grand_total', header: 'Amount', sortable: true, render: (row: any) => <span className="text-xs font-semibold">{formatCurrency(row.grand_total)}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[row.status] || ''}`}>{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', iconColor: 'from-blue-500 to-indigo-600' },
    { label: 'Posted', value: stats.posted, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200', iconColor: 'from-emerald-500 to-green-600' },
    { label: 'Draft', value: stats.draft, color: 'text-amber-900', bg: 'bg-amber-50 border-amber-200', iconColor: 'from-amber-500 to-orange-600' },
    { label: 'Total Value', value: formatCurrency(stats.total_value), color: 'text-purple-900', bg: 'bg-purple-50 border-purple-200', iconColor: 'from-purple-500 to-violet-600' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Posted', label: 'Posted' }, { value: 'Draft', label: 'Draft' }, { value: 'Cancelled', label: 'Cancelled' }] },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/material-issues/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Issue deleted!');
  };

  return (
    <TransactionListPage
      title="Material Issues"
      subtitle="Manage material issue to production batches"
      icon={<Factory size={20} className="text-white" />}
      iconColor="from-violet-600 to-purple-700"
      apiEndpoint="/material-issues"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="New Issue"
      onAdd={() => navigate('/material-issues/new')}
      onRowClick={(row) => navigate(`/material-issues/${row.id}`)}
      onEdit={(row) => navigate(`/material-issues/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Material Issue"
      deleteMessage="Are you sure? This will remove the material issue entry."
      searchPlaceholder="Search issues..."
      enableBulkDelete={true}
    />
  );
}
