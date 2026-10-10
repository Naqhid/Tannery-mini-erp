import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageMinus } from 'lucide-react';
import { toast } from 'react-toastify';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';

interface DeliveryRow {
  id: number;
  outbound_no: string;
  outbound_date: string;
  from_warehouse_name: string;
  supplier_name: string;
  total_qty: number;
  total_amount: number;
  status: string;
}

interface DeliveryStats { total: number; posted: number; draft: number; total_value: number; }
const STATUS_COLORS: Record<string, string> = {
  Posted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Cancelled: 'bg-rose-100 text-rose-600 border border-rose-200',
};

export default function OutboundDelivery() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DeliveryStats>({ total: 0, posted: 0, draft: 0, total_value: 0 });
  const fetchStats = useCallback(async () => {
    try { const response = await api<{ data: DeliveryStats }>('/outbound-deliveries/stats'); setStats(response.data); }
    catch { /* stats are supplementary to the list */ }
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);
  const columns = [
    { key: 'outbound_no', header: 'Outbound No.', sortable: true, render: (row: DeliveryRow) => <span className="font-mono text-xs font-medium text-blue-700">{row.outbound_no}</span> },
    { key: 'outbound_date', header: 'Outbound Date', sortable: true, render: (row: DeliveryRow) => <span className="text-xs text-gray-600">{formatDate(row.outbound_date)}</span> },
    { key: 'from_warehouse_name', header: 'From Warehouse', sortable: true },
    { key: 'supplier_name', header: 'Supplier', sortable: true },
    { key: 'total_qty', header: 'Total Qty', sortable: true, render: (row: DeliveryRow) => <span className="text-xs">{Number(row.total_qty || 0).toLocaleString('en-IN')}</span> },
    { key: 'total_amount', header: 'Amount', sortable: true, render: (row: DeliveryRow) => <span className="text-xs font-semibold">{formatCurrency(row.total_amount)}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (row: DeliveryRow) => <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[row.status] || ''}`}>{row.status}</span> },
  ];
  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', iconColor: 'from-blue-500 to-indigo-600' },
    { label: 'Posted', value: stats.posted, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200', iconColor: 'from-emerald-500 to-green-600' },
    { label: 'Draft', value: stats.draft, color: 'text-amber-900', bg: 'bg-amber-50 border-amber-200', iconColor: 'from-amber-500 to-orange-600' },
    { label: 'Total Value', value: formatCurrency(stats.total_value), color: 'text-purple-900', bg: 'bg-purple-50 border-purple-200', iconColor: 'from-purple-500 to-violet-600' },
  ];
  const handleDelete = async (id: number) => {
    const response = await api<{ message: string }>(`/outbound-deliveries/${id}`, { method: 'DELETE' });
    toast.success(response.message || 'Outbound delivery deleted; stock restored.');
  };

  return <TransactionListPage
    title="Outbound Delivery"
    subtitle="Return materials from a warehouse to a supplier"
    icon={<PackageMinus size={20} className="text-white" />}
    iconColor="from-orange-500 to-rose-600"
    apiEndpoint="/outbound-deliveries"
    columns={columns}
    statCards={statCards}
    filterOptions={[{ key: 'status', label: 'Status', options: [{ value: 'Posted', label: 'Posted' }, { value: 'Draft', label: 'Draft' }] }]}
    addButtonLabel="New Outbound Delivery"
    onAdd={() => navigate('/outbound-delivery/new')}
    onRowClick={(row: DeliveryRow) => navigate(`/outbound-delivery/${row.id}`)}
    onEdit={(row: DeliveryRow) => navigate(`/outbound-delivery/${row.id}`)}
    onDelete={handleDelete}
    deleteTitle="Delete Outbound Delivery"
    deleteMessage="This will remove the outbound delivery and restore its stock to the source warehouse."
    searchPlaceholder="Search outbound deliveries..."
    enableBulkDelete={true}
    enableBulkStatus={true}
  />;
}
