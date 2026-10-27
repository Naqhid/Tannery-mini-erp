import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save, X, Trash2, Upload, Download, FileText, Search,
  Loader2, Info, Calendar, Package, UploadCloud
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface Supplier { id: number; code: string; name: string; }
interface Material {
  id: number; code: string; name: string; uom: string; type?: string;
  group_name?: string; category?: string; category_name?: string;
  currency?: string; reorder_level?: number | string;
}

interface AttachmentFile {
  id?: number;
  file_name: string;
  uploaded_by: string;
  uploaded_on: string;
  file?: File;
}

interface PriceFormData {
  supplier_id: string;
  material_id: string;
  price_type: string;
  valid_from: string;
  item_group: string;
  supplier_part_no: string;
  unit_price: string;
  valid_to: string;
  uom: string;
  currency: string;
  min_order_qty: string;
  approval_status: string;
}

const emptyForm: PriceFormData = {
  supplier_id: '', material_id: '', price_type: 'Purchase Price',
  valid_from: new Date().toISOString().split('T')[0], item_group: '',
  supplier_part_no: '', unit_price: '', valid_to: '', uom: '',
  currency: 'INR', min_order_qty: '', approval_status: '',
};

export default function AddNewPrice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isReadOnly } = usePermission();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState<PriceFormData>(emptyForm);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Approval info (read-only, populated from API when editing)
  const [approvalInfo, setApprovalInfo] = useState({
    lastApprovedDate: '',
    lastApprovedPrice: '',
    approvedBy: '',
    approvalNotes: '',
  });

  const fetchDropdowns = useCallback(async () => {
    try {
      const [sup, mat] = await Promise.all([
        api<{ data: Supplier[] }>('/suppliers?limit=500'),
        api<{ data: Material[] }>('/materials?limit=500'),
      ]);
      setSuppliers(sup.data || []);
      setMaterials(mat.data || []);
    } catch { toast.error('Failed to load dropdowns'); }
  }, []);

  const fetchPrice = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/supplier-pricing/${id}`);
      const d = res.data;
      setForm({
        supplier_id: String(d.supplier_id || ''),
        material_id: String(d.material_id || ''),
        price_type: d.price_type || 'Purchase Price',
        valid_from: d.valid_from?.split('T')[0] || '',
        item_group: d.item_group || '',
        supplier_part_no: d.supplier_part_no || '',
        unit_price: String(d.unit_price || ''),
        valid_to: d.valid_to?.split('T')[0] || '',
        uom: d.uom || '',
        currency: d.currency || 'INR',
        min_order_qty: String(d.min_order_qty || ''),
        approval_status: d.status || '',
      });
      if (d.attachments?.length) {
        setAttachments(d.attachments.map((att: any) => ({
          id: att.id,
          file_name: att.file_name,
          uploaded_by: att.uploaded_by_name || 'User',
          uploaded_on: att.uploaded_on || att.created_at || '',
        })));
      }
      setApprovalInfo({
        lastApprovedDate: d.last_approved_date?.split('T')[0] || '',
        lastApprovedPrice: d.last_approved_price ? String(d.last_approved_price) : '',
        approvedBy: d.approved_by_name || '',
        approvalNotes: d.approval_notes || '',
      });
    } catch { toast.error('Failed to load pricing'); }
    finally { setLoading(false); }
  }, [id, isNew]);

  useEffect(() => { fetchDropdowns(); fetchPrice(); }, [fetchDropdowns, fetchPrice]);

  const update = (key: keyof PriceFormData, value: string) => setForm(p => ({ ...p, [key]: value }));

  // Look up the most recent pricing record for a supplier + item and surface
  // its approval details and status. Shared by the item and supplier handlers
  // so approval info stays in sync whenever either selection changes.
  const loadApprovalInfo = useCallback(async (supplierId: string, materialId: string) => {
    if (!supplierId || !materialId) {
      setApprovalInfo({ lastApprovedDate: '', lastApprovedPrice: '', approvedBy: '', approvalNotes: '' });
      setForm(p => ({ ...p, approval_status: materialId ? 'Not Approved' : '' }));
      return;
    }
    try {
      // Server-side filter by material so we only get this item's records.
      const res = await api<{ data: any[] }>(`/supplier-pricing/supplier/${supplierId}?material_id=${materialId}`);
      const latest = (res.data || []).slice().sort((a: any, b: any) =>
        new Date(b.approved_date || b.valid_from || 0).getTime() - new Date(a.approved_date || a.valid_from || 0).getTime()
      )[0];
      if (latest) {
        setApprovalInfo({
          lastApprovedDate: (latest.last_approved_date || latest.approved_date)?.split('T')[0] || '',
          lastApprovedPrice: latest.last_approved_price != null ? String(latest.last_approved_price) : (latest.unit_price != null ? String(latest.unit_price) : ''),
          approvedBy: latest.approved_by_name || '',
          approvalNotes: latest.approval_notes || latest.remarks || '',
        });
        setForm(p => ({ ...p, approval_status: latest.status || '' }));
      } else {
        setApprovalInfo({ lastApprovedDate: '', lastApprovedPrice: '', approvedBy: '', approvalNotes: '' });
        setForm(p => ({ ...p, approval_status: 'Not Approved' }));
      }
    } catch {
      setApprovalInfo({ lastApprovedDate: '', lastApprovedPrice: '', approvedBy: '', approvalNotes: '' });
    }
  }, []);

  // When an item is selected, auto-populate Item Group, UOM, Currency and
  // Minimum Order Qty from the material master, then refresh approval info.
  const handleItemChange = (materialId: string) => {
    const mat = materials.find(m => String(m.id) === materialId);
    setForm(p => ({
      ...p,
      material_id: materialId,
      item_group: mat ? (mat.group_name || mat.type || mat.category_name || mat.category || '') : '',
      uom: mat?.uom || '',
      currency: mat?.currency || p.currency || 'INR',
      min_order_qty: mat?.reorder_level != null ? String(mat.reorder_level) : '',
      approval_status: '',
    }));
    loadApprovalInfo(form.supplier_id, materialId);
  };

  // Changing the supplier re-evaluates approval info for the current item.
  const handleSupplierChange = (supplierId: string) => {
    update('supplier_id', supplierId);
    loadApprovalInfo(supplierId, form.material_id);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      setAttachments(prev => [...prev, {
        file_name: file.name,
        uploaded_by: 'Current User',
        uploaded_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        file,
      }]);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      setAttachments(prev => [...prev, {
        file_name: file.name,
        uploaded_by: 'Current User',
        uploaded_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        file,
      }]);
    });
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form.supplier_id) { toast.error('Supplier is required'); return; }
    if (!form.material_id) { toast.error('Item is required'); return; }
    if (!form.unit_price) { toast.error('Unit price is required'); return; }
    if (!form.valid_from) { toast.error('Effective from date is required'); return; }
    if (!form.uom) { toast.error('UOM is required'); return; }
    if (!form.currency) { toast.error('Currency is required'); return; }

    setSaving(true);
    try {
      // Save only — saving does NOT imply approval. New records start as
      // Pending and go through the separate Price Approval workflow.
      const payload = {
        ...form,
        supplier_id: Number(form.supplier_id),
        material_id: Number(form.material_id),
        unit_price: parseFloat(form.unit_price),
        min_order_qty: parseFloat(form.min_order_qty) || 0,
        status: isNew ? 'Pending' : (form.approval_status || 'Pending'),
      };

      if (isNew) {
        await api('/supplier-pricing', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Price saved!');
      } else {
        await api(`/supplier-pricing/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Price saved!');
      }
      navigate('/supplier-pricing-history');
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isNew ? 'Add New Price' : 'Edit Price'}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/dashboard')}>Purchase</span>
            {' > '}
            <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/supplier-pricing-history')}>Supplier Pricing History</span>
            {' > '}
            <span className="text-gray-500">{isNew ? 'Add New Price' : 'Edit Price'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/supplier-pricing-history')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Price Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-blue-700">1. Price Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Supplier <span className="text-red-500">*</span></label>
            <select value={form.supplier_id} onChange={e => handleSupplierChange(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={String(s.id)}>{s.code} - {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Item <span className="text-red-500">*</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={form.material_id} onChange={e => handleItemChange(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">Search & select item</option>
                {materials.map(m => <option key={m.id} value={String(m.id)}>{m.code} - {m.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Price Type <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-4 h-[42px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="Purchase Price" checked={form.price_type === 'Purchase Price'} onChange={e => update('price_type', e.target.value)} className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Purchase Price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priceType" value="Contract Price" checked={form.price_type === 'Contract Price'} onChange={e => update('price_type', e.target.value)} className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Contract Price</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Effective From Date <span className="text-red-500">*</span></label>
            <input type="date" value={form.valid_from} onChange={e => update('valid_from', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Item Group</label>
            <input type="text" value={form.item_group} readOnly placeholder="Auto-filled from item" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Supplier Part No.</label>
            <input type="text" value={form.supplier_part_no} onChange={e => update('supplier_part_no', e.target.value)} placeholder="Enter supplier part number" className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Unit Price (INR) <span className="text-red-500">*</span></label>
            <input type="number" value={form.unit_price} onChange={e => update('unit_price', e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Effective To Date</label>
            <input type="date" value={form.valid_to} onChange={e => update('valid_to', e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">UOM <span className="text-red-500">*</span></label>
            <input type="text" value={form.uom} readOnly placeholder="Auto-filled from item" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Currency <span className="text-red-500">*</span></label>
            <input type="text" value={form.currency} readOnly placeholder="Auto-filled from item" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Minimum Order Qty</label>
            <div className="relative">
              <input type="number" value={form.min_order_qty} readOnly placeholder="Auto-filled from item" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{form.uom || 'UOM'}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Approval Status</label>
            {form.material_id ? (
              <span className={`inline-flex items-center h-[42px] px-3 rounded-lg text-sm font-medium w-full border ${
                form.approval_status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                form.approval_status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                form.approval_status === 'Expired' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {form.approval_status || 'Pending'}
              </span>
            ) : (
              <input type="text" value="" readOnly placeholder="Select an item" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Approval Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-blue-700">2. Approval Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Approved Date</label>
            <input type="text" value={approvalInfo.lastApprovedDate} readOnly className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Approved Price (INR)</label>
            <input type="text" value={approvalInfo.lastApprovedPrice} readOnly className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Approved By</label>
            <input type="text" value={approvalInfo.approvedBy} readOnly className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Approval Notes</label>
            <input type="text" value={approvalInfo.approvalNotes} readOnly className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600" />
          </div>
        </div>
      </div>

      {/* Section 3: Attachments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-blue-700">3. Attachments</h2>
        </div>

        {/* Drag & Drop Zone + Attachments Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-green-300 bg-green-50/30 rounded-xl p-6 text-center hover:border-green-400 transition-colors flex flex-col items-center justify-center min-h-[120px]"
          >
            <UploadCloud className="w-10 h-10 text-green-500 mb-3" />
            <p className="text-sm font-medium text-green-700 mb-1">Drag & drop files here or click to browse</p>
            <p className="text-xs text-gray-400">Supported formats: PDF, JPG, PNG (Max size: 5MB)</p>
            <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg cursor-pointer hover:bg-green-200 transition-all">
              Browse Files
              <input type="file" multiple onChange={handleFileInput} className="hidden" />
            </label>
          </div>

          {/* Attachments Table */}
          {attachments.length > 0 && (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">File Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Uploaded By</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Uploaded On</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attachments.map((att, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-red-100 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <span className="truncate">{att.file_name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{att.uploaded_by}</td>
                      <td className="px-4 py-3 text-gray-600">{att.uploaded_on}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeAttachment(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xs text-blue-700">After saving, this price will be available for selection in Purchase Orders and other transactions.</p>
        </div>
      </div>
    </div>
  );
}
