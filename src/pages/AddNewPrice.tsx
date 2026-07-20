import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Truck, Tag, IndianRupee, Calendar, Users, FileText, Receipt,
  Plus, Trash2, Loader2, ChevronLeft, Upload, X
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface Supplier {
  id: number;
  code: string;
  name: string;
}

interface Material {
  id: number;
  code: string;
  name: string;
  uom: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
}

interface PriceBreak {
  seq: number;
  from_qty: number;
  to_qty: number;
  uom: string;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  net_price: number;
}

interface Attachment {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
}

export default function AddNewPrice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canWrite, isReadOnly } = usePermission();
  const isEditMode = !!id;

  // Form data
  const [formData, setFormData] = useState({
    supplier_id: '',
    material_id: '',
    item_group: '',
    supplier_part_no: '',
    uom: '',
    unit_price: '',
    currency: 'INR',
    min_order_qty: '',
    price_type: 'Purchase Price',
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: '',
    remarks: '',
    status: 'Draft',
  });

  // Price breaks
  const [priceBreaks, setPriceBreaks] = useState<PriceBreak[]>([]);

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Filter options
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [itemGroups, setItemGroups] = useState<string[]>([]);

  // Last approved info
  const [lastApproved, setLastApproved] = useState<{
    date: string;
    price: number;
    by: string;
    notes: string;
  } | null>(null);

  // Loading states
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  // Fetch filter options
  useEffect(() => {
    (async () => {
      try {
        const [suppliersRes, materialsRes] = await Promise.all([
          api<{ data: Supplier[] }>('/suppliers?limit=500'),
          api<{ data: Material[] }>('/materials?limit=500'),
        ]);
        setSuppliers(suppliersRes.data || []);
        setMaterials(materialsRes.data || []);
        
        // Extract unique item groups
        const groups = [...new Set((materialsRes.data || []).map(m => m.type || m.category).filter(Boolean))];
        setItemGroups(groups);
        
        // Set default currency
        setCurrencies([{ id: 1, code: 'INR', name: 'Indian Rupee' }]);
      } catch {}
    })();
  }, []);

  // Fetch existing pricing if editing
  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          setLoading(true);
          const res = await api<{ data: any }>(`/supplier-pricing/${id}`);
          const data = res.data;
          setFormData({
            supplier_id: String(data.supplier_id),
            material_id: String(data.material_id),
            item_group: data.item_group || '',
            supplier_part_no: data.supplier_part_no || '',
            uom: data.uom || '',
            unit_price: String(data.unit_price || ''),
            currency: data.currency || 'INR',
            min_order_qty: String(data.min_order_qty || ''),
            price_type: data.price_type || 'Purchase Price',
            valid_from: data.valid_from || new Date().toISOString().split('T')[0],
            valid_to: data.valid_to || '',
            remarks: data.remarks || '',
            status: data.status || 'Draft',
          });
          setPriceBreaks(data.price_breaks || []);
          setAttachments(data.attachments || []);
          
          // Fetch last approved info
          if (data.last_approved_date) {
            setLastApproved({
              date: data.last_approved_date,
              price: data.last_approved_price || data.unit_price,
              by: data.approved_by_name || 'Admin User',
              notes: data.approval_notes || '',
            });
          }
        } catch {}
        finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, id]);

  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle material selection
  const handleMaterialSelect = (material: Material) => {
    setFormData(prev => ({
      ...prev,
      material_id: String(material.id),
      uom: material.uom || '',
    }));
    setMaterialSearchQuery(material.code + ' - ' + material.name);
    setShowMaterialDropdown(false);
  };

  // Add price break
  const addPriceBreak = () => {
    const lastSeq = priceBreaks.length > 0 ? Math.max(...priceBreaks.map(pb => pb.seq)) : 0;
    setPriceBreaks(prev => [
      ...prev,
      {
        seq: lastSeq + 1,
        from_qty: 0,
        to_qty: 0,
        uom: formData.uom || '',
        unit_price: Number(formData.unit_price) || 0,
        discount_percent: 0,
        discount_amount: 0,
        net_price: Number(formData.unit_price) || 0,
      },
    ]);
  };

  // Remove price break
  const removePriceBreak = (seq: number) => {
    setPriceBreaks(prev => prev.filter(pb => pb.seq !== seq));
  };

  // Update price break
  const updatePriceBreak = (seq: number, field: string, value: string | number) => {
    setPriceBreaks(prev =>
      prev.map(pb =>
        pb.seq === seq ? { ...pb, [field]: field === 'unit_price' || field === 'from_qty' || field === 'to_qty' || field === 'discount_percent' || field === 'discount_amount' ? Number(value) : value } : pb
      )
    );
  };

  // Calculate net price when discount changes
  const calculateNetPrice = (seq: number) => {
    const pb = priceBreaks.find(p => p.seq === seq);
    if (!pb) return;
    
    const discountAmount = (pb.unit_price * (pb.discount_percent || 0)) / 100;
    const netPrice = pb.unit_price - discountAmount;
    
    setPriceBreaks(prev =>
      prev.map(p =>
        p.seq === seq ? { ...p, discount_amount: discountAmount, net_price: netPrice } : p
      )
    );
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // In a real implementation, you would upload to the server
      // For now, we'll just add it to the local state
      setAttachments(prev => [
        ...prev,
        {
          id: Date.now(),
          file_name: file.name,
          file_path: URL.createObjectURL(file),
          file_type: file.type,
          file_size: file.size,
        },
      ]);
    }
  };

  // Remove attachment
  const removeAttachment = (id: number) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Save pricing
  const handleSave = async (approve?: boolean) => {
    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        unit_price: Number(formData.unit_price),
        min_order_qty: Number(formData.min_order_qty),
        price_breaks: priceBreaks,
        attachments: attachments.map(a => ({ ...a, id: undefined })),
        status: approve ? 'Pending' : formData.status,
      };

      if (isEditMode) {
        await api(`/supplier-pricing/${id}`, { method: 'PUT', body: payload });
        toast.success('Price updated successfully');
      } else {
        await api('/supplier-pricing', { method: 'POST', body: payload });
        toast.success('New price created successfully');
      }
      
      if (approve) {
        navigate('/supplier-price-approval');
      } else {
        navigate('/supplier-pricing-history');
      }
    } catch {
      toast.error('Failed to save price');
    } finally {
      setSaving(false);
    }
  };

  // Save and approve
  const handleSaveAndApprove = async () => {
    await handleSave(true);
  };

  // Filter materials based on search
  const filteredMaterials = materials.filter(m =>
    m.code.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(materialSearchQuery.toLowerCase())
  );

  // Get selected supplier and material for display
  const selectedSupplier = suppliers.find(s => s.id === Number(formData.supplier_id));
  const selectedMaterial = materials.find(m => m.id === Number(formData.material_id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-blue-600" />
              Add New Price
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create new supplier pricing with price breaks and approvals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/supplier-pricing-history')} className="btn btn-secondary">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {!isReadOnly && (
              <>
                <button onClick={handleSaveAndApprove} disabled={saving} className="btn btn-success">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save & Approve</>}
                </button>
                <button onClick={() => handleSave()} disabled={saving} className="btn btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save as Draft</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-4">
        {/* Section 1: Price Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            1. Price Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier <span className="text-rose-500">*</span>
              </label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={isEditMode}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            {/* Item */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={materialSearchQuery}
                onChange={(e) => {
                  setMaterialSearchQuery(e.target.value);
                  if (e.target.value === '') {
                    setFormData(prev => ({ ...prev, material_id: '' }));
                  }
                }}
                onFocus={() => setShowMaterialDropdown(true)}
                placeholder="Select Item"
                className="input input-bordered w-full"
              />
              {showMaterialDropdown && (
                <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto w-full">
                  {filteredMaterials.map(m => (
                    <div
                      key={m.id}
                      onClick={() => handleMaterialSelect(m)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <div className="font-medium">{m.code} - {m.name}</div>
                      <div className="text-xs text-gray-500">{m.uom}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Group
              </label>
              <select
                name="item_group"
                value={formData.item_group}
                onChange={handleChange}
                className="input input-bordered w-full"
              >
                <option value="">Select Item Group</option>
                {itemGroups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Supplier Part No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Part No.
              </label>
              <input
                type="text"
                name="supplier_part_no"
                value={formData.supplier_part_no}
                onChange={handleChange}
                placeholder="Supplier part number"
                className="input input-bordered w-full"
              />
            </div>

            {/* UOM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UOM <span className="text-rose-500">*</span>
              </label>
              <select
                name="uom"
                value={formData.uom}
                onChange={handleChange}
                className="input input-bordered w-full"
              >
                <option value="">Select UOM</option>
                <option value="KG">KG - Kilogram</option>
                <option value="LTR">LTR - Litre</option>
                <option value="SQ.FT.">SQ.FT. - Square Foot</option>
                <option value="NOS">NOS - Number</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency <span className="text-rose-500">*</span>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input input-bordered w-full"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ({formData.currency}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="input input-bordered pl-10 w-full"
                />
              </div>
            </div>

            {/* Minimum Order Qty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Qty
              </label>
              <input
                type="number"
                name="min_order_qty"
                value={formData.min_order_qty}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                className="input input-bordered w-full"
              />
            </div>

            {/* Price Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Type
              </label>
              <select
                name="price_type"
                value={formData.price_type}
                onChange={handleChange}
                className="input input-bordered w-full"
              >
                <option value="Purchase Price">Purchase Price</option>
                <option value="Contract Price">Contract Price</option>
              </select>
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            {/* Valid To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective To Date
              </label>
              <input
                type="date"
                name="valid_to"
                value={formData.valid_to}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter remarks (optional)"
                rows={2}
                className="input input-bordered w-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Approval Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            2. Approval Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Approved Date
              </label>
              <input
                type="text"
                value={lastApproved?.date || ''}
                readOnly
                className="input input-bordered bg-gray-50 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Approved Price ({formData.currency})
              </label>
              <input
                type="text"
                value={lastApproved?.price ? lastApproved.price.toFixed(2) : ''}
                readOnly
                className="input input-bordered bg-gray-50 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved By
              </label>
              <input
                type="text"
                value={lastApproved?.by || ''}
                readOnly
                className="input input-bordered bg-gray-50 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Notes
              </label>
              <input
                type="text"
                value={lastApproved?.notes || ''}
                readOnly
                className="input input-bordered bg-gray-50 w-full"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Price Breaks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              3. Price Breaks (Quantity Based Pricing)
            </h2>
            {!isReadOnly && (
              <button onClick={addPriceBreak} className="btn btn-primary btn-sm">
                <Plus className="w-4 h-4" /> Add Price Break
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="table table-compact">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap">#</th>
                  <th className="whitespace-nowrap">From Qty ({formData.uom})</th>
                  <th className="whitespace-nowrap">To Qty ({formData.uom})</th>
                  <th className="whitespace-nowrap">Unit Price ({formData.currency})</th>
                  <th className="whitespace-nowrap">Discount (%)</th>
                  <th className="whitespace-nowrap">Net Price ({formData.currency})</th>
                  {!isReadOnly && <th className="whitespace-nowrap">Action</th>}
                </tr>
              </thead>
              <tbody>
                {priceBreaks.length === 0 ? (
                  <tr>
                    <td colSpan={isReadOnly ? 6 : 7} className="text-center text-gray-500 py-4">
                      No price breaks added
                    </td>
                  </tr>
                ) : (
                  priceBreaks.map((pb, index) => (
                    <tr key={pb.seq} className="hover:bg-gray-50">
                      <td>{index + 1}</td>
                      <td>
                        <input
                          type="number"
                          value={pb.from_qty}
                          onChange={(e) => updatePriceBreak(pb.seq, 'from_qty', e.target.value)}
                          className="input input-bordered input-sm w-20"
                          disabled={isReadOnly}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={pb.to_qty}
                          onChange={(e) => updatePriceBreak(pb.seq, 'to_qty', e.target.value)}
                          className="input input-bordered input-sm w-20"
                          disabled={isReadOnly}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={pb.unit_price}
                          onChange={(e) => {
                            updatePriceBreak(pb.seq, 'unit_price', e.target.value);
                            calculateNetPrice(pb.seq);
                          }}
                          className="input input-bordered input-sm w-24 text-right"
                          disabled={isReadOnly}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={pb.discount_percent}
                          onChange={(e) => {
                            updatePriceBreak(pb.seq, 'discount_percent', e.target.value);
                            calculateNetPrice(pb.seq);
                          }}
                          className="input input-bordered input-sm w-16 text-right"
                          disabled={isReadOnly}
                        />
                      </td>
                      <td className="text-right">
                        {pb.net_price.toFixed(2)}
                      </td>
                      {!isReadOnly && (
                        <td className="whitespace-nowrap">
                          <button
                            onClick={() => removePriceBreak(pb.seq)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Attachments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              4. Attachments
            </h2>
            {!isReadOnly && (
              <label className="btn btn-primary btn-sm cursor-pointer">
                <Upload className="w-4 h-4" /> Upload
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            <p>Drag & drop files here or click to browse</p>
            <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max size: 5MB)</p>
          </div>
          
          {attachments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-compact">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap">File Name</th>
                    <th className="whitespace-nowrap">Uploaded By</th>
                    <th className="whitespace-nowrap">Uploaded On</th>
                    {!isReadOnly && <th className="whitespace-nowrap">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        {a.file_name}
                      </td>
                      <td>Admin User</td>
                      <td>{new Date().toLocaleString()}</td>
                      {!isReadOnly && (
                        <td className="whitespace-nowrap">
                          <button
                            onClick={() => removeAttachment(a.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {attachments.length === 0 && (
            <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No attachments uploaded</p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <span className="text-lg">💡</span>
              After saving, this will be available for selection in Purchase Orders and other transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
