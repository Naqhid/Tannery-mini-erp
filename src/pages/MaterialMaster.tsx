import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { FlaskConical } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

const TYPE_COLORS: Record<string, string> = {
  'Wet-end': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Finishing': 'bg-green-50 text-green-700 border border-green-200',
};

export default function MaterialMaster() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/materials/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (row: any) => <span className="font-mono text-xs text-blue-700">{row.code}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'type', header: 'Type', sortable: true, render: (row: any) => <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLORS[row.type] || 'bg-gray-100 text-gray-600'}`}>{row.type}</span> },
    { key: 'preferred_supplier_name', header: 'Supplier', sortable: false, render: (row: any) => <span className="text-gray-700">{row.preferred_supplier_name || '—'}</span> },
    { key: 'current_stock', header: 'Quantity', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.current_stock != null ? Number(row.current_stock).toLocaleString() : '0'}</span> },
    { key: 'last_purchase_price', header: 'Rate', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.last_purchase_price ? `₹${Number(row.last_purchase_price).toLocaleString()}` : '—'}</span> },
    { key: 'uom', header: 'UOM', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Active', value: stats.active, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Inactive', value: stats.inactive, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
    { key: 'type', label: 'Type', options: [{ value: 'Wet-end', label: 'Wet-end' }, { value: 'Finishing', label: 'Finishing' }] },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/materials/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Material deleted!');
  };

  return (
    <TransactionListPage
      title="Chemical / Material"
      subtitle="Manage all chemicals, auxiliaries and packing materials"
      icon={<FlaskConical size={20} className="text-white" />}
      iconColor="from-blue-600 to-indigo-700"
      apiEndpoint="/materials"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="Add Material"
      onAdd={() => navigate('/chemical-master/new')}
      onRowClick={(row) => navigate(`/chemical-master/${row.id}`)}
      onEdit={(row) => navigate(`/chemical-master/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Material"
      deleteMessage="Are you sure? This will remove the material record."
      searchPlaceholder="Search materials..."
      enableBulkDelete={true}
    />
  );
}
