import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Warehouse } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

const TYPE_COLORS: Record<string, string> = {
  'Raw Material': 'bg-blue-100 text-blue-700 border-blue-200',
  'Finished Goods': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Semi-Finished': 'bg-amber-100 text-amber-700 border-amber-200',
  'WIP': 'bg-violet-100 text-violet-700 border-violet-200',
  'Consumable': 'bg-teal-100 text-teal-700 border-teal-200',
  'Quarantine': 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function WarehouseMaster() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/warehouses/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (row: any) => <span className="font-mono text-xs text-blue-700">{row.code}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'warehouse_type', header: 'Type', sortable: true, render: (row: any) => <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${TYPE_COLORS[row.warehouse_type] || 'bg-gray-100 text-gray-700'}`}>{row.warehouse_type}</span> },
    { key: 'city', header: 'City', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', iconColor: 'from-blue-500 to-indigo-600' },
    { label: 'Active', value: stats.active, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200', iconColor: 'from-emerald-500 to-green-600' },
    { label: 'Inactive', value: stats.inactive, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200', iconColor: 'from-gray-400 to-gray-600' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
    { key: 'warehouse_type', label: 'Type', options: ['Raw Material', 'Finished Goods', 'Semi-Finished', 'WIP', 'Consumable', 'Quarantine'].map(t => ({ value: t, label: t })) },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/warehouses/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Warehouse deleted!');
  };

  return (
    <TransactionListPage
      title="Warehouses"
      subtitle="Manage warehouse locations and bins"
      icon={<Warehouse size={20} className="text-white" />}
      iconColor="from-indigo-600 to-purple-700"
      apiEndpoint="/warehouses"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="Add Warehouse"
      onAdd={() => navigate('/warehouse-master/new')}
      onRowClick={(row) => navigate(`/warehouse-master/${row.id}`)}
      onEdit={(row) => navigate(`/warehouse-master/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Warehouse"
      deleteMessage="Are you sure? This will remove the warehouse and all associated bins."
      searchPlaceholder="Search warehouses..."
      enableBulkDelete={true}
      defaultFilters={{ status: 'Active' }}
    />
  );
}
