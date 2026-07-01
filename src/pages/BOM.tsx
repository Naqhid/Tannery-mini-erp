import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Upload, History } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import api from '../lib/api';

interface BOMItemRow {
  id: number;
  material_code: string;
  material_name: string;
  type: string;
  uom: string;
  qty: number;
  unit_cost: number;
  amount: number;
  remarks: string;
}

interface BOM {
  id?: number;
  code: string;
  name: string;
  leather_type: string;
  process_type: string;
  thickness: string;
  uom: string;
  valid_from: string;
  valid_to: string;
  status: string;
  description: string;
}

export default function BOM() {
  const [items, setItems] = useState<BOMItemRow[]>([]);
  const [bom, setBom] = useState<BOM | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBOM = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api<{ data: BOM & { items: BOMItemRow[] } }>('/boms/1');
      setBom(res.data);
      setItems(res.data.items || []);
    } catch {
      // Fallback if API not available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBOM(); }, [fetchBOM]);

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const itemColumns = [
    { key: 'checkbox', header: '', width: '30px', render: () => (
      <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300" />
    )},
    { key: 'id', header: '#', width: '35px' },
    { key: 'material_code', header: 'Material Code', width: '110px' },
    { key: 'material_name', header: 'Material Name', width: '180px' },
    { key: 'type', header: 'Type', width: '80px' },
    { key: 'uom', header: 'UOM', width: '55px' },
    { key: 'qty', header: 'Qty / Sq. Ft.', width: '95px', render: (row: BOMItemRow) => (
      <span>{row.qty.toFixed(3)}</span>
    )},
    { key: 'unit_cost', header: 'Unit Cost (Rs)', width: '100px', render: (row: BOMItemRow) => (
      <span>{row.unit_cost.toFixed(2)}</span>
    )},
    { key: 'amount', header: 'Amount (Rs)', width: '95px', render: (row: BOMItemRow) => (
      <span>{row.amount.toFixed(2)}</span>
    )},
    { key: 'remarks', header: 'Remarks', width: '140px' },
    { key: 'actions', header: 'Action', width: '60px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading BOM...</div>;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bill of Materials (BOM)</h1>
          <p className="text-xs text-gray-500 mt-0.5">BOM / Recipe &gt; BOM</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" icon={<History size={14} />}>Revision History</Button>
          <Button variant="teal" size="sm" icon={<Plus size={14} />}>New Revision</Button>
        </div>
      </div>

      {/* BOM Header + Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        {/* BOM Header Form */}
        <Card title="BOM Header">
          <div className="space-y-3">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input label="BOM / Recipe Code" required defaultValue={bom?.code || ''} />
              <Input label="BOM / Recipe Name" required defaultValue={bom?.name || ''} />
              <Input label="Product / Leather" required defaultValue={bom?.name || ''} />
              <Select
                label="Leather Type"
                options={[
                  { value: 'cow', label: 'Cow' },
                  { value: 'buffalo', label: 'Buffalo' },
                  { value: 'goat', label: 'Goat' },
                ]}
                defaultValue={bom?.leather_type || 'cow'}
              />
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Process Type"
                required
                options={[
                  { value: 'finishing', label: 'Finishing' },
                  { value: 'tanning', label: 'Tanning' },
                  { value: 'dyeing', label: 'Dyeing' },
                ]}
                defaultValue={bom?.process_type || 'finishing'}
              />
              <Select
                label="Thickness"
                options={[
                  { value: '1.2-1.4', label: '1.2 - 1.4 mm' },
                  { value: '1.4-1.6', label: '1.4 - 1.6 mm' },
                ]}
                defaultValue={bom?.thickness || '1.2-1.4'}
              />
              <Select
                label="UOM"
                options={[
                  { value: 'sqft', label: 'Sq. Ft.' },
                  { value: 'sqm', label: 'Sq. M.' },
                ]}
                defaultValue={bom?.uom || 'sqft'}
              />
            </div>
            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Valid From" required type="date" defaultValue={bom?.valid_from || ''} />
              <Input label="Valid To" type="date" defaultValue={bom?.valid_to || ''} />
              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Status</label>
                <span className="inline-flex px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">Active</span>
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Description / Notes</label>
              <textarea
                rows={2}
                defaultValue={bom?.description || ''}
                className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>
        </Card>

        {/* BOM Summary */}
        <Card title="BOM Summary">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Total Items</span>
              <span className="text-xs font-semibold text-gray-900">:</span>
              <span className="text-xs font-semibold text-gray-900">{items.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Total Qty</span>
              <span className="text-xs font-semibold text-gray-900">:</span>
              <span className="text-xs font-semibold text-gray-900">{totalQty.toFixed(3)} (per Sq. Ft.)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Total Chemical Cost</span>
              <span className="text-xs font-semibold text-gray-900">:</span>
              <span className="text-xs font-semibold text-gray-900">Rs 38.42 / Sq. Ft.</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs text-gray-500">Total Other Cost</span>
              <span className="text-xs font-semibold text-gray-900">:</span>
              <span className="text-xs font-semibold text-gray-900">Rs 2.80 / Sq. Ft.</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-bold text-gray-900">Total Cost</span>
              <span className="text-xs font-bold text-gray-900">:</span>
              <span className="text-xs font-bold text-gray-900">Rs {totalAmount.toFixed(2)} / Sq. Ft.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* BOM Items Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-gray-900">BOM Items</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="teal" icon={<Plus size={14} />}>Add Item</Button>
            <Button size="sm" variant="outline" icon={<Upload size={14} />}>Import from Template</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />}>Remove</Button>
          </div>
        </div>

        <Table columns={itemColumns} data={items} />

        {/* Total Row */}
        <div className="flex items-center justify-end gap-6 border-t border-gray-200 mt-1 pt-2 text-xs font-semibold text-gray-900">
          <span>Total Qty: {totalQty.toFixed(3)}</span>
          <span>Total Amount: ₹{totalAmount.toFixed(2)}</span>
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-amber-600 mt-4">* Qty / Sq. Ft. indicates quantity required per Square Feet</p>
      </Card>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button variant="teal">Save BOM</Button>
      </div>
    </div>
  );
}
