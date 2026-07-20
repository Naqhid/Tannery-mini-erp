import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Package, Calendar, Warehouse, Search, Plus, Trash2, Loader2, ChevronLeft,
  Upload, Download, Save, X
} from 'lucide-react';
import api from '../lib/api';
import { usePermission } from '../lib/usePermission';

interface Godown {
  id: number;
  code: string;
  name: string;
}

interface Item {
  id: number;
  code: string;
  name: string;
  uom: string;
  batch_no: string | null;
  location_rack: string | null;
}

interface PhysicalStockEntryItem {
  seq: number;
  item_code: string;
  item_description: string;
  uom: string;
  batch_no: string | null;
  location_rack: string | null;
  system_qty: number;
  physical_qty: number;
  variance_qty: number;
  variance_value: number;
  remarks: string | null;
}

const UOM_OPTIONS = ['KG', 'LTR', 'SQ.FT.', 'NOS', 'MTR', 'PCS'];

export default function PhysicalStockEntryDetail() {
  const navigate = useNavigate();
  const { id, action } = useParams();
  const { canWrite, isReadOnly } = usePermission();
  const isEditMode = action === 'edit' && !!id;
  const isNewMode = action === 'new';

  // Form data
  const [formData, setFormData] = useState({
    entry_no: '',
    entry_date: new Date().toISOString().split('T')[0],
    stock_date: new Date().toISOString().split('T')[0],
    reference_no: '',
    godown_id: '',
    location_rack: '',
    uom: '',
    from_item_code: '',
    to_item_code: '',
    remarks: '',
    status: 'Draft',
  });

  // Items
  const [items, setItems] = useState<PhysicalStockEntryItem[]>([]);

  // Filter options
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);

  // Loading states
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Fetch filter options
  useEffect(() => {
    (async () => {
      try {
        const [godownsRes, itemsRes] = await Promise.all([
          api<{ data: Godown[] }>('/warehouse-master?limit=500'),
          api<{ data: Item[] }>('/materials?limit=500'),
        ]);
        setGodowns(godownsRes.data || []);
        setAllItems(itemsRes.data || []);
      } catch {}
    })();
  }, []);

  // Fetch existing entry if editing
  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          setLoading(true);
          const res = await api<{ data: any }>(`/physical-stock-entries/${id}`);
          const data = res.data;
          setFormData({
            entry_no: data.entry_no || '',
            entry_date: data.entry_date || new Date().toISOString().split('T')[0],
            stock_date: data.stock_date || new Date().toISOString().split('T')[0],
            reference_no: data.reference_no || '',
            godown_id: String(data.godown_id || ''),
            location_rack: data.location_rack || '',
            uom: data.uom || '',
            from_item_code: data.from_item_code || '',
            to_item_code: data.to_item_code || '',
            remarks: data.remarks || '',
            status: data.status || 'Draft',
          });
          
          // Convert items to editable format
          const entryItems = data.items || [];
          setItems(entryItems.map((item: any, index: number) => ({
            seq: index + 1,
            item_code: item.item_code || '',
            item_description: item.item_description || '',
            uom: item.uom || '',
            batch_no: item.batch_no || null,
            location_rack: item.location_rack || null,
            system_qty: item.system_qty || 0,
            physical_qty: item.physical_qty || 0,
            variance_qty: item.variance_qty || 0,
            variance_value: item.variance_value || 0,
            remarks: item.remarks || null,
          })));
        } catch {}
        finally {
          setLoading(false);
        }
      })();
    } else if (isNewMode) {
      // Generate new entry number
      (async () => {
        try {
          const res = await api<{ data: { entry_no: string; } }>('/physical-stock-entries/new-number');
          setFormData(prev => ({ ...prev, entry_no: res.data?.entry_no || `PSE-${new Date().toISOString().slice(2, 10)}-0001` }));
        } catch {}
      })();
    }
  }, [isEditMode, isNewMode, id]);

  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle item search
  const filteredItems = allItems.filter(item =>
    item.code.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  // Select item for a row
  const handleSelectItem = (item: Item, index: number) => {
    setItems(prev =>
      prev.map((i, idx) =>
        idx === index ? {
          ...i,
          item_code: item.code,
          item_description: item.name,
          uom: item.uom,
          batch_no: item.batch_no,
          location_rack: item.location_rack,
        } : i
      )
    );
    setShowItemDropdown(false);
    setSelectedItemIndex(null);
    setItemSearchQuery('');
  };

  // Add new row
  const addRow = () => {
    const newSeq = items.length > 0 ? Math.max(...items.map(i => i.seq)) + 1 : 1;
    setItems(prev => [
      ...prev,
      {
        seq: newSeq,
        item_code: '',
        item_description: '',
        uom: formData.uom || '',
        batch_no: null,
        location_rack: null,
        system_qty: 0,
        physical_qty: 0,
        variance_qty: 0,
        variance_value: 0,
        remarks: null,
      },
    ]);
  };

  // Remove row
  const removeRow = (seq: number) => {
    setItems(prev => prev.filter(i => i.seq !== seq));
  };

  // Update item field
  const updateItemField = (seq: number, field: string, value: string | number | null) => {
    setItems(prev =>
      prev.map(item =>
        item.seq === seq ? { ...item, [field]: value } : item
      )
    );
  };

  // Fetch system stock for an item
  const fetchSystemStock = async (itemCode: string, index: number) => {
    try {
      const res = await api<{ data: { stock: number; } }>(`/physical-stock-entries/item-stock/${itemCode}`);
      const stock = res.data?.stock || 0;
      updateItemField(index + 1, 'system_qty', stock);
      
      // Recalculate variance
      const item = items.find(i => i.seq === index + 1);
      if (item) {
        const variance = (item.physical_qty || 0) - stock;
        updateItemField(index + 1, 'variance_qty', variance);
        updateItemField(index + 1, 'variance_value', variance * 0); // Placeholder for value calculation
      }
    } catch {
      // Keep existing value
    }
  };

  // Update physical quantity and recalculate variance
  const updatePhysicalQty = (seq: number, value: number) => {
    const item = items.find(i => i.seq === seq);
    if (!item) return;
    
    const newPhysicalQty = value;
    const systemQty = item.system_qty || 0;
    const variance = newPhysicalQty - systemQty;
    
    updateItemField(seq, 'physical_qty', newPhysicalQty);
    updateItemField(seq, 'variance_qty', variance);
    updateItemField(seq, 'variance_value', variance * 0); // Placeholder for value calculation
  };

  // Handle file upload (for import from Excel)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // In a real implementation, you would upload to the server
      // For now, just show a toast
      toast.info('Import from Excel functionality to be implemented');
    } catch {
      toast.error('Failed to import file');
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    toast.info('Download template functionality to be implemented');
  };

  // Save entry
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        godown_id: formData.godown_id ? Number(formData.godown_id) : null,
        items: items.map(item => ({
          item_code: item.item_code,
          item_description: item.item_description,
          uom: item.uom,
          batch_no: item.batch_no,
          location_rack: item.location_rack,
          system_qty: item.system_qty,
          physical_qty: item.physical_qty,
          variance_qty: item.variance_qty,
          variance_value: item.variance_value,
          remarks: item.remarks,
        })),
      };

      if (isEditMode) {
        await api(`/physical-stock-entries/${id}`, { method: 'PUT', body: payload });
        toast.success('Physical stock entry updated successfully');
      } else {
        await api('/physical-stock-entries', { method: 'POST', body: payload });
        toast.success('New physical stock entry created successfully');
      }
      
      navigate('/physical-stock-entry');
    } catch {
      toast.error('Failed to save physical stock entry');
    } finally {
      setSaving(false);
    }
  };

  // Calculate summary
  const getSummary = () => {
    const totalItems = items.length;
    const matchedItems = items.filter(i => i.variance_qty === 0).length;
    const varianceItems = items.filter(i => i.variance_qty !== 0).length;
    const totalVarianceValue = items.reduce((sum, i) => sum + (i.variance_value || 0), 0);
    
    return { totalItems, matchedItems, varianceItems, totalVarianceValue };
  };

  const summary = getSummary();

  // Open item search for a specific row
  const openItemSearch = (index: number) => {
    setSelectedItemIndex(index);
    setShowItemDropdown(true);
    setItemSearchQuery('');
  };

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
              <Package className="w-6 h-6 text-blue-600" />
              Physical Stock Entry
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Edit' : isNewMode ? 'Create New' : 'View'} physical stock entry
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/physical-stock-entry')} className="btn btn-secondary">
              <ChevronLeft className="w-4 h-4" /> Back to List
            </button>
            {!isReadOnly && (
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Entry Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          1. Entry Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry No. <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="entry_no"
              value={formData.entry_no}
              onChange={handleChange}
              readOnly={isEditMode}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="stock_date"
              value={formData.stock_date}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference No.
            </label>
            <input
              type="text"
              name="reference_no"
              value={formData.reference_no}
              onChange={handleChange}
              placeholder="Ref / Document No."
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Godown <span className="text-rose-500">*</span>
            </label>
            <select
              name="godown_id"
              value={formData.godown_id}
              onChange={handleChange}
              className="input input-bordered w-full"
            >
              <option value="">Select Godown</option>
              {godowns.map(g => (
                <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location / Rack
            </label>
            <select
              name="location_rack"
              value={formData.location_rack}
              onChange={handleChange}
              className="input input-bordered w-full"
            >
              <option value="">All</option>
              <option value="A-01-01">A-01-01</option>
              <option value="A-01-02">A-01-02</option>
              <option value="B-02-01">B-02-01</option>
              <option value="B-02-02">B-02-02</option>
              <option value="C-03-01">C-03-01</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Group
            </label>
            <select className="input input-bordered w-full">
              <option value="">All</option>
              <option value="Leather">Leather</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Raw Materials">Raw Materials</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item
            </label>
            <select className="input input-bordered w-full">
              <option value="">All Items</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Item Code
            </label>
            <div className="relative">
              <input
                type="text"
                name="from_item_code"
                value={formData.from_item_code}
                onChange={handleChange}
                placeholder="Search Item Code"
                className="input input-bordered w-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Item Code
            </label>
            <div className="relative">
              <input
                type="text"
                name="to_item_code"
                value={formData.to_item_code}
                onChange={handleChange}
                placeholder="Search Item Code"
                className="input input-bordered w-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch No.
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Batch No."
                className="input input-bordered w-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UOM
            </label>
            <select
              name="uom"
              value={formData.uom}
              onChange={handleChange}
              className="input input-bordered w-full"
            >
              <option value="">All</option>
              {UOM_OPTIONS.map(uom => (
                <option key={uom} value={uom}>{uom}</option>
              ))}
            </select>
          </div>
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

      {/* Stock Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            2. Stock Details
          </h2>
          <div className="flex gap-2">
            <label className="btn btn-primary btn-sm cursor-pointer">
              <Upload className="w-4 h-4" /> Import from Excel
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".xlsx,.xls,.csv"
              />
            </label>
            <button onClick={handleDownloadTemplate} className="btn btn-outline btn-sm">
              <Download className="w-4 h-4" /> Download Template
            </button>
            <button className="btn btn-ghost btn-sm">
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-compact">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap">#</th>
                <th className="whitespace-nowrap">Item Code <span className="text-rose-500">*</span></th>
                <th className="whitespace-nowrap">Item Description</th>
                <th className="whitespace-nowrap">UOM</th>
                <th className="whitespace-nowrap">Batch No.</th>
                <th className="whitespace-nowrap">Location / Rack</th>
                <th className="whitespace-nowrap">System Qty</th>
                <th className="whitespace-nowrap">Physical Qty <span className="text-rose-500">*</span></th>
                <th className="whitespace-nowrap">Variance Qty</th>
                <th className="whitespace-nowrap">Variance Value</th>
                <th className="whitespace-nowrap">Remarks</th>
                {!isReadOnly && <th className="whitespace-nowrap">Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={!isReadOnly ? 12 : 11} className="text-center text-gray-500 py-4">
                    No items added. Click "Add Row" to add items.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const isSelected = selectedItemIndex === index;
                  return (
                    <tr key={item.seq} className="hover:bg-gray-50">
                      <td>{index + 1}</td>
                      <td className="relative">
                        <input
                          type="text"
                          value={item.item_code}
                          onChange={(e) => updateItemField(item.seq, 'item_code', e.target.value)}
                          onFocus={() => openItemSearch(index)}
                          placeholder="Select Item"
                          className="input input-bordered input-sm w-32"
                          disabled={isReadOnly}
                        />
                        {isSelected && showItemDropdown && (
                          <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto w-64">
                            <div className="relative p-2">
                              <input
                                type="text"
                                value={itemSearchQuery}
                                onChange={(e) => setItemSearchQuery(e.target.value)}
                                placeholder="Search items..."
                                className="input input-bordered input-sm w-full pr-8"
                                autoFocus
                              />
                              <X
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                                onClick={() => {
                                  setShowItemDropdown(false);
                                  setSelectedItemIndex(null);
                                  setItemSearchQuery('');
                                }}
                              />
                            </div>
                            {filteredItems.map(m => (
                              <div
                                key={m.id}
                                onClick={() => handleSelectItem(m, index)}
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                              >
                                <div className="font-medium">{m.code} - {m.name}</div>
                                <div className="text-xs text-gray-500">{m.uom}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{item.item_description}</td>
                      <td>{item.uom}</td>
                      <td>{item.batch_no || '-'}</td>
                      <td>{item.location_rack || '-'}</td>
                      <td className="text-right">{item.system_qty.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          value={item.physical_qty}
                          onChange={(e) => updatePhysicalQty(item.seq, Number(e.target.value))}
                          className="input input-bordered input-sm w-24 text-right"
                          disabled={isReadOnly}
                        />
                      </td>
                      <td className={`text-right font-medium ${
                        item.variance_qty >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.variance_qty >= 0 ? '+' : ''}{item.variance_qty.toFixed(2)}
                      </td>
                      <td className={`text-right font-medium ${
                        item.variance_value >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.variance_value >= 0 ? '+' : ''}{item.variance_value.toFixed(2)}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.remarks || ''}
                          onChange={(e) => updateItemField(item.seq, 'remarks', e.target.value)}
                          className="input input-bordered input-sm w-32"
                          disabled={isReadOnly}
                        />
                      </td>
                      {!isReadOnly && (
                        <td className="whitespace-nowrap">
                          <button
                            onClick={() => removeRow(item.seq)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={6} className="text-right font-medium">Total Items:</td>
                <td className="text-center font-bold">{summary.totalItems}</td>
                <td colSpan={4}></td>
              </tr>
              <tr>
                <td colSpan={6} className="text-right font-medium">Matched Items:</td>
                <td className="text-center">{summary.matchedItems}</td>
                <td colSpan={4}></td>
              </tr>
              <tr>
                <td colSpan={6} className="text-right font-medium">Variance Items:</td>
                <td className="text-center">{summary.varianceItems}</td>
                <td colSpan={4}></td>
              </tr>
              <tr>
                <td colSpan={6} className="text-right font-medium">Total Variance Value:</td>
                <td colSpan={5} className="text-right">
                  <span className={`font-bold ${summary.totalVarianceValue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {summary.totalVarianceValue >= 0 ? '+' : ''}{summary.totalVarianceValue.toFixed(2)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {!isReadOnly && (
          <button onClick={addRow} className="btn btn-primary btn-sm mt-4">
            <Plus className="w-4 h-4" /> Add Row
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          3. Summary
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">{summary.totalItems}</div>
            <div className="text-sm font-medium text-blue-700 mt-1">Total Items</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
            <div className="text-3xl font-bold text-emerald-600">{summary.matchedItems}</div>
            <div className="text-sm font-medium text-emerald-700 mt-1">Matched Items</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
            <div className="text-3xl font-bold text-rose-600">{summary.varianceItems}</div>
            <div className="text-sm font-medium text-rose-700 mt-1">Variance Items</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
            <div className="text-3xl font-bold text-amber-600">{summary.totalVarianceValue.toFixed(2)}</div>
            <div className="text-sm font-medium text-amber-700 mt-1">Total Variance Value</div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Prices are as per approved supplier agreements.</li>
            <li>• Current Price is effective from 16-05-2024</li>
            <li>• Review date is monthly unless specified.</li>
          </ul>
        </div>
      </div>

      {/* Back and Save buttons */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/physical-stock-entry')} className="btn btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Back to List
        </button>
        {!isReadOnly && (
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Entry</>}
          </button>
        )}
      </div>
    </div>
  );
}
