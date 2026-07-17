import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Edit2, Trash2 } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Confirmed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Processing: 'bg-blue-100 text-blue-700 border border-blue-200',
  Shipped: 'bg-violet-100 text-violet-700 border border-violet-200',
  Delivered: 'bg-teal-100 text-teal-700 border border-teal-200',
  Cancelled: 'bg-rose-100 text-rose-600 border border-rose-200',
};

export default function SalesOrder() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, draft: 0, confirmed: 0, delivered: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: typeof stats }>('/sales-orders/stats');
      setStats(res.data);
    } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

  const columns = [
    { key: 'order_no', header: 'Order No.', sortable: true, render: (row: any) => <span className="font-mono text-xs font-medium text-blue-700">{row.order_no}</span> },
    { key: 'customer_name', header: 'Customer', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.customer_name}</span> },
    { key: 'order_date', header: 'Order Date', sortable: true, render: (row: any) => <span className="text-xs text-gray-600">{formatDate(row.order_date)}</span> },
    { key: 'delivery_date', header: 'Delivery Date', sortable: true, render: (row: any) => <span className="text-xs text-gray-600">{formatDate(row.delivery_date)}</span> },
    { key: 'total_quantity', header: 'Quantity', sortable: false, render: (row: any) => <span className="text-xs font-semibold text-gray-900">{parseFloat(row.total_quantity || 0).toLocaleString('en-IN')}</span> },
    { key: 'grand_total', header: 'Amount', sortable: true, render: (row: any) => <span className="text-xs font-semibold text-gray-900">{formatCurrency(row.grand_total)}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[row.status] || ''}`}>{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total Orders', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', iconColor: 'from-blue-500 to-indigo-600' },
    { label: 'Draft', value: stats.draft, color: 'text-amber-900', bg: 'bg-amber-50 border-amber-200', iconColor: 'from-amber-500 to-orange-600' },
    { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200', iconColor: 'from-emerald-500 to-green-600' },
    { label: 'Delivered', value: stats.delivered, color: 'text-purple-900', bg: 'bg-purple-50 border-purple-200', iconColor: 'from-purple-500 to-violet-600' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: ['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => ({ value: s, label: s })) },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/sales-orders/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Sales order deleted!');
  };

  return (
    <TransactionListPage
      title="Sales Orders"
      subtitle="Manage all customer sales orders"
      icon={<FileText size={20} className="text-white" />}
      iconColor="from-blue-600 to-indigo-700"
      apiEndpoint="/sales-orders"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="New Sales Order"
      onAdd={() => navigate('/sales-orders/new')}
      onRowClick={(row) => navigate(`/sales-orders/${row.id}`)}
      onEdit={(row) => navigate(`/sales-orders/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Sales Order"
      deleteMessage="Are you sure? All items and attachments will be removed."
      searchPlaceholder="Search orders, customer..."
      enableBulkDelete={true}
    />
  );
}
