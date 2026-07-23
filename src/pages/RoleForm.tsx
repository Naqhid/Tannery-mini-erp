import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';
import { menuItems } from '../components/Sidebar';

interface RoleData {
  id?: number;
  code: string;
  name: string;
  description: string;
  access_level: string;
  status: string;
}

const emptyRole: RoleData = { code: '', name: '', description: '', access_level: 'read_write', status: 'Active' };

// Flatten all menu paths from sidebar
function getAllMenuPaths(): { path: string; label: string; parent?: string }[] {
  const paths: { path: string; label: string; parent?: string }[] = [];
  menuItems.forEach((item) => {
    if (item.path) {
      paths.push({ path: item.path, label: item.label });
    }
    if (item.children) {
      item.children.forEach((child) => {
        paths.push({ path: child.path, label: child.label, parent: item.label });
      });
    }
  });
  return paths;
}

export default function RoleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [role, setRole] = useState<RoleData>(emptyRole);
  const [menuAccess, setMenuAccess] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [statusToggle, setStatusToggle] = useState(true);

  const allPaths = getAllMenuPaths();

  const fetchRole = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const [roleRes, accessRes] = await Promise.all([
        api<{ data: RoleData }>(`/roles/${id}`),
        api<{ data: string[] }>(`/roles/${id}/menu-access`),
      ]);
      const r = roleRes.data;
      setRole({ ...emptyRole, ...r });
      setStatusToggle(r.status === 'Active');
      setMenuAccess(new Set(accessRes.data || []));
    } catch {
      toast.error('Failed to load role');
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

  // Initialize expanded groups
  useEffect(() => {
    const groups: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) groups[item.label] = true;
    });
    setExpandedGroups(groups);
  }, []);

  const update = (key: keyof RoleData, value: string) => setRole((p) => ({ ...p, [key]: value }));

  const togglePath = (path: string) => {
    setMenuAccess((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleGroup = (groupLabel: string) => {
    const group = menuItems.find((m) => m.label === groupLabel);
    if (!group?.children) return;
    const groupPaths = group.children.map((c) => c.path);
    const allChecked = groupPaths.every((p) => menuAccess.has(p));
    setMenuAccess((prev) => {
      const next = new Set(prev);
      groupPaths.forEach((p) => {
        if (allChecked) next.delete(p);
        else next.add(p);
      });
      return next;
    });
  };

  const selectAll = () => {
    setMenuAccess(new Set(allPaths.map((p) => p.path)));
  };

  const deselectAll = () => {
    setMenuAccess(new Set());
  };

  const handleSave = async () => {
    if (!role.code || !role.name) {
      toast.error('Code and Name are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...role, status: statusToggle ? 'Active' : 'Inactive' };
      let roleId = id;
      if (isNew) {
        const res = await api<{ data: { id: number } }>('/roles', { method: 'POST', body: JSON.stringify(payload) });
        roleId = String(res.data.id);
        toast.success('Role created successfully!');
      } else {
        await api(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Role updated successfully!');
      }
      // Save menu access
      await api(`/roles/${roleId}/menu-access`, {
        method: 'PUT',
        body: JSON.stringify({ paths: Array.from(menuAccess) }),
      });
      navigate('/roles');
    } catch (err) {
      toast.error('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/roles')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{isNew ? 'New Role' : 'Edit Role'}</h1>
            <p className="text-xs text-gray-500">{role.code || 'Create a new role'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Role Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Role Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Code" required value={role.code} onChange={(e) => update('code', e.target.value)} placeholder="e.g. ADMIN" />
          <Input label="Name" required value={role.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Administrator" />
          <Select label="Access Level" required options={[{ value: 'read_write', label: 'Read & Write' }, { value: 'read_only', label: 'Read Only' }]} value={role.access_level} onChange={(e) => update('access_level', e.target.value)} />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => setStatusToggle(!statusToggle)} className={`relative w-11 h-6 rounded-full transition-colors ${statusToggle ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${statusToggle ? 'translate-x-5' : ''}`} />
              </button>
              <span className={`text-xs font-medium ${statusToggle ? 'text-blue-600' : 'text-gray-500'}`}>{statusToggle ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={role.description} onChange={(e) => update('description', e.target.value)} placeholder="Role description..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Section 2: Menu Access */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">2. Menu Access</h2>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all">Select All</button>
            <button onClick={deselectAll} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">Deselect All</button>
            <span className="text-xs text-gray-500 ml-2">{menuAccess.size} of {allPaths.length} selected</span>
          </div>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (item.children) {
              const groupPaths = item.children.map((c) => c.path);
              const checkedCount = groupPaths.filter((p) => menuAccess.has(p)).length;
              const allChecked = checkedCount === groupPaths.length;
              const someChecked = checkedCount > 0 && !allChecked;
              const isExpanded = expandedGroups[item.label];
              return (
                <div key={item.label} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedGroups((p) => ({ ...p, [item.label]: !p[item.label] }))}>
                    <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = someChecked; }} onChange={() => toggleGroup(item.label)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                    <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{checkedCount}/{groupPaths.length}</span>
                  </div>
                  {isExpanded && (
                    <div className="px-4 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                      {item.children.map((child) => (
                        <label key={child.path} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-blue-50/50 cursor-pointer transition-all">
                          <input type="checkbox" checked={menuAccess.has(child.path)} onChange={() => togglePath(child.path)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-xs text-gray-700">{child.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            // Top-level item
            return (
              <label key={item.label} className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:bg-blue-50/50 cursor-pointer transition-all">
                <input type="checkbox" checked={menuAccess.has(item.path || '')} onChange={() => item.path && togglePath(item.path)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-semibold text-gray-800">{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/roles')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : isNew ? 'Create Role' : 'Update Role'}
        </button>
      </div>
    </div>
  );
}
