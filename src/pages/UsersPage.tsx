import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, X } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';

interface UserForm {
  username: string;
  password: string;
  confirm_password: string;
  full_name: string;
  email: string;
  role_id: string;
  status: string;
}

interface Role {
  id: number;
  code: string;
  name: string;
}

const emptyForm: UserForm = { username: '', password: '', confirm_password: '', full_name: '', email: '', role_id: '', status: 'Active' };

export default function UsersPage() {
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: any[] }>('/users?limit=1000');
      const users = res.data || [];
      setStats({ total: users.length, active: users.filter((u: any) => u.status === 'Active').length });
    } catch {}
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api<{ data: Role[] }>('/roles/dropdown');
      setRoles(res.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); fetchRoles(); }, [fetchStats, fetchRoles, refreshKey]);

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (row: any) => {
    setEditingUser(row);
    setForm({
      username: row.username || '',
      password: '',
      confirm_password: '',
      full_name: row.full_name || '',
      email: row.email || '',
      role_id: String(row.role_id || ''),
      status: row.status || 'Active',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.username.trim() || !form.full_name.trim()) {
      toast.error('Username and Full Name are required');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      toast.error('Password is required for new users');
      return;
    }
    if (form.password && form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const body: any = { ...form, role_id: form.role_id ? Number(form.role_id) : null };
        delete body.confirm_password;
        if (!body.password) delete body.password;
        await api(`/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast.success('User updated successfully!');
      } else {
        const { confirm_password, ...rest } = form;
        const payload = { ...rest, role_id: form.role_id ? Number(form.role_id) : null };
        await api('/users', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('User created successfully!');
      }
      setShowModal(false);
      setRefreshKey(k => k + 1);
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

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
    fetchStats();
  };

  return (
    <>
      <TransactionListPage
        key={refreshKey}
        title="Users"
        subtitle="Manage system users and access"
        icon={<Users size={20} className="text-white" />}
        iconColor="from-blue-600 to-indigo-700"
        apiEndpoint="/users"
        columns={columns}
        statCards={statCards}
        filterOptions={filterOptions}
        addButtonLabel="Add User"
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={handleDelete}
        deleteTitle="Delete User"
        deleteMessage="Are you sure you want to delete this user?"
        searchPlaceholder="Search users..."
        enableBulkDelete={false}
      />

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-bold text-gray-900">{editingUser ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="Enter username"
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={form.role_id}
                  onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r.id} value={String(r.id)}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password {!editingUser && <span className="text-red-500">*</span>}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password {!editingUser && <span className="text-red-500">*</span>}</label>
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${form.password && form.confirm_password && form.password !== form.confirm_password ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                  placeholder="Re-enter password"
                />
                {form.password && form.confirm_password && form.password !== form.confirm_password && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:pointer-events-none">
                {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
