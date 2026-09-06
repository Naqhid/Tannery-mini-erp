import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, X, ArrowLeft, Plus, Trash2, Factory, RotateCcw, Info, Minus, Send } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SearchableSelect from '../components/ui/SearchableSelect';
import api from '../lib/api';

interface Warehouse { id: number; code: string; name: string; allow_negative_stock: number; }
interface StockItem { material_id: number; material_name: string; material_code: string; uom: string; current_qty: number; avg_unit_cost: number; }
interface MaterialOption { id: number; name: string; code: string; primary_uom?: string; primary_uom_name?: string; uom?: string; }
interface Item {
  _key: string;
  material_id: string;
  material_code: string;
  material_name: string;
  uom: string;
  required_qty: string;
  issue_qty: string;
  unit_cost: string;
  amount: number;
  remarks: string;
  available_qty: number;
  stock_error: string;
}

interface IssueData {
  id?: number;
  issue_no: string;
  issue_date: string;
  department: string;
  job_order_no: string;
  production_batch: string;
  process_stage: string;
  article: string;
  color: string;
  product_id: string;
  batch_qty: string;
  batch_uom: string;
  batch_description: string;
  warehouse_id: string;
  required_date: string;
  planned_date: string;
  issued_by: string;
  loading_unloading: string;
  other_charges: string;
  remarks: string;
  status: string;
}

interface PlanOption { id: number; plan_no: string; article: string; color: string; planned_qty: number; product_id: number | null; uom: string; }
interface StageOption { id: number; name: string; uom?: string; }
interface DepartmentOption { id: number; code: string; name: string; }
interface PlanStage { id: number; seq: number; stage_id: number | null; stage_name: string; planned_qty: number; stage_uom?: string; }

const emptyItem: Item = { _key: '', material_id: '', material_code: '', material_name: '', uom: '', required_qty: '', issue_qty: '', unit_cost: '', amount: 0, remarks: '', available_qty: 0, stock_error: '' };

const emptyIssue: IssueData = {
  issue_no: '', issue_date: new Date().toISOString().split('T')[0], department: '', job_order_no: '',
  production_batch: '', process_stage: '', article: '', color: '', product_id: '', batch_qty: '', batch_uom: '', batch_description: '',
  warehouse_id: '', required_date: '', planned_date: '', issued_by: '', loading_unloading: '', other_charges: '',
  remarks: '', status: 'Draft',
};

let _kc = 0;
const genKey = () => `row_${++_kc}_${Date.now()}`;

