import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

export default function CustomerMaster() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/customers/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (row: any) => <span className="font-mono text-xs text-indigo-700">{row.code}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'contact_person', header: 'Contact Person', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'city', header: 'City', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-indigo-900', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Active', value: stats.active, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Inactive', value: stats.inactive, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
    { key: 'category', label: 'Category', options: [{ value: 'domestic', label: 'Domestic' }, { value: 'international', label: 'International' }] },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/customers/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Customer deleted!');
  };

  return (
    <TransactionListPage
      title="Customers"
      subtitle="Manage your customer database"
      icon={<Users size={20} className="text-white" />}
      iconColor="from-indigo-500 to-purple-600"
      apiEndpoint="/customers"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="Add Customer"
      onAdd={() => navigate('/customer-master/new')}
      onRowClick={(row) => navigate(`/customer-master/${row.id}`)}
      onEdit={(row) => navigate(`/customer-master/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Customer"
      deleteMessage="Are you sure? This will remove the customer record."
      searchPlaceholder="Search customers..."
      enableBulkDelete={true}
      defaultFilters={{ status: 'Active' }}
    />
  );
}
