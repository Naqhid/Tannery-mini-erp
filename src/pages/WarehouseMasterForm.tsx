import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save, X, ArrowLeft, Trash2,
  Settings, Grid3X3, Users, Plus,
  Warehouse,
} from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import AddressFields from '../components/ui/AddressFields';
import api from '../lib/api';

interface WarehouseData {
  id?: number;
  code: string;
  name: string;
  short_name: string;
  warehouse_type: string;
  parent_warehouse_id: string;
  is_default: string;
  location_address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  store_keeper: string;
  cost_center: string;
  opening_date: string;
  total_area: string;
  usable_area: string;
  storage_condition: string;
  temperature_control: string;
  humidity_control: string;
  handling_equipment: string;
  material_movement_type: string;
  allow_negative_stock: boolean;
  notes: string;
  remarks: string;
  status: string;
}

interface BinRack {
  _key: string;
  bin_code: string;
  bin_name: string;
  rack_no: string;
  shelf_no: string;
  capacity: string;
  uom: string;
  status: string;
}

interface UserAccess {
  _key: string;
  user_name: string;
  role: string;
  access_level: string;
  can_receive: boolean;
  can_issue: boolean;
  can_transfer: boolean;
  can_adjust: boolean;
}

const empty: WarehouseData = {
  code: '', name: '', short_name: '', warehouse_type: 'Raw Material', parent_warehouse_id: '',
  is_default: 'No', location_address: '', city: '', state: '', country: '', pincode: '',
  phone: '', email: '', store_keeper: '', cost_center: '', opening_date: '', total_area: '',
  usable_area: '', storage_condition: 'Dry', temperature_control: 'No', humidity_control: 'No',
  handling_equipment: '', material_movement_type: 'FIFO', allow_negative_stock: false,
  notes: '', remarks: '', status: 'Active',
};

const WH_TYPES = [
  { value: 'Raw Material', label: 'Raw Material' },
  { value: 'Finished Goods', label: 'Finished Goods' },
  { value: 'Semi-Finished', label: 'Semi-Finished' },
  { value: 'WIP', label: 'Work In Progress' },
  { value: 'Consumable', label: 'Consumable' },
  { value: 'Quarantine', label: 'Quarantine' },
];

const STORAGE_CONDITIONS = [
  { value: 'Dry', label: 'Dry' },
  { value: 'Cold', label: 'Cold' },
  { value: 'Humid', label: 'Humid' },
  { value: 'Refrigerated', label: 'Refrigerated' },
  { value: 'Ambient', label: 'Ambient' },
];

const MOVEMENT_TYPES = [
  { value: 'FIFO', label: 'FIFO' },
  { value: 'LIFO', label: 'LIFO' },
  { value: 'FEFO', label: 'FEFO' },
  { value: 'Weighted Average', label: 'Weighted Average' },
];

const YES_NO = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const ACCESS_LEVELS = [
  { value: 'Full', label: 'Full Access' },
  { value: 'View Only', label: 'View Only' },
  { value: 'Limited', label: 'Limited' },
];

