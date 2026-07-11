import { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

export default function UsersPage() {
  const [stats, setStats] = useState({ total: 0, active: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: any[] }>('/users?limit=1000');
      const users = res.data || [];
      setStats({ total: users.length, active: users.filter((u: any) => u.status === 'Active').length });
    } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const columns = [
    { key: 'username', header: 'Username', sortable: true, render: (row: any) => <span className="font-mono text-xs font-medium text-blue-700">{row.username}</span> },
    { key: 'full_name', header: 'Full Name', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.full_name}</span> },
    { key: 'email', header: 'Email', sortable: true, render: (row: any) => <span className="text-xs text-gray-600">{row.email}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
        {row.status}
      </span>
    )},
  ];

  const statCards = [
    { label: 'Total Users', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', iconColor: 'from-blue-500 to-indigo-600' },
    { label: 'Active', value: stats.active, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200', iconColor: 'from-emerald-500 to-green-600' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/users/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'User deleted!');
  };

  return (
    <TransactionListPage
      title="Users"
      subtitle="Manage system users and access"
      icon={<Users size={20} className="text-white" />}
      iconColor="from-blue-600 to-indigo-700"
      apiEndpoint="/users"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="Add User"
      onDelete={handleDelete}
      deleteTitle="Delete User"
      deleteMessage="Are you sure you want to delete this user?"
      searchPlaceholder="Search users..."
      enableBulkDelete={false}
    />
  );
}