export default function MaterialIssueToBatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [issue, setIssue] = useState<IssueData>(emptyIssue);
  const [items, setItems] = useState<Item[]>([{ ...emptyItem, _key: genKey() }]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [stageOptions, setStageOptions] = useState<StageOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  // Stages that belong to the currently selected production plan. When a plan
  // has multiple stages the Stage dropdown lists all of them and the planned
  // qty / uom follow the selected stage.
  const [planStages, setPlanStages] = useState<PlanStage[]>([]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showPostConfirm, setShowPostConfirm] = useState(false);
  const [searchItem, setSearchItem] = useState('');

  const fetchWarehouses = useCallback(async () => {
    try { const res = await api<{ data: Warehouse[] }>('/warehouses/dropdown'); setWarehouses(res.data || []); }
    catch { setWarehouses([]); }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api<{ data: any[] }>('/production-plans?limit=500&sortBy=id&sortOrder=desc');
      setPlanOptions((res.data || []).map((p: any) => ({
        id: p.id, plan_no: p.plan_no, article: p.article || '', color: p.color || '',
        planned_qty: Number(p.planned_qty) || 0, product_id: p.product_id || null, uom: p.uom || '',
      })));
    } catch { setPlanOptions([]); }
  }, []);

  const fetchStages = useCallback(async () => {
    try { const res = await api<{ data: StageOption[] }>('/process-stages?limit=100'); setStageOptions(res.data || []); }
    catch { setStageOptions([]); }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try { const res = await api<{ data: DepartmentOption[] }>('/departments/dropdown'); setDepartmentOptions(res.data || []); }
    catch { setDepartmentOptions([]); }
  }, []);

  const fetchStock = useCallback(async (whId: string) => {
    if (!whId) { setStockList([]); return; }
    try { const res = await api<{ data: StockItem[] }>(`/warehouses/${whId}/stock`); setStockList(res.data || []); }
    catch { setStockList([]); }
  }, []);

  const fetchMaterials = useCallback(async () => {
    try { const res = await api<{ data: MaterialOption[] }>('/materials/dropdown'); setMaterials(res.data || []); }
    catch { setMaterials([]); }
  }, []);

  const fetchIssue = useCallback(async () => {
    if (isNew) {
      try { const res = await api<{ data: { issue_no: string } }>('/material-issues/next-no'); setIssue((p) => ({ ...p, issue_no: res.data.issue_no })); } catch {}
      return;
    }
    try {
      setLoading(true);
      const res = await api<{ data: any }>(`/material-issues/${id}`);
      const d = res.data;
      setIssue({
        ...emptyIssue, ...d,
        issue_date: d.issue_date?.split('T')[0] || '',
        required_date: d.required_date?.split('T')[0] || '',
        planned_date: d.planned_date?.split('T')[0] || d.required_date?.split('T')[0] || '',
        article: d.article || d.batch_description || '',
        color: d.color || '',
        warehouse_id: String(d.warehouse_id || ''),
        batch_qty: String(d.batch_qty || ''),
        loading_unloading: String(d.loading_unloading || ''),
        other_charges: String(d.other_charges || ''),
      });
      setIsPosted(d.status === 'Posted' || d.status === 'posted');
      setItems((d.items || []).map((it: any) => ({
        _key: genKey(), material_id: String(it.material_id),
        material_code: it.material_code || '', material_name: it.material_name || '',
        uom: it.uom || '', required_qty: String(it.required_qty || ''),
        issue_qty: String(it.issue_qty), unit_cost: String(it.unit_cost),
        amount: parseFloat(it.amount) || 0, remarks: it.remarks || '',
      })));
      fetchStock(String(d.warehouse_id));
      // Reload the plan's stages so the Stage dropdown / planned qty work on edit.
      if (d.production_batch) {
        try {
          const ps = await api<{ data: { stages: PlanStage[] } }>(`/material-issues/plan-stages?plan_no=${encodeURIComponent(d.production_batch)}`);
          setPlanStages((ps.data.stages || []).map((s) => ({ ...s, planned_qty: Number(s.planned_qty) || 0 })));
        } catch { /* ignore */ }
      }
    } catch { toast.error('Failed to load issue'); }
    finally { setLoading(false); }
  }, [id, isNew, fetchStock]);

  useEffect(() => { fetchWarehouses(); fetchPlans(); fetchStages(); fetchDepartments(); fetchMaterials(); fetchIssue(); }, [fetchWarehouses, fetchPlans, fetchStages, fetchDepartments, fetchMaterials, fetchIssue]);
  useEffect(() => { if (issue.warehouse_id) fetchStock(issue.warehouse_id); }, [issue.warehouse_id, fetchStock]);

  // Plan No is only relevant when issuing to the Production department.
  const isProductionDept = (issue.department || '').trim().toLowerCase() === 'production';

  const update = (key: string, value: any) => setIssue((p) => ({ ...p, [key]: value }));

  // When department changes: if not Production, disable plan-based fields and
  // clear the plan-derived values so stale data isn't submitted.
  const handleDepartmentChange = (value: string) => {
    setIssue((p) => {
      const next = { ...p, department: value };
      if (value.trim().toLowerCase() !== 'production') {
        next.production_batch = '';
        next.process_stage = '';
        next.planned_date = '';
        next.batch_qty = '';
        next.batch_uom = '';
      }
      return next;
    });
    if (value.trim().toLowerCase() !== 'production') {
      setPlanStages([]);
    }
  };

  // Fetch the stages of the selected plan and auto-populate stage / planned
  // date / planned qty / uom. Handles single and multiple stages.
  const loadPlanStages = async (planNo: string) => {
    if (!planNo) { setPlanStages([]); return; }
    try {
      const res = await api<{ data: { stages: PlanStage[]; planned_start_date?: string; plan_date?: string } }>(`/material-issues/plan-stages?plan_no=${encodeURIComponent(planNo)}`);
      const stages = (res.data.stages || []).map((s) => ({
        ...s,
        planned_qty: Number(s.planned_qty) || 0,
      }));
      setPlanStages(stages);

      const plannedDate = (res.data.planned_start_date || res.data.plan_date || '').split('T')[0] || '';
      if (stages.length > 0) {
        const first = stages[0];
        setIssue((p) => ({
          ...p,
          process_stage: first.stage_name || '',
          planned_date: plannedDate || p.planned_date,
          batch_qty: first.planned_qty ? String(first.planned_qty) : p.batch_qty,
          batch_uom: first.stage_uom || p.batch_uom,
        }));
      } else {
        setIssue((p) => ({ ...p, planned_date: plannedDate || p.planned_date }));
      }
    } catch {
      setPlanStages([]);
    }
  };

  // When a stage is selected, planned qty and uom follow that stage.
  const handleStageChange = (stageName: string) => {
    const stage = planStages.find((s) => s.stage_name === stageName);
    setIssue((p) => ({
      ...p,
      process_stage: stageName,
      ...(stage ? {
        batch_qty: stage.planned_qty ? String(stage.planned_qty) : p.batch_qty,
        batch_uom: stage.stage_uom || p.batch_uom,
      } : {}),
    }));
  };

  // Handle production plan selection (by plan_no) — populate article, color, planned qty
  const applyPlan = (plan: PlanOption | undefined, planNo: string) => {
    if (plan) {
      setIssue(p => ({
        ...p,
        production_batch: plan.plan_no,
        product_id: plan.product_id ? String(plan.product_id) : '',
        batch_qty: String(plan.planned_qty || ''),
        batch_uom: plan.uom || '',
        batch_description: plan.article || '',
        article: plan.article || '',
        color: plan.color || '',
      }));
      if (plan.product_id) {
        loadBOMItems(String(plan.product_id), String(plan.planned_qty || ''));
      }
    } else {
      // Keep the scanned/typed value even if no match found
      setIssue(p => ({ ...p, production_batch: planNo }));
    }
  };

  const handlePlanNoChange = (planNo: string) => {
    const plan = planOptions.find(p => p.plan_no.toLowerCase() === planNo.trim().toLowerCase());
    applyPlan(plan, planNo);
    // Load the plan's stages so Stage / Planned Date / Planned Qty / UOM
    // auto-populate. Only relevant for the Production department.
    if (planNo.trim()) loadPlanStages(planNo.trim());
  };

  // Handle product change — load BOM items
  const handleProductChange = (productId: string) => {
    setIssue(p => ({ ...p, product_id: productId }));
    if (productId) {
      loadBOMItems(productId, issue.batch_qty);
    } else {
      setItems([{ ...emptyItem, _key: genKey() }]);
    }
  };

  // Load BOM items for a product and calculate required qty
  const loadBOMItems = async (productId: string, batchQty: string) => {
    try {
      const res = await api<{ data: any[] }>(`/material-issues/bom-items/${productId}`);
      if (res.data && res.data.length > 0) {
        const bqty = parseFloat(batchQty) || 0;
        const bomItems: Item[] = res.data.map((item: any) => {
          const bomNormQty = parseFloat(item.qty) || 0;
          const requiredQty = bomNormQty * bqty;
          const unitCost = parseFloat(item.unit_cost) || 0;
          return {
            _key: genKey(),
            material_id: String(item.material_id),
            material_code: item.material_code || '',
            material_name: item.material_name || '',
            uom: item.uom || '',
            required_qty: requiredQty.toFixed(3),
            issue_qty: '',
            unit_cost: unitCost ? String(unitCost) : '',
            amount: 0,
            remarks: '',
          };
        });
        setItems(bomItems);
      } else {
        setItems([{ ...emptyItem, _key: genKey() }]);
      }
    } catch {
      // BOM items not found
      setItems([{ ...emptyItem, _key: genKey() }]);
    }
  };

  const handleMaterialChange = async (key: string, materialId: string) => {
    const material = materials.find((m) => String(m.id) === materialId);
    setItems((prev) => prev.map((it) => it._key !== key ? it : ({
      ...it,
      material_id: materialId,
      material_code: material?.code || '',
      material_name: material?.name || '',
      uom: material?.primary_uom_name || material?.primary_uom || material?.uom || '',
      unit_cost: '', amount: 0, available_qty: 0, stock_error: '',
    })));
    if (!materialId || !issue.warehouse_id) return;
    try {
      const info = await api<{ data: { available_qty: number; avg_rate: number } }>(`/material-issues/item-info/${materialId}?warehouse_id=${issue.warehouse_id}&date=${issue.issue_date}`);
      setItems((prev) => prev.map((it) => it._key !== key ? it : ({
        ...it,
        unit_cost: (info.data.avg_rate || 0).toFixed(2),
        amount: Number(((parseFloat(it.issue_qty) || 0) * (info.data.avg_rate || 0)).toFixed(2)),
        available_qty: info.data.available_qty || 0,
        stock_error: '',
      })));
    } catch { toast.error('Unable to fetch current average rate'); }
  };

  const importPreviousIssue = async () => {
    if (!issue.article) { toast.error('Select or enter an article first'); return; }
    try {
      const res = await api<{ data: any }>(`/material-issues/previous-issue?article=${encodeURIComponent(issue.article)}${id && !isNew ? `&exclude_id=${id}` : ''}`);
      const imported = (res.data.items || []).map((it: any) => ({ _key: genKey(), material_id: String(it.material_id), material_code: it.material_code || '', material_name: it.material_name || '', uom: it.uom || '', required_qty: String(it.required_qty || ''), issue_qty: String(it.issue_qty || ''), unit_cost: String(it.unit_cost || ''), amount: Number(it.amount || 0), remarks: it.remarks || '' }));
      setItems(imported.length ? imported : [{ ...emptyItem, _key: genKey() }]);
      toast.success('Previous issue details imported');
    } catch (err) { toast.error((err as Error).message || 'No previous issue found for this article'); }
  };

  const updateItem = (key: string, field: string, value: any) => {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: value };
      if (field === 'issue_qty' || field === 'unit_cost' || field === 'material_id') {
        const qty = parseFloat(updated.issue_qty) || 0;
        const cost = parseFloat(updated.unit_cost) || 0;
        updated.amount = parseFloat((qty * cost).toFixed(2));
      }
      // Stock validation
      if (field === 'issue_qty') {
        const qty = parseFloat(value) || 0;
        if (qty > updated.available_qty + 0.001 && updated.available_qty >= 0) {
          updated.stock_error = `Insufficient Stock\nAvailable: ${updated.available_qty.toFixed(2)} ${updated.uom || 'Kg'}`;
        } else {
          updated.stock_error = '';
        }
      }
      return updated;
    }));
  };

  const addItem = () => setItems((p) => [...p, { ...emptyItem, _key: genKey() }]);
  const removeItem = (key: string) => setItems((p) => p.length > 1 ? p.filter((it) => it._key !== key) : p);
  const handleClear = () => { setIssue(emptyIssue); setItems([{ ...emptyItem, _key: genKey() }]); };

  const totalItems = items.filter((i) => i.material_id).length;
  const totalRequiredQty = items.reduce((s, i) => s + (parseFloat(i.required_qty) || 0), 0);
  const totalIssueQty = items.reduce((s, i) => s + (parseFloat(i.issue_qty) || 0), 0);
  const totalCost = items.reduce((s, i) => s + (i.amount || 0), 0);
  const loadingUnloading = parseFloat(issue.loading_unloading) || 0;
  const otherCharges = parseFloat(issue.other_charges) || 0;
  const totalOtherCharges = loadingUnloading + otherCharges;
  const grandTotal = totalCost + totalOtherCharges;

  const handleSave = async () => {
    if (!issue.warehouse_id) { toast.error('Warehouse is required'); return; }
    if (!issue.issue_date) { toast.error('Issue date is required'); return; }
    const validItems = items.filter((i) => i.material_id && i.issue_qty);
    if (!validItems.length) { toast.error('At least one item is required'); return; }
    // Frontend stock validation
    const stockErrors = validItems.filter(i => i.stock_error);
    if (stockErrors.length > 0) {
      toast.error(`Insufficient stock for: ${stockErrors.map(i => i.material_name).join(', ')}`);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...issue, status: 'Draft', warehouse_id: Number(issue.warehouse_id), batch_qty: parseFloat(issue.batch_qty) || 0,
        loading_unloading: loadingUnloading, other_charges: otherCharges,
        total_material_cost: totalCost, grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id), uom: i.uom,
          required_qty: parseFloat(i.required_qty) || 0, issue_qty: parseFloat(i.issue_qty) || 0,
          unit_cost: parseFloat(i.unit_cost) || 0, amount: i.amount, remarks: i.remarks || null,
        })),
      };
      if (isNew) {
        const res = await api<{ data: { id: number; issue_no: string }; message: string }>('/material-issues', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material issue saved as Draft!');
        navigate(`/material-issue/${res.data.id}`);
      } else {
        const res = await api(`/material-issues/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Material issue updated!');
      }
    } catch (err) { toast.error('Failed to save: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const handlePost = async () => {
    if (!id || isNew) { toast.error('Please save the record first'); return; }
    if (isPosted) return;
    setPosting(true);
    try {
      const validItems = items.filter((i) => i.material_id && i.issue_qty);
      const payload = {
        ...issue, status: 'Posted', warehouse_id: Number(issue.warehouse_id), batch_qty: parseFloat(issue.batch_qty) || 0,
        loading_unloading: loadingUnloading, other_charges: otherCharges,
        total_material_cost: totalCost, grand_total: grandTotal,
        items: validItems.map((i) => ({
          material_id: Number(i.material_id), uom: i.uom,
          required_qty: parseFloat(i.required_qty) || 0, issue_qty: parseFloat(i.issue_qty) || 0,
          unit_cost: parseFloat(i.unit_cost) || 0, amount: i.amount, remarks: i.remarks || null,
        })),
      };
      await api(`/material-issues/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success('Material issue posted successfully!');
      setIsPosted(true);
      setShowPostConfirm(false);
    } catch (err) { toast.error('Failed to post: ' + (err as Error).message); }
    finally { setPosting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/material-issue')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <Factory size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Material Issue' : 'Edit Material Issue'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{issue.issue_no || 'Auto-generated'}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Issue Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Issue Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1: Issue No | Department */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Issue No.</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {issue.issue_no || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Select label="To Department" required options={[{ value: '', label: 'Select department' }, ...departmentOptions.map(d => ({ value: d.name, label: d.name }))]} value={issue.department} onChange={(e) => handleDepartmentChange(e.target.value)} />

          {/* Row 2: Issue Date | Plan No | Stage | Planned Date */}
          <Input label="Issue Date" type="date" required value={issue.issue_date} onChange={(e) => update('issue_date', e.target.value)} />
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">
              Plan No.{isProductionDept && <span className="text-rose-500"> *</span>}
            </label>
            {isProductionDept ? (
              <SearchableSelect
                options={planOptions.map(p => ({ value: p.plan_no, label: p.plan_no }))}
                value={issue.production_batch}
                onChange={(val) => { update('production_batch', val); handlePlanNoChange(val); }}
                placeholder="Select plan no"
              />
            ) : (
              <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-100 text-gray-400 min-h-[34px] flex items-center cursor-not-allowed">
                Available for Production dept
              </div>
            )}
          </div>
          {(() => {
            // When the selected plan has stages, list them (single or multiple).
            // Otherwise fall back to the master process-stage list.
            const stageSelectOptions = planStages.length > 0
              ? planStages.map(s => ({ value: s.stage_name, label: s.stage_name }))
              : stageOptions.map(s => ({ value: s.name, label: s.name }));
            return (
              <Select
                label="Stage"
                options={[{ value: '', label: 'Select stage' }, ...stageSelectOptions]}
                value={issue.process_stage}
                onChange={(e) => handleStageChange(e.target.value)}
              />
            );
          })()}
          <Input label="Planned Date" type="date" value={issue.planned_date} onChange={(e) => update('planned_date', e.target.value)} />

          {/* Row 3: Planned Qty + UOM | Article | Color | Warehouse */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Planned Qty</label>
              <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-h-[34px] flex items-center">{issue.batch_qty || '-'}</div>
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-700 mb-1">UOM</label>
              <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-h-[34px] flex items-center">{issue.batch_uom || '-'}</div>
            </div>
          </div>
          <Input label="Article" value={issue.article} onChange={(e) => update('article', e.target.value)} />
          <Input label="Color" value={issue.color} onChange={(e) => update('color', e.target.value)} />
          <Select label="Warehouse / Store" required options={[{ value: '', label: 'Select warehouse' }, ...warehouses.map((w) => ({ value: String(w.id), label: `${w.name} (${w.code})` }))]} value={issue.warehouse_id} onChange={(e) => update('warehouse_id', e.target.value)} />
          {/* Row 4: Remarks (spans full or partial) */}
          <div className="lg:col-span-2">
            <Input label="Remarks" value={issue.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Material issued for production." />
          </div>
        </div>
      </div>

      {/* Section 2: Item Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide">2. Item Details</h2><button type="button" onClick={importPreviousIssue} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">Import from Previous Issue</button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Add Item</span>
              <div className="relative">
                <input type="text" value={searchItem} onChange={(e) => setSearchItem(e.target.value)}
                  placeholder="Search item by code / name"
                  className="w-64 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pl-8" />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addItem} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
              <Plus size={14} /> Add Row
            </button>
            <button onClick={() => { const last = items[items.length - 1]; if (last && items.length > 1) removeItem(last._key); }} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all">
              <Minus size={14} /> Remove Row
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Name <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Item Code</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">UOM</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Required Qty</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Issue Qty <span className="text-rose-500">*</span></th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Unit Cost (₹)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Amount (₹)</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Remarks</th>
                <th className="text-center py-3 px-3 text-[11px] font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item._key} className="hover:bg-blue-50/30 transition-all">
                  <td className="py-2.5 px-3 text-xs text-gray-500 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <SearchableSelect
                      options={materials.map((m) => ({ value: String(m.id), label: `${m.code} - ${m.name}` }))}
                      value={item.material_id}
                      onChange={(val) => handleMaterialChange(item._key, val)}
                      placeholder="Search item..."
                    />
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.material_code || '-'}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-700">{item.uom || '-'}</td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.required_qty} onChange={(e) => updateItem(item._key, 'required_qty', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.issue_qty} onChange={(e) => updateItem(item._key, 'issue_qty', e.target.value)}
                      className={`w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 min-w-[80px] text-right ${item.stock_error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'}`} placeholder="0.00" />
                    {item.stock_error && (
                      <div className="mt-1 text-[10px] text-red-600 font-medium leading-tight whitespace-pre-line">{item.stock_error}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <input type="number" value={item.unit_cost} onChange={(e) => updateItem(item._key, 'unit_cost', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[80px] text-right" placeholder="0.00" />
                  </td>
                  <td className="py-2.5 px-3 text-xs font-bold text-gray-700 text-right">{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3">
                    <input value={item.remarks} onChange={(e) => updateItem(item._key, 'remarks', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[60px]" placeholder="-" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={() => removeItem(item._key)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {!issue.warehouse_id && (
                <tr><td colSpan={10} className="py-6 text-center text-xs text-gray-400">Select a warehouse to load available stock</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Summary</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Items</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Required Qty</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalRequiredQty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Issue Qty</span>
              <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{totalIssueQty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          {/* Middle - Other Charges */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">Other Charges</h3>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Loading / Unloading (₹)</span>
              <input type="number" value={issue.loading_unloading} onChange={(e) => update('loading_unloading', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600">Other Charges (₹)</span>
              <input type="number" value={issue.other_charges} onChange={(e) => update('other_charges', e.target.value)}
                className="w-28 px-2 py-1.5 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0.00" />
            </div>
          </div>
          {/* Right - Grand Total */}
          <div className="flex flex-col justify-center items-end space-y-2 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 border border-rose-100">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-gray-700">Total Material Cost (₹)</span>
              <span className="text-sm font-bold text-gray-900">{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-medium text-gray-700">Other Charges (₹)</span>
              <span className="text-sm font-bold text-gray-900">{totalOtherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between w-full pt-2 border-t border-rose-200">
              <span className="text-sm font-bold text-gray-900">Grand Total</span>
              <span className="text-lg font-black text-rose-700">{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        {/* Note */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={13} className="text-gray-400 shrink-0" />
            <span><strong>Note:</strong> Issued material will be deducted from selected warehouse and allocated to the production batch.</span>
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/material-issue')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
          <X size={14} /> Cancel
        </button>
        <button onClick={handleClear} disabled={isPosted} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
          <RotateCcw size={14} /> Clear
        </button>
        <button
          onClick={() => setShowPostConfirm(true)}
          disabled={isNew || isPosted || posting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={14} /> {posting ? 'Posting...' : isPosted ? 'Posted' : 'Post'}
        </button>
        <button onClick={handleSave} disabled={saving || isPosted} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Save size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Post Confirmation Dialog */}
      {showPostConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Post</h3>
              <p className="text-sm text-gray-600">Once posted, this material issue cannot be edited or deleted. Are you sure you want to continue?</p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowPostConfirm(false)}
                className="flex-1 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={posting}
                className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Yes, Post'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
