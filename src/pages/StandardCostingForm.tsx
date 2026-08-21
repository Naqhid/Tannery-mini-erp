import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Plus, FileText, Send, Copy, Printer, Download } from 'lucide-react';
import SearchableSelect from '../components/ui/SearchableSelect';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { usePermission } from '../lib/usePermission';
import api from '../lib/api';

interface CostItem {
  id?: number;
  cost_component_id: number;
  cost_component_group_id: number | null;
  cost_value: number;
  cost_percentage: number;
  cost_component_name?: string;
  group_name?: string;
  category?: string;
  basis?: string;
  rate?: number;
}

interface CostSheet {
  id?: number;
  product_id: number | null;
  bom_id: number | null;
  bom_type: string;
  bom_version: number;
  cost_sheet_no: string;
  cost_sheet_version: number;
  currency: string;
  basis_unit: string;
  total_bom_cost: number;
  total_other_cost: number;
  standard_cost: number;
  status: string;
  prepared_by_name?: string;
  product_name?: string;
  bom_name?: string;
  bom_code?: string;
  effective_from?: string;
  description?: string;
  items: CostItem[];
  variance?: {
    current_cost: number;
    previous_cost: number | null;
    variance: number | null;
    variance_percent: number | string | null;
    message?: string;
    previous_version?: number;
  };
}

interface Product { id: number; name: string; code: string; }
interface BOMOption { id: number; name: string; code: string; process_type: string; version: number; status: string; }
interface Material { id: number; name: string; code: string; group_id?: number; category?: string; }
interface Group { id: number; name: string; }

