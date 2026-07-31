import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Users, RotateCcw } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

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

const emptyForm: UserForm = {
  username: '', password: '', confirm_password: '',
  full_name: '', email: '', role_id: '', status: 'Active',
};

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<UserForm>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api<{ data: Role[] }>('/roles/dropdown');
      setRoles(res.data || []);
    } catch {}
  }, []);

  const fetchUser = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/users/${id}`);
      const user = res.data;
      setForm({
        username: user.username || '',
        password: '',
        confirm_password: '',
        full_name: user.full_name || '',
        email: user.email || '',
        role_id: String(user.role_id || ''),
        status: user.status || 'Active',
      });
    } catch {
      toast.error('Failed to load user');
      navigate('/users');
    } finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchRoles(); fetchUser(); }, [fetchRoles, fetchUser]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.full_name.trim()) errs.full_name = 'Full Name is required';
    if (isNew && !form.password.trim()) errs.password = 'Password is required for new users';
    if (form.password && form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fix validation errors'); return; }
    setSaving(true);
    try {
      if (!isNew) {
        const body: any = { ...form, role_id: form.role_id ? Number(form.role_id) : null };
        delete body.confirm_password;
        if (!body.password) delete body.password;
        await api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast.success('User updated successfully!');
      } else {
        const { confirm_password, ...rest } = form;
        const payload = { ...rest, role_id: form.role_id ? Number(form.role_id) : null };
        await api('/users', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('User created successfully!');
      }
      navigate('/users');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save user');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/users')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'Add User' : 'Edit User'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{isNew ? 'Create a new user account' : form.username}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Account Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Username"
            required
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="Enter username"
            disabled={!isNew}
            error={errors.username}
          />
          <Input
            label="Full Name"
            required
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            placeholder="Enter full name"
            error={errors.full_name}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="Enter email"
          />
        </div>
      </div>

      {/* Section 2: Security */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">2. Security</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={isNew ? 'Password' : 'New Password (leave blank to keep current)'}
            required={isNew}
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder={isNew ? 'Enter password' : 'Leave blank to keep current'}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            required={isNew || !!form.password}
            type="password"
            value={form.confirm_password}
            onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
            placeholder="Confirm password"
            error={errors.confirm_password}
          />
        </div>
      </div>

      {/* Section 3: Role & Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Role & Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Role"
            options={[
              { value: '', label: 'Select role' },
              ...roles.map(r => ({ value: String(r.id), label: r.name })),
            ]}
            value={form.role_id}
            onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
          />
          <Select
            label="Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-2xl shadow-lg p-4 flex items-center justify-between">
        <button onClick={() => navigate('/users')} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
          <RotateCcw size={13} /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md shadow-blue-200 hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
        >
          <Save size={13} /> {saving ? 'Saving...' : isNew ? 'Create User' : 'Update User'}
        </button>
      </div>
    </div>
  );
}