const ROLES = [
  { value: 'Store Keeper', label: 'Store Keeper' },
  { value: 'Store Manager', label: 'Store Manager' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Operator', label: 'Operator' },
  { value: 'Viewer', label: 'Viewer' },
];

let _binKeyCounter = 0;
const genBinKey = () => `bin_${++_binKeyCounter}_${Date.now()}`;
let _userKeyCounter = 0;
const genUserKey = () => `user_${++_userKeyCounter}_${Date.now()}`;

export default function WarehouseMasterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<WarehouseData>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('capacity');
  const [bins, setBins] = useState<BinRack[]>([]);
  const [userAccess, setUserAccess] = useState<UserAccess[]>([]);

  const fetchWarehouse = useCallback(async () => {
    if (isNew) {
      try {
        const res = await api<{ data: { code: string } }>('/warehouses/next-code');
        if (res.data?.code) setForm((p) => ({ ...p, code: res.data.code }));
      } catch { /* ignore preview failure */ }
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: WarehouseData & { bins?: any[]; user_access?: any[] } }>(`/warehouses/${id}`);
      const d = res.data;
      setForm({
        ...empty,
        ...d,
        parent_warehouse_id: d.parent_warehouse_id ? String(d.parent_warehouse_id) : '',
        opening_date: d.opening_date?.split('T')[0] || '',
        allow_negative_stock: Boolean(d.allow_negative_stock),
      });
      if (d.bins && d.bins.length > 0) {
        setBins(d.bins.map((b: any) => ({ ...b, _key: genBinKey() })));
      }
      if (d.user_access && d.user_access.length > 0) {
        setUserAccess(d.user_access.map((u: any) => ({
          ...u,
          _key: genUserKey(),
          can_receive: Boolean(u.can_receive),
          can_issue: Boolean(u.can_issue),
          can_transfer: Boolean(u.can_transfer),
          can_adjust: Boolean(u.can_adjust),
        })));
      }
    } catch { toast.error('Failed to load warehouse'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchWarehouse(); }, [fetchWarehouse]);

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.code) { toast.error('Warehouse code is required'); return; }
    if (!form.name) { toast.error('Warehouse name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      let warehouseId: number | string;
      if (isNew) {
        const res = await api<{ data: { id: number; code: string }; message: string }>('/warehouses', { method: 'POST', body: JSON.stringify(payload) });
        warehouseId = res.data.id;
        toast.success(res.message || 'Warehouse created!');
      } else {
        const res = await api<{ data: { id: number }; message: string }>(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        warehouseId = id!;
        toast.success(res.message || 'Warehouse updated!');
      }
      // Save bins
      if (bins.length > 0) {
        await api(`/warehouses/${warehouseId}/bins`, {
          method: 'PUT',
          body: JSON.stringify({ bins: bins.map(b => ({ bin_code: b.bin_code, bin_name: b.bin_name, rack_no: b.rack_no, shelf_no: b.shelf_no, capacity: b.capacity, uom: b.uom, status: b.status })) }),
        });
      }
      // Save user access
      if (userAccess.length > 0) {
        await api(`/warehouses/${warehouseId}/user-access`, {
          method: 'PUT',
          body: JSON.stringify({ users: userAccess.map(u => ({ user_name: u.user_name, role: u.role, access_level: u.access_level, can_receive: u.can_receive, can_issue: u.can_issue, can_transfer: u.can_transfer, can_adjust: u.can_adjust })) }),
        });
      }
      navigate('/warehouse-master');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  // Bin/Rack handlers
  const addBin = () => setBins((p) => [...p, { _key: genBinKey(), bin_code: '', bin_name: '', rack_no: '', shelf_no: '', capacity: '', uom: '', status: 'Active' }]);
  const removeBin = (key: string) => setBins((p) => p.filter((b) => b._key !== key));
  const updateBin = (key: string, field: string, value: any) => setBins((p) => p.map((b) => b._key === key ? { ...b, [field]: value } : b));

  // User Access handlers
  const addUser = () => setUserAccess((p) => [...p, { _key: genUserKey(), user_name: '', role: 'Store Keeper', access_level: 'Full', can_receive: true, can_issue: true, can_transfer: true, can_adjust: false }]);
  const removeUser = (key: string) => setUserAccess((p) => p.filter((u) => u._key !== key));
  const updateUser = (key: string, field: string, value: any) => setUserAccess((p) => p.map((u) => u._key === key ? { ...u, [field]: value } : u));

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
          <button onClick={() => navigate('/warehouse-master')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <Warehouse size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Warehouse' : 'Edit Warehouse'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{form.code || 'Auto-generated code'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Basic Information</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Row 1 */}
          <Input label="Warehouse Code" required value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="e.g. WH-001" />
          <Input label="Warehouse Name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter warehouse name" />
          <div className="lg:row-span-3">
            <label className="block text-xs font-medium text-gray-900 mb-1">Location / Address <span className="text-rose-500">*</span></label>
            <textarea
              rows={5}
              value={form.location_address}
              onChange={(e) => update('location_address', e.target.value)}
              placeholder="Enter full address"
              className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-full min-h-[120px]"
            />
          </div>
          <Select label="Status" required options={STATUS_OPTIONS} value={form.status} onChange={(e) => update('status', e.target.value)} />
          {/* Row 2 */}
          <Select label="Warehouse Type" required options={WH_TYPES} value={form.warehouse_type} onChange={(e) => update('warehouse_type', e.target.value)} />
          {/* Row 3 */}
          <Input label="Short Name" value={form.short_name} onChange={(e) => update('short_name', e.target.value)} placeholder="e.g. RMW" />
          <Input label="Store Keeper / Incharge" value={form.store_keeper} onChange={(e) => update('store_keeper', e.target.value)} placeholder="Keeper name" />
          {/* location_address spans this cell */}
          <Select label="Cost Center" options={[{ value: '', label: 'Select' }, { value: 'CC-RAW-01', label: 'CC-RAW-01' }, { value: 'CC-FG-01', label: 'CC-FG-01' }, { value: 'CC-WIP-01', label: 'CC-WIP-01' }]} value={form.cost_center} onChange={(e) => update('cost_center', e.target.value)} />
        </div>
      </div>

      {/* Section 2: Additional Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">2. Additional Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AddressFields
            value={{
              country: form.country,
              state: form.state,
              city: form.city,
              pin_code: form.pincode,
            }}
            onChange={(data) => {
              setForm((p) => ({
                ...p,
                country: data.country || '',
                state: data.state || '',
                city: data.city || '',
                pincode: data.pin_code || '',
              }));
            }}
            showAddressTextarea={false}
            className="sm:col-span-2 lg:col-span-4"
          />
          <Input label="Phone No." value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 9876543210" />
          <Input label="Email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="warehouse@abc.com" />
          <Input label="Opening Date" type="date" value={form.opening_date} onChange={(e) => update('opening_date', e.target.value)} />
          <Input label="Remarks" value={form.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Remarks" />
        </div>
      </div>

      {/* Section 3: Tabs - Capacity & Settings / Bin-Rack / User Access */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center gap-0 border-b border-gray-200 px-6 pt-4">
          {[
            { key: 'capacity', label: 'Capacity & Settings', icon: Settings },
            { key: 'bins', label: 'Bin / Rack Details', icon: Grid3X3 },
            { key: 'access', label: 'User Access', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap -mb-px ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'capacity' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Total Area (Sq.Ft.)" type="number" value={form.total_area} onChange={(e) => update('total_area', e.target.value)} placeholder="0" />
                <Select label="Humidity Control" options={YES_NO} value={form.humidity_control} onChange={(e) => update('humidity_control', e.target.value)} />
                <Input label="Usable Area (Sq.Ft.)" type="number" value={form.usable_area} onChange={(e) => update('usable_area', e.target.value)} placeholder="0" />
                <Input label="Handling Equipment" value={form.handling_equipment} onChange={(e) => update('handling_equipment', e.target.value)} placeholder="Forklift, Pallet Truck" />
                <Select label="Storage Condition" options={STORAGE_CONDITIONS} value={form.storage_condition} onChange={(e) => update('storage_condition', e.target.value)} />
                <Select label="Material Movement Type" options={MOVEMENT_TYPES} value={form.material_movement_type} onChange={(e) => update('material_movement_type', e.target.value)} />
                <Select label="Temperature Control" options={YES_NO} value={form.temperature_control} onChange={(e) => update('temperature_control', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Notes</label>
                <textarea
                  rows={7}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'bins' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Define bin/rack locations within this warehouse for precise storage tracking.</p>
                <button onClick={addBin} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
                  <Plus size={14} /> Add Bin / Rack
                </button>
              </div>
              {bins.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200">
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">#</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Bin Code</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Bin Name</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Rack No</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Shelf No</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Capacity</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">UOM</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Status</th>
                        <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-400 uppercase w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bins.map((bin, idx) => (
                        <tr key={bin._key} className="hover:bg-blue-50/30">
                          <td className="py-2 px-3 text-xs text-gray-400 font-bold">{idx + 1}</td>
                          <td className="py-2 px-3"><input value={bin.bin_code} onChange={(e) => updateBin(bin._key, 'bin_code', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[80px]" placeholder="BIN-01" /></td>
                          <td className="py-2 px-3"><input value={bin.bin_name} onChange={(e) => updateBin(bin._key, 'bin_name', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[100px]" placeholder="Bin name" /></td>
                          <td className="py-2 px-3"><input value={bin.rack_no} onChange={(e) => updateBin(bin._key, 'rack_no', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[70px]" placeholder="R-01" /></td>
                          <td className="py-2 px-3"><input value={bin.shelf_no} onChange={(e) => updateBin(bin._key, 'shelf_no', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[70px]" placeholder="S-01" /></td>
                          <td className="py-2 px-3"><input type="number" value={bin.capacity} onChange={(e) => updateBin(bin._key, 'capacity', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[70px]" placeholder="0" /></td>
                          <td className="py-2 px-3"><input value={bin.uom} onChange={(e) => updateBin(bin._key, 'uom', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[60px]" placeholder="Kg" /></td>
                          <td className="py-2 px-3">
                            <select value={bin.status} onChange={(e) => updateBin(bin._key, 'status', e.target.value)} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg">
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button onClick={() => removeBin(bin._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Grid3X3 size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No bins / racks defined yet. Click "Add Bin / Rack" to begin.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Manage user access permissions for this warehouse.</p>
                <button onClick={addUser} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
                  <Plus size={14} /> Add User
                </button>
              </div>
              {userAccess.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200">
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">#</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">User Name</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Role</th>
                        <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Access Level</th>
                        <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Receive</th>
                        <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Issue</th>
                        <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Transfer</th>
                        <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Adjust</th>
                        <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-400 uppercase w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {userAccess.map((user, idx) => (
                        <tr key={user._key} className="hover:bg-blue-50/30">
                          <td className="py-2 px-3 text-xs text-gray-400 font-bold">{idx + 1}</td>
                          <td className="py-2 px-3"><input value={user.user_name} onChange={(e) => updateUser(user._key, 'user_name', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg min-w-[120px]" placeholder="User name" /></td>
                          <td className="py-2 px-3">
                            <select value={user.role} onChange={(e) => updateUser(user._key, 'role', e.target.value)} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg">
                              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <select value={user.access_level} onChange={(e) => updateUser(user._key, 'access_level', e.target.value)} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg">
                              {ACCESS_LEVELS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center"><input type="checkbox" checked={user.can_receive} onChange={(e) => updateUser(user._key, 'can_receive', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" /></td>
                          <td className="py-2 px-3 text-center"><input type="checkbox" checked={user.can_issue} onChange={(e) => updateUser(user._key, 'can_issue', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" /></td>
                          <td className="py-2 px-3 text-center"><input type="checkbox" checked={user.can_transfer} onChange={(e) => updateUser(user._key, 'can_transfer', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" /></td>
                          <td className="py-2 px-3 text-center"><input type="checkbox" checked={user.can_adjust} onChange={(e) => updateUser(user._key, 'can_adjust', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" /></td>
                          <td className="py-2 px-3 text-center">
                            <button onClick={() => removeUser(user._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Users size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No user access defined yet. Click "Add User" to begin.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/warehouse-master')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