export default function StandardCostingForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const { canWrite, isReadOnly } = usePermission();

  const [formData, setFormData] = useState<CostSheet>({
    product_id: null, bom_id: null, bom_type: '', bom_version: 1,
    cost_sheet_no: '', cost_sheet_version: 1, currency: 'INR', basis_unit: 'Per Sq.Ft.',
    total_bom_cost: 0, total_other_cost: 0, standard_cost: 0, status: 'Draft',
    effective_from: new Date().toISOString().split('T')[0], description: '', items: [],
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [bomOptions, setBomOptions] = useState<BOMOption[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showPostConfirm, setShowPostConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [scrapPercent, setScrapPercent] = useState(1.5);
  const [orderCostSummary, setOrderCostSummary] = useState<{ completed_sqft: number; cost_per_sqft: number; selling_price_per_sqft: number; variance_per_sqft: number } | null>(null);

  const isPosted = formData.status === 'Posted';
  const user = JSON.parse(localStorage.getItem('tannery_user') || '{}');
  const isAdmin = user?.role_id === 1 || user?.role_id === '1';
  const yieldPercent = (100 - scrapPercent).toFixed(2);

  useEffect(() => {
    api<{ data: Product[] }>('/products?limit=500').then(res => setProducts(res.data || [])).catch(() => {});
    api<{ data: Material[] }>('/materials/dropdown').then(res => setMaterials(res.data || [])).catch(() => {});
    api<{ data: Group[] }>('/group-master?limit=500').then(res => setGroups(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      api<{ data: CostSheet }>(`/standard-costs/${id}`)
        .then(res => {
          setFormData({ ...res.data, items: res.data.items || [] });
          if (res.data.product_id) {
            fetchBomsByProduct(res.data.product_id);
            fetchOrderCostSummary(res.data.product_id);
          }
        })
        .catch(() => toast.error('Failed to load cost sheet'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const fetchBomsByProduct = async (productId: number) => {
    try {
      const res = await api<{ data: BOMOption[] }>(`/boms/by-product/${productId}`);
      setBomOptions(res.data || []);
    } catch { setBomOptions([]); }
  };

  const handleProductChange = async (productId: string) => {
    const pid = Number(productId);
    setFormData(prev => ({ ...prev, product_id: pid, bom_id: null, total_bom_cost: 0 }));
    if (!pid) { setBomOptions([]); setOrderCostSummary(null); return; }
    await fetchBomsByProduct(pid);
    await fetchOrderCostSummary(pid);
    try {
      const res = await api<{ data: { id: number; process_type: string; version: number } }>(`/boms/latest-by-product/${pid}`);
      if (res.data) {
        setFormData(prev => ({ ...prev, bom_id: res.data.id, bom_type: res.data.process_type, bom_version: res.data.version }));
        await fetchBomCost(res.data.id);
      }
    } catch {}
  };

  const fetchOrderCostSummary = async (productId: number) => {
    try {
      const res = await api<{ data: { completed_sqft: number; cost_per_sqft: number; selling_price_per_sqft: number; variance_per_sqft: number } }>(`/standard-costs/order-cost-summary/${productId}`);
      setOrderCostSummary(res.data);
    } catch { setOrderCostSummary(null); }
  };

  const handleBomChange = async (bomId: string) => {
    const bid = Number(bomId);
    const bom = bomOptions.find(b => b.id === bid);
    setFormData(prev => ({ ...prev, bom_id: bid, bom_type: bom?.process_type || '', bom_version: bom?.version || 1 }));
    if (bid) await fetchBomCost(bid);
  };

  const fetchBomCost = async (bomId: number) => {
    try {
      const res = await api<{ data: { total_bom_cost: number } }>(`/standard-costs/bom-cost/${bomId}`);
      const totalBomCost = Number(res.data.total_bom_cost) || 0;
      setFormData(prev => {
        const totalOther = prev.items.reduce((sum, i) => sum + Number(i.cost_value), 0);
        return { ...prev, total_bom_cost: totalBomCost, total_other_cost: totalOther, standard_cost: totalBomCost + totalOther };
      });
    } catch {}
  };

  const addCostItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { cost_component_id: 0, cost_component_group_id: null, cost_value: 0, cost_percentage: 0, category: '', basis: 'Per Sq.Ft.', rate: 0 }],
    }));
  };

  const removeCostItem = (index: number) => {
    setFormData(prev => {
      const items = prev.items.filter((_, i) => i !== index);
      const totalOther = items.reduce((sum, i) => sum + Number(i.cost_value), 0);
      const standardCost = prev.total_bom_cost + totalOther;
      return { ...prev, items, total_other_cost: totalOther, standard_cost: standardCost };
    });
  };

  const updateCostItem = (index: number, field: string, value: number | string | null) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      // Recalculate amount if rate changes
      if (field === 'rate') {
        items[index].cost_value = Number(value) || 0;
      }
      const totalOther = items.reduce((sum, i) => sum + Number(i.cost_value), 0);
      const standardCost = prev.total_bom_cost + totalOther;
      const updatedItems = items.map(item => ({
        ...item,
        cost_percentage: standardCost > 0 ? (Number(item.cost_value) / standardCost) * 100 : 0,
      }));
      return { ...prev, items: updatedItems, total_other_cost: totalOther, standard_cost: standardCost };
    });
  };

  const handleSave = async () => {
    if (!formData.product_id) { toast.error('Product is required'); return; }
    if (!formData.bom_id) { toast.error('BOM is required'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const res = await api<{ data: any; message: string }>('/standard-costs', {
          method: 'POST', body: JSON.stringify({ ...formData, scrap_percent: scrapPercent }),
        });
        toast.success(res.message || 'Cost sheet created!');
        navigate('/standard-costing');
      } else {
        const res = await api<{ data: any; message: string }>(`/standard-costs/${id}`, {
          method: 'PUT', body: JSON.stringify({ ...formData, scrap_percent: scrapPercent }),
        });
        toast.success(res.message || 'Cost sheet updated!');
        navigate('/standard-costing');
      }
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handlePost = async () => {
    setShowPostConfirm(false);
    try {
      await api(`/standard-costs/${id}/post`, { method: 'POST' });
      toast.success('Cost sheet posted!');
      const detail = await api<{ data: CostSheet }>(`/standard-costs/${id}`);
      setFormData({ ...detail.data, items: detail.data.items || [] });
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const handleImportRevision = async () => {
    setShowImportConfirm(false);
    try {
      const res = await api<{ data: { id: number }; message: string }>(`/standard-costs/${id}/import`, { method: 'POST' });
      toast.success(res.message || 'New revision created!');
      navigate(`/standard-costing/${res.data.id}`);
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const handleStatusChange = async (status: string) => {
    if (!isAdmin) { toast.error('Only Admin users can change status'); return; }
    try {
      await api(`/standard-costs/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success('Status updated!');
      setFormData(prev => ({ ...prev, status }));
    } catch (err) { toast.error('Failed: ' + (err as Error).message); }
  };

  const bomPercent = formData.standard_cost > 0 ? (formData.total_bom_cost / formData.standard_cost) * 100 : 0;
  const otherPercent = formData.standard_cost > 0 ? (formData.total_other_cost / formData.standard_cost) * 100 : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate('/standard-costing')} className="text-blue-600 hover:text-blue-800 font-medium">Costing</button>
          <span className="text-gray-400">›</span>
          <span className="text-gray-700 font-semibold">Standard Cost Sheet</span>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Printer size={14} /> Print
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={14} /> Export
              </button>
            </>
          )}
          <button onClick={() => navigate('/standard-costing')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          {!isPosted && (
            <button onClick={handleSave} disabled={saving || isReadOnly}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 shadow-sm">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          {!isNew && !isPosted && (
            <button onClick={() => setShowPostConfirm(true)} disabled={formData.items.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-sm disabled:opacity-50">
              <Send size={14} /> Post
            </button>
          )}
        </div>
      </div>

      {/* Standard Cost Sheet Details - Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-blue-800 mb-4 border-b border-blue-100 pb-2">Standard Cost Sheet Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Product *</label>
            <SearchableSelect
              value={String(formData.product_id || '')}
              onChange={handleProductChange}
              options={products.map(p => ({ value: String(p.id), label: p.name }))}
              placeholder="Select Product"
              disabled={isPosted}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">BOM / Recipe *</label>
            <select value={String(formData.bom_id || '')} onChange={(e) => handleBomChange(e.target.value)} disabled={isPosted || bomOptions.length === 0}
              className="w-full px-2.5 py-[7px] text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:bg-gray-50">
              <option value="">Select BOM</option>
              {bomOptions.map(b => (
                <option key={b.id} value={b.id}>{b.code} - Rev {String(b.version).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Cost Sheet No.</label>
            <input type="text" value={formData.cost_sheet_no || '(Auto-generated)'} readOnly
              className="w-full px-2.5 py-[7px] text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Currency</label>
            <select value={formData.currency} onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))} disabled={isPosted}
              className="w-full px-2.5 py-[7px] text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50">
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Status</label>
            <select value={formData.status} onChange={(e) => {
              if (!isAdmin) { toast.error('Only Admin users can change status'); return; }
              if (!isNew) handleStatusChange(e.target.value);
              else setFormData(prev => ({ ...prev, status: e.target.value }));
            }} disabled={isPosted}
              className="w-full px-2.5 py-[7px] text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50">
              <option value="Draft">Draft</option>
              <option value="In-Process">In-Process</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Approved Status</label>
            <span className={`inline-flex items-center px-2.5 py-[7px] text-xs font-semibold rounded-lg border ${formData.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : formData.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {formData.status}
            </span>
          </div>
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Effective From *</label>
            <input type="date" value={formData.effective_from || ''} onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))} disabled={isPosted}
              className="w-full px-2.5 py-[7px] text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Prepared By *</label>
            <input type="text" value={formData.prepared_by_name || user?.name || 'Costing Dept.'} readOnly
              className="w-full px-2.5 py-[7px] text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Description / Note</label>
            <input type="text" value={formData.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} disabled={isPosted}
              placeholder="Standard cost prepared for export orders..."
              className="w-full px-2.5 py-[7px] text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Main Content: 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. BOM Cost Summary */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-blue-700">1. BOM Cost Summary (Per Piece)</span>
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px]">i</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">BOM Type</th>
                <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-right py-2 text-[10px] font-semibold text-gray-500 uppercase">Cost (INR)</th>
                <th className="text-right py-2 text-[10px] font-semibold text-gray-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 text-gray-700 font-medium">Material Cost<br/><span className="text-[10px] text-gray-400">(Raw & Chemical)</span></td>
                <td className="py-2.5 text-gray-600">Leather, Chemicals, Auxiliaries as per BOM norms.</td>
                <td className="py-2.5 text-right font-semibold text-gray-900">{Number(formData.total_bom_cost).toFixed(2)}</td>
                <td className="py-2.5 text-right text-gray-600">{bomPercent.toFixed(2)} %</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 text-gray-700 font-medium">Packing Materials<br/><span className="text-[10px] text-gray-400">(in BOM)</span></td>
                <td className="py-2.5 text-gray-600">Packing materials as per BOM</td>
                <td className="py-2.5 text-right font-semibold text-gray-900">0.00</td>
                <td className="py-2.5 text-right text-gray-600">0.00 %</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-blue-200">
                <td colSpan={2} className="py-3 text-blue-700 font-bold text-xs">Total BOM Cost (Per Piece)</td>
                <td className="py-3 text-right font-bold text-blue-800 text-sm">{Number(formData.total_bom_cost).toFixed(2)}</td>
                <td className="py-3 text-right font-bold text-blue-700">{bomPercent.toFixed(2)} %</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 2. Cost Components (Other Than BOM) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700">2. Cost Components (Other Than BOM)</span>
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px]">i</span>
            </div>
            {!isPosted && (
              <button onClick={addCostItem} className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                <Plus size={11} /> Add Component
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">Cost Component</th>
                  <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-right py-2 text-[10px] font-semibold text-gray-500 uppercase">Cost (INR)</th>
                  <th className="text-right py-2 text-[10px] font-semibold text-gray-500 uppercase">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-[11px]">No cost components added</td></tr>
                ) : formData.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2">
                      <SearchableSelect
                        value={String(item.cost_component_id || '')}
                        onChange={(val) => updateCostItem(idx, 'cost_component_id', Number(val))}
                        options={materials.map(m => ({ value: String(m.id), label: m.name }))}
                        placeholder="Select"
                        disabled={isPosted}
                      />
                    </td>
                    <td className="py-2">
                      <SearchableSelect
                        value={String(item.cost_component_group_id || '')}
                        onChange={(val) => updateCostItem(idx, 'cost_component_group_id', Number(val) || null)}
                        options={groups.map(g => ({ value: String(g.id), label: g.name }))}
                        placeholder="Select"
                        disabled={isPosted}
                      />
                    </td>
                    <td className="py-2">
                      <input type="number" step="0.01" min="0" value={item.cost_value || ''} onChange={(e) => updateCostItem(idx, 'cost_value', parseFloat(e.target.value) || 0)} disabled={isPosted}
                        className="w-20 px-1.5 py-1 text-[11px] border border-gray-200 rounded text-right focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50" />
                    </td>
                    <td className="py-2 text-right font-medium text-gray-800">{Number(item.cost_value).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-blue-200">
                  <td colSpan={2} className="py-3 text-blue-700 font-bold text-xs">Total Other Cost (Per Piece)</td>
                  <td colSpan={2} className="py-3 text-right font-bold text-blue-800 text-sm">{Number(formData.total_other_cost).toFixed(2)} <span className="text-[10px] font-normal text-gray-500">INR</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 3. Scrap & Yield */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-blue-700">3. Scrap & Yield (Standard)</span>
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px]">i</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Standard Scrap % *</label>
              <div className="flex items-center gap-2">
                <input type="number" step="0.01" min="0" max="100" value={scrapPercent} onChange={(e) => setScrapPercent(parseFloat(e.target.value) || 0)} disabled={isPosted}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50" />
                <span className="text-xs text-gray-500 font-medium">%</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Standard Yield %</label>
              <div className="flex items-center gap-2">
                <input type="text" value={yieldPercent} readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-blue-50 text-blue-700 font-semibold" />
                <span className="text-xs text-gray-500 font-medium">%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Yield % is calculated as 100 - Scrap %</p>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Note</label>
              <p className="text-[11px] text-gray-500">Including process & material scrap</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Standard Cost Summary */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-blue-200 shadow-sm p-5">
          <h3 className="text-xs font-bold text-blue-800 mb-4">Standard Cost Summary (Per Piece)</h3>
          <div className="flex items-center justify-between gap-6">
            {/* Numbers */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 font-medium mb-1">Total BOM Cost (A)</p>
                <p className="text-xl font-bold text-gray-900">{Number(formData.total_bom_cost).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{formData.currency} / Piece</p>
              </div>
              <span className="text-lg text-gray-400 font-light">+</span>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 font-medium mb-1">Other Cost Components (B)</p>
                <p className="text-xl font-bold text-gray-900">{Number(formData.total_other_cost).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{formData.currency} / Piece</p>
              </div>
              <span className="text-lg text-gray-400 font-light">=</span>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 font-medium mb-1">Standard Cost (A + B)</p>
                <p className="text-2xl font-bold text-blue-700">{Number(formData.standard_cost).toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{formData.currency} / Piece</p>
              </div>
            </div>
            {/* Donut Chart */}
            <div className="flex-shrink-0">
              {formData.standard_cost > 0 ? (
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 80 80" className="w-20 h-20">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#e0e7ff" strokeWidth="10" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#2563eb" strokeWidth="10"
                      strokeDasharray={`${bomPercent * 1.885} ${188.5 - bomPercent * 1.885}`}
                      strokeDashoffset="47.12" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="10"
                      strokeDasharray={`${otherPercent * 1.885} ${188.5 - otherPercent * 1.885}`}
                      strokeDashoffset={`${47.12 - bomPercent * 1.885}`} strokeLinecap="round" />
                  </svg>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                      <span className="text-[10px] text-gray-600">BOM Cost (A) <b>{bomPercent.toFixed(2)} %</b></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                      <span className="text-[10px] text-gray-600">Other Cost (B) <b>{otherPercent.toFixed(2)} %</b></span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-400">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Cost Summary */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-orange-200 shadow-sm p-5">
          <h3 className="text-xs font-bold text-orange-700 mb-4">Order Cost Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-medium mb-1">Completed Sq.ft</p>
              <p className="text-lg font-bold text-gray-900">{orderCostSummary ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(orderCostSummary.completed_sqft) : '—'}</p>
              <p className="text-[10px] text-gray-400">From Production</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-medium mb-1">Cost Per Sq.ft</p>
              <p className="text-lg font-bold text-gray-900">{orderCostSummary ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(orderCostSummary.cost_per_sqft) : '—'}</p>
              <p className="text-[10px] text-gray-400">{formData.currency}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-medium mb-1">Selling Price Per Sq.ft</p>
              <p className="text-lg font-bold text-gray-900">{orderCostSummary ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(orderCostSummary.selling_price_per_sqft) : '—'}</p>
              <p className="text-[10px] text-gray-400">{formData.currency}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-medium mb-1">Variance Cost Per Sq.ft</p>
              <p className={`text-lg font-bold ${orderCostSummary && orderCostSummary.variance_per_sqft > 0 ? 'text-red-600' : orderCostSummary && orderCostSummary.variance_per_sqft < 0 ? 'text-emerald-600' : 'text-gray-900'}`}>{orderCostSummary ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(orderCostSummary.variance_per_sqft) : '—'}</p>
              <p className="text-[10px] text-gray-400">{formData.currency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
        <p>Note: All costs are standard rates. Actual cost may vary based on production performance.</p>
        <div className="flex items-center gap-4">
          <span>Created By: {formData.prepared_by_name || user?.name || 'Costing Dept.'}</span>
          {formData.effective_from && <span>Created On: {formData.effective_from}</span>}
        </div>
      </div>

      {/* Import/Revise button for non-posted sheets */}
      {!isNew && !isPosted && (
        <div className="flex justify-end">
          <button onClick={() => setShowImportConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100">
            <Copy size={14} /> Create New Revision
          </button>
        </div>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog open={showPostConfirm} title="Post Cost Sheet" message="Are you sure you want to post this cost sheet? This action cannot be undone — all fields will become read-only." onConfirm={handlePost} onCancel={() => setShowPostConfirm(false)} />
      <ConfirmDialog open={showImportConfirm} title="Create New Revision" message="This will create a new version of this cost sheet. The current version will become read-only historical record." onConfirm={handleImportRevision} onCancel={() => setShowImportConfirm(false)} />
    </div>
  );
}
