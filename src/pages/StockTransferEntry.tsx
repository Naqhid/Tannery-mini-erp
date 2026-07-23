import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = {
  Posted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Cancelled: 'bg-rose-100 text-rose-600 border border-rose-200',
};

export default function StockTransferEntry() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, posted: 0, draft: 0, total_value: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/stock-transfers/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

  const columns = [
    { key: 'transfer_no', header: 'Transfer No.', sortable: true, render: (row: any) => <span className="font-mono text-xs font-medium text-blue-700">{row.transfer_no}</span> },
    { key: 'transfer_date', header: 'Date', sortable: true, render: (row: any) => <span className="text-xs text-gray-600">{formatDate(row.transfer_date)}</span> },
    { key: 'from_warehouse_name', header: 'From', sortable: true },
    { key: 'to_warehouse_name', header: 'To', sortable: true },
    { key: 'total_amount', header: 'Amount', sortable: true, render: (row: any) => <span className="text-xs font-semibold">{formatCurrency(row.total_amount)}</span> },
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
    const res = await api(`/stock-transfers/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Transfer deleted!');
  };

  return (
    <TransactionListPage
      title="Stock Transfers"
      subtitle="Manage inter-warehouse stock transfers"
      icon={<ArrowLeftRight size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/stock-transfers"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="New Transfer"
      onAdd={() => navigate('/stock-transfer/new')}
      onRowClick={(row) => navigate(`/stock-transfer/${row.id}`)}
      onEdit={(row) => navigate(`/stock-transfer/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Stock Transfer"
      deleteMessage="Are you sure? This will remove the stock transfer entry."
      searchPlaceholder="Search transfers..."
      enableBulkDelete={true}
    />
  );
}
