import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Users,
  Key,
  Shield,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { exportToExcel } from '../lib/excelExport';
import api from '../lib/api';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role_id: number;
  company_id: number;
  business_unit_id: number;
  status: string;
  last_login: string;
  created_at: string;
}

interface Role {
  id: number;
  code: string;
  name: string;
}

interface Company {
  id: number;
  code: string;
  name: string;
}

interface BusinessUnit {
  id: number;
  code: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role_id: '',
    company_id: '',
    business_unit_id: '',
    status: 'Active',
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) {
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
      }
      const res = await api<{ data: User[]; total: number; page: number; totalPages: number }>(`/users?${params.toString()}`);
      setUsers(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, pageSize, sortBy, sortOrder]);

  const fetchDropdowns = async () => {
    try {
      const [rolesRes, companiesRes] = await Promise.all([
        api<{ data: Role[] }>('/roles/dropdown'),
        api<{ data: Company[] }>('/companies/dropdown'),
      ]);
      setRoles(rolesRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch {}
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchDropdowns(); }, []);

  const openPanel = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: '',
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id || '',
        company_id: user.company_id || '',
        business_unit_id: user.business_unit_id || '',
        status: user.status,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        role_id: '',
        company_id: '',
        business_unit_id: '',
        status: 'Active',
      });
    }
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.full_name) {
      toast.error('Username and Full Name are required');
      return;
    }
    if (!selectedUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };
      if (selectedUser?.id && !payload.password) {
        delete payload.password;
      }
      if (selectedUser?.id) {
        const res = await api(`/users/${selectedUser.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'User updated successfully!');
      } else {
        const res = await api('/users', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'User created successfully!');
      }
      setShowPanel(false);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to save user: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api(`/users/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'User deleted successfully!');
      setShowPanel(false);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user: ' + (err as Error).message);
    }
  };

  const handleExportExcel = () => {
    exportToExcel({
      data: users,
      columns: [
        { key: 'username', header: 'Username' },
        { key: 'full_name', header: 'Full Name' },
        { key: 'email', header: 'Email' },
        { key: 'status', header: 'Status' },
      ],
      fileName: 'Users',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200/50">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Users</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage system users</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
            <span className="text-xs text-blue-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-blue-800">{totalRecords}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden ring-1 ring-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
              />
            </div>
          </div>
          <button onClick={handleExportExcel} className="p-2 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-all">
            Export Excel
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add User
          </button>
        </div>

        {/* Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-blue-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase">Username</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase">Full Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-indigo-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No users found</td></tr>
              ) : users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`hover:bg-blue-50/50 transition-all cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  onClick={() => openPanel(user)}
                >
                  <td className="py-3 px-4 font-mono text-indigo-600 text-xs font-medium">{user.username}</td>
                  <td className="py-3 px-4">{user.full_name}</td>
                  <td className="py-3 px-4 text-gray-500">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      user.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(user); }} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, id: user.id }); }} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-blue-100/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <p className="text-xs text-indigo-400 font-medium">
            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-white text-indigo-300 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg hover:bg-white text-indigo-300 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <Key size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedUser ? 'Edit User' : 'New User'}</h2>
                      <p className="text-[11px] text-indigo-500 font-medium mt-0.5">{selectedUser ? selectedUser.username : 'Create a new system user'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Username" required value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  <Input label="Password" type="password" required={!selectedUser} value={formData.password || ''} placeholder={selectedUser ? 'Leave blank to keep current' : 'Enter password'} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  <Input label="Full Name" required value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} gridCol={false} />
                  <Input label="Email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <Select
                    label="Role"
                    options={[
                      { value: '', label: 'Select role' },
                      ...roles.map(r => ({ value: String(r.id), label: r.name })),
                    ]}
                    value={formData.role_id ? String(formData.role_id) : ''}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value ? parseInt(e.target.value) : null })}
                  />
                  <Select
                    label="Company"
                    options={[
                      { value: '', label: 'Select company' },
                      ...companies.map(c => ({ value: String(c.id), label: c.name })),
                    ]}
                    value={formData.company_id ? String(formData.company_id) : ''}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <Select
                  label="Status"
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  value={formData.status || 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
              </div>

              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedUser ? (
                    <button onClick={() => { setDeleteConfirm({ open: true, id: selectedUser.id }); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
                      <Trash2 size={13} /> Delete
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowPanel(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      <RotateCcw size={13} className="inline mr-1" /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                      <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
