import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus, Save, X, Edit2, Trash2, ArrowLeft, FlaskConical, RotateCcw,
  ClipboardList, Settings, Paperclip, MessageSquare, Send,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useDropdowns } from '../lib/useDropdowns';
import { usePermission } from '../lib/usePermission';
import api from '../lib/api';

interface ProcessStage {
  id?: number;
  seq: number;
  process_stage: string;
  process_stage_id?: number | null;
  process_stage_name?: string;
  machine: string;
  machine_id?: number | null;
  machine_name?: string;
  duration: number;
  temperature: string;
  speed: string;
  qc_check: boolean;
  remarks: string;
}

interface RecipeItem {
  id?: number;
  material_id: number;
  material_code: string;
  material_name: string;
  uom: string;
  qty: number;
}

interface RecipeAttachment {
  id?: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface Recipe {
  id?: number;
  code: string;
  name: string;
  product_id?: number | null;
  product_name?: string;
  leather_type: string;
  leather_type_id?: number | null;
  leather_type_name?: string;
  thickness: string;
  thickness_id?: number | null;
  thickness_name?: string;
  process_type: string;
  color: string;
  color_id?: number | null;
  color_name?: string;
  finish_type: string;
  finish_type_id?: number | null;
  finish_type_name?: string;
  uom: string;
  uom_id?: number | null;
  uom_name?: string;
  status: string;
  valid_from: string;
  valid_to: string;
  version: number;
  description: string;
  remarks?: string;
  items?: RecipeItem[];
  stages?: ProcessStage[];
  attachments?: RecipeAttachment[];
}

interface Material {
  id: number;
  code: string;
  name: string;
  uom: string;
  type: string;
}

interface StageParameter {
  id: number;
  parameter_name: string;
  unit: string;
  default_value: string;
  min_value: string;
  max_value: string;
  required: boolean;
}

const emptyRecipe: Recipe = {
  code: '', name: '', product_id: null, leather_type: '', thickness: '',
  process_type: 'finishing', color: '', finish_type: '', uom: '', uom_id: null,
  status: 'active', valid_from: '', valid_to: '', version: 1, description: '', remarks: '',
};

export default function RecipeCreationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const { canWrite, isReadOnly } = usePermission();

  const [formData, setFormData] = useState<Recipe>(emptyRecipe);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [attachments, setAttachments] = useState<RecipeAttachment[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [statusToggle, setStatusToggle] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [originalVersion, setOriginalVersion] = useState<number>(1);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showPostConfirm, setShowPostConfirm] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecipeItem | null>(null);
  const [itemForm, setItemForm] = useState({ material_id: '', qty: '' });

  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null);
  const [stageForm, setStageForm] = useState({
    seq: '1', process_stage_id: '', machine_id: '', duration: '', temperature: '', speed: '', qc_check: false, remarks: ''
  });
  const [stageParameters, setStageParameters] = useState<StageParameter[]>([]);

  const [activeDetailTab, setActiveDetailTab] = useState<'items' | 'stages' | 'attachments' | 'remarks'>('items');

  const dropdowns = useDropdowns(['products', 'leather-types', 'uom', 'thickness', 'colors', 'finish-types', 'process-stages', 'machines']);

  const [bomList, setBomList] = useState<{ id: number; code: string; name: string; product_id: number | null; product_name: string; leather_type: string; process_type: string; thickness: string; uom: string; version: number }[]>([]);

  const fetchBomList = useCallback(async () => {
    try {
      const res = await api<{ data: any[] }>('/boms?limit=500&status=Active');
      setBomList((res.data || []).map((b: any) => ({
        id: b.id, code: b.code, name: b.name, product_id: b.product_id,
        product_name: b.product_name || '', leather_type: b.leather_type || '',
        process_type: b.process_type || '', thickness: b.thickness || '',
        uom: b.uom || '', version: b.version || 1,
      })));
    } catch { setBomList([]); }
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await api<{ data: Material[] }>('/materials?limit=500');
      setMaterials(res.data || []);
    } catch { setMaterials([]); }
  }, []);

  useEffect(() => { fetchMaterials(); fetchBomList(); }, [fetchMaterials, fetchBomList]);

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const fetchRecipe = useCallback(async () => {
    if (isNew) return;
    try {
      setLoading(true);
      const detail = await api<{ data: Recipe & { items: RecipeItem[]; stages: ProcessStage[]; attachments: RecipeAttachment[] } }>(`/recipes/${id}`);
      const recipe = detail.data;
      setFormData({
        ...emptyRecipe,
        ...recipe,
        valid_from: formatDate(recipe.valid_from),
        valid_to: formatDate(recipe.valid_to),
      });
      setOriginalVersion(recipe.version || 1);
      setHasChanges(false);
      setIsPosted(recipe.status === 'posted' || recipe.status === 'Posted');
      setStatusToggle(recipe.status === 'active' || recipe.status === 'Active' || recipe.status === 'posted' || recipe.status === 'Posted');
      setRecipeItems(detail.data.items || []);
      setStages(detail.data.stages || []);
      setAttachments(detail.data.attachments || []);
    } catch {
      toast.error('Failed to load recipe');
      navigate('/recipe-creation');
    } finally { setLoading(false); }
  }, [id, isNew, navigate]);

  useEffect(() => { fetchRecipe(); }, [fetchRecipe]);

  const updateField = (field: keyof Recipe, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!isNew && !hasChanges && field !== 'version') {
      setHasChanges(true);
      setFormData((prev) => ({ ...prev, [field]: value, version: originalVersion + 1 }));
    }
  };

  const handleProductChange = async (bomId: string) => {
    const bom = bomList.find(b => b.id === Number(bomId));
    if (bom) {
      setFormData(prev => ({
        ...prev,
        product_id: bom.id,
        name: prev.name || bom.name,
        leather_type: bom.leather_type || prev.leather_type,
        thickness: bom.thickness || prev.thickness,
        process_type: bom.process_type || prev.process_type,
        uom: bom.uom || prev.uom,
      }));
      // Load BOM items as recipe items
      try {
        const res = await api<{ data: any }>(`/boms/${bom.id}`);
        const bomItems = res.data?.items || [];
        if (bomItems.length > 0) {
          const items: RecipeItem[] = bomItems.map((item: any) => ({
            id: Date.now() + Math.random(),
            material_id: item.material_id || item.machine_id,
            material_code: item.material_code || '',
            material_name: item.material_name || '',
            uom: item.uom || '',
            qty: Number(item.qty) || 0,
          }));
          setRecipeItems(items);
        }
      } catch {}
    } else {
      setFormData(prev => ({ ...prev, product_id: null }));
    }
  };

  const handleSave = async () => {
    if (!formData.name) { toast.error('Recipe Name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'active' : 'inactive' };
      if (!isNew) {
        const res = await api(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Recipe updated successfully!');
      } else {
        const res = await api('/recipes', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Recipe created successfully!');
      }
      navigate('/recipe-creation');
    } catch (err) {
      toast.error('Failed to save recipe: ' + (err as Error).message);
    } finally { setSaving(false); }
  };

  const handlePost = async () => {
    if (!formData.id) return;
    setPosting(true);
    try {
      await api(`/recipes/${formData.id}`, { method: 'PUT', body: JSON.stringify({ ...formData, status: 'posted' }) });
      toast.success('Recipe posted successfully!');
      setIsPosted(true);
      setShowPostConfirm(false);
    } catch (err) {
      toast.error('Failed to post recipe: ' + (err as Error).message);
    } finally { setPosting(false); }
  };

  // Item CRUD
  const openAddItem = () => {
    setSelectedItem(null);
    setItemForm({ material_id: '', qty: '' });
    setShowItemModal(true);
  };

  const openEditItem = (item: RecipeItem) => {
    setSelectedItem(item);
    setItemForm({ material_id: String(item.material_id), qty: String(item.qty) });
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.material_id || !itemForm.qty) {
      toast.error('Material and Qty are required');
      return;
    }
    const material = materials.find(m => m.id === Number(itemForm.material_id));
    if (!material) return;
    const qty = parseFloat(itemForm.qty) || 0;

    try {
      if (!isNew && formData.id) {
        const payload = { material_id: Number(itemForm.material_id), qty };
        if (selectedItem?.id) {
          await api(`/recipes/${formData.id}/items/${selectedItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          toast.success('Item updated!');
        } else {
          await api(`/recipes/${formData.id}/items`, { method: 'POST', body: JSON.stringify(payload) });
          toast.success('Item added!');
        }
        const detail = await api<{ data: Recipe & { items: RecipeItem[] } }>(`/recipes/${formData.id}`);
        setRecipeItems(detail.data.items || []);
      } else {
        const newItem: RecipeItem = {
          id: Date.now(),
          material_id: material.id,
          material_code: material.code,
          material_name: material.name,
          uom: material.uom,
          qty,
        };
        if (selectedItem?.id) {
          setRecipeItems(prev => prev.map(i => i.id === selectedItem.id ? newItem : i));
        } else {
          setRecipeItems(prev => [...prev, newItem]);
        }
      }
      setShowItemModal(false);
    } catch (err) {
      toast.error('Failed to save item: ' + (err as Error).message);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      if (!isNew && formData.id) {
        await api(`/recipes/${formData.id}/items/${itemId}`, { method: 'DELETE' });
        const detail = await api<{ data: Recipe & { items: RecipeItem[] } }>(`/recipes/${formData.id}`);
        setRecipeItems(detail.data.items || []);
      } else {
        setRecipeItems(prev => prev.filter(i => i.id !== itemId));
      }
      toast.success('Item deleted!');
    } catch (err) {
      toast.error('Failed to delete item: ' + (err as Error).message);
    }
  };

  // Stage CRUD
  const openAddStage = () => {
    setSelectedStage(null);
    setStageForm({ seq: String(stages.length + 1), process_stage_id: '', machine_id: '', duration: '', temperature: '', speed: '', qc_check: false, remarks: '' });
    setStageParameters([]);
    setShowStageModal(true);
  };

  const openEditStage = (stage: ProcessStage) => {
    setSelectedStage(stage);
    setStageForm({
      seq: String(stage.seq),
      process_stage_id: String(stage.process_stage_id || ''),
      machine_id: String(stage.machine_id || ''),
      duration: String(stage.duration || ''),
      temperature: stage.temperature || '',
      speed: stage.speed || '',
      qc_check: stage.qc_check || false,
      remarks: stage.remarks || '',
    });
    setShowStageModal(true);
  };

  const handleStageChange = async (stageId: string) => {
    setStageForm(prev => ({ ...prev, process_stage_id: stageId }));
    if (stageId) {
      try {
        const res = await api<{ data: StageParameter[] }>(`/recipes/stage-parameters/${stageId}`);
        setStageParameters(res.data || []);
      } catch { setStageParameters([]); }
    } else {
      setStageParameters([]);
    }
  };

  const handleSaveStage = async () => {
    if (!stageForm.process_stage_id) {
      toast.error('Process Stage is required');
      return;
    }
    const processStage = dropdowns['process-stages']?.data.find((s: any) => s.id === Number(stageForm.process_stage_id));
    const machine = dropdowns['machines']?.data.find((m: any) => m.id === Number(stageForm.machine_id));

    try {
      if (!isNew && formData.id) {
        const payload = {
          seq: Number(stageForm.seq) || 1,
          process_stage: processStage?.name || '',
          process_stage_id: Number(stageForm.process_stage_id),
          machine: machine?.name || '',
          machine_id: stageForm.machine_id ? Number(stageForm.machine_id) : null,
          duration: Number(stageForm.duration) || 0,
          temperature: stageForm.temperature,
          speed: stageForm.speed,
          qc_check: stageForm.qc_check,
          remarks: stageForm.remarks,
        };
        if (selectedStage?.id) {
          await api(`/recipes/${formData.id}/stages/${selectedStage.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          toast.success('Stage updated!');
        } else {
          await api(`/recipes/${formData.id}/stages`, { method: 'POST', body: JSON.stringify(payload) });
          toast.success('Stage added!');
        }
        const detail = await api<{ data: Recipe & { stages: ProcessStage[] } }>(`/recipes/${formData.id}`);
        setStages(detail.data.stages || []);
      } else {
        const newStage: ProcessStage = {
          id: Date.now(),
          seq: Number(stageForm.seq) || 1,
          process_stage: processStage?.name || '',
          process_stage_id: Number(stageForm.process_stage_id),
          machine: machine?.name || '',
          machine_id: stageForm.machine_id ? Number(stageForm.machine_id) : null,
          duration: Number(stageForm.duration) || 0,
          temperature: stageForm.temperature,
          speed: stageForm.speed,
          qc_check: stageForm.qc_check,
          remarks: stageForm.remarks,
        };
        if (selectedStage?.id) {
          setStages(prev => prev.map(s => s.id === selectedStage.id ? newStage : s));
        } else {
          setStages(prev => [...prev, newStage]);
        }
      }
      setShowStageModal(false);
    } catch (err) {
      toast.error('Failed to save stage: ' + (err as Error).message);
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    try {
      if (!isNew && formData.id) {
        await api(`/recipes/${formData.id}/stages/${stageId}`, { method: 'DELETE' });
        const detail = await api<{ data: Recipe & { stages: ProcessStage[] } }>(`/recipes/${formData.id}`);
        setStages(detail.data.stages || []);
      } else {
        setStages(prev => prev.filter(s => s.id !== stageId));
      }
      toast.success('Stage deleted!');
    } catch (err) {
      toast.error('Failed to delete stage: ' + (err as Error).message);
    }
  };

  const handleSaveRemarks = async () => {
    if (!isNew && formData.id) {
      try {
        await api(`/recipes/${formData.id}/remarks`, { method: 'PUT', body: JSON.stringify({ remarks: formData.remarks }) });
        toast.success('Remarks saved!');
      } catch (err) {
        toast.error('Failed to save remarks: ' + (err as Error).message);
      }
    }
  };

  const totalQty = recipeItems.reduce((sum, item) => sum + item.qty, 0);

  const recipeItemColumns = [
    { key: 'id', header: '#', width: '40px', render: (_row: RecipeItem, i: number) => <span>{i + 1}</span> },
    { key: 'material_code', header: 'Material Code', width: '130px' },
    { key: 'material_name', header: 'Material Name', width: '200px' },
    { key: 'uom', header: 'UOM', width: '80px' },
    { key: 'qty', header: 'Qty / Sq. Ft.', width: '120px', render: (row: RecipeItem) => <span>{row.qty.toFixed(3)}</span> },
    { key: 'actions', header: 'Action', width: '70px', render: (row: RecipeItem) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEditItem(row)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button onClick={() => handleDeleteItem(row.id!)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  const processStagesColumns = [
    { key: 'id', header: '#', width: '40px', render: (_row: ProcessStage, i: number) => <span>{i + 1}</span> },
    { key: 'seq', header: 'Seq.', width: '50px' },
    { key: 'process_stage', header: 'Process Stage', width: '140px' },
    { key: 'machine', header: 'Machine / Equipment', width: '150px' },
    { key: 'duration', header: 'Duration (Min)', width: '100px' },
    { key: 'temperature', header: 'Temp (°C)', width: '80px' },
    { key: 'speed', header: 'Speed', width: '80px' },
    { key: 'qc_check', header: 'QC Check', width: '80px', render: (row: ProcessStage) => (
      <input type="checkbox" checked={row.qc_check} readOnly className="w-4 h-4 rounded border-gray-300" />
    )},
    { key: 'actions', header: 'Action', width: '70px', render: (row: ProcessStage) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEditStage(row)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button onClick={() => handleDeleteStage(row.id!)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  const detailTabs = [
    { id: 'items' as const, label: 'Recipe Items', icon: <ClipboardList size={14} /> },
    { id: 'stages' as const, label: 'Process Stages', icon: <Settings size={14} /> },
    { id: 'attachments' as const, label: 'Attachments', icon: <Paperclip size={14} /> },
    { id: 'remarks' as const, label: 'Remarks', icon: <MessageSquare size={14} /> },
  ];

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
          <button onClick={() => navigate('/recipe-creation')} className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-white/50">
            <FlaskConical size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isNew ? 'New Recipe' : 'Edit Recipe'}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{formData.code || 'Auto-generated code'}</p>
          </div>
        </div>
        {!isNew && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-blue-100">
            <span className="text-xs text-violet-600 font-medium">Version:</span>
            <span className="text-sm font-bold text-blue-800">{formData.version ?? 1}</span>
          </div>
        )}
      </div>

      {/* Section 1: Recipe Identity */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">1. Recipe Identity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Recipe Code</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
              {formData.code || <span className="italic">Will be auto-generated on save</span>}
            </div>
          </div>
          <Input label="Recipe Name" required value={formData.name || ''} placeholder="Enter name" onChange={(e) => updateField('name', e.target.value)} />
          <Select
            label="BOM Name"
            options={[
              { value: '', label: bomList.length === 0 ? 'Loading...' : 'Select BOM' },
              ...bomList.map(b => ({ value: String(b.id), label: `${b.code} - ${b.name} (V${b.version})` })),
            ]}
            value={String(formData.product_id || '')}
            onChange={(e) => handleProductChange(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Version</label>
            <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold min-h-[34px] flex items-center">
              {!isNew ? formData.version : 1}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Process & Finish */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">2. Process & Finish</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Select
            label="Process Type"
            required
            options={[
              { value: 'finishing', label: 'Finishing' },
              { value: 'tanning', label: 'Tanning' },
              { value: 'dyeing', label: 'Dyeing' },
            ]}
            value={formData.process_type || 'finishing'}
            onChange={(e) => updateField('process_type', e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Leather Type</label>
            <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.leather_type ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              {formData.leather_type || <span className="italic">Auto-filled from product</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Thickness</label>
            <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.thickness ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              {formData.thickness || <span className="italic">Auto-filled from product</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Color</label>
            <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.color ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              {formData.color || <span className="italic">Auto-filled from product</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Finish Type</label>
            <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.finish_type ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              {formData.finish_type || <span className="italic">Auto-filled from product</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">UOM</label>
            <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.uom ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              {formData.uom || <span className="italic">Auto-filled from product</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Input label="Valid From" type="date" value={formData.valid_from || ''} onChange={(e) => updateField('valid_from', e.target.value)} />
          <Input label="Valid To" type="date" value={formData.valid_to || ''} onChange={(e) => updateField('valid_to', e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-900 mb-1">Description / Notes</label>
          <textarea
            rows={2}
            value={formData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Enter description or notes..."
            className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
        </div>
      </div>

      {/* Section 3: Detail Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">3. Recipe Details</h2>
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
          {detailTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDetailTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2 ${activeDetailTab === tab.id ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Items */}
        {activeDetailTab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Total Qty: <strong>{totalQty.toFixed(3)}</strong></span>
              <button onClick={() => setRecipeItems(prev => [...prev, { id: Date.now(), material_id: 0, material_code: '', material_name: '', uom: '', qty: 0 }])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-8">#</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 min-w-[220px]">Material</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-20">UOM</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-24">Qty / Sq.Ft.</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipeItems.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No items. Click "Add Row" to start or select a BOM.</td></tr>
                  ) : recipeItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-blue-50/20">
                      <td className="py-1.5 px-2 text-gray-500">{idx + 1}</td>
                      <td className="py-1.5 px-2">
                        <select
                          value={String(item.material_id || '')}
                          onChange={(e) => {
                            const mat = materials.find(m => m.id === Number(e.target.value));
                            setRecipeItems(prev => prev.map(i => i.id === item.id ? { ...i, material_id: Number(e.target.value), material_code: mat?.code || '', material_name: mat?.name || '', uom: mat?.uom || i.uom } : i));
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="">Select material...</option>
                          {materials.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
                        </select>
                      </td>
                      <td className="py-1.5 px-2 text-gray-600">{item.uom || '-'}</td>
                      <td className="py-1.5 px-2">
                        <input type="number" step="0.001" value={item.qty || ''} onChange={(e) => setRecipeItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: Number(e.target.value) || 0 } : i))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      </td>
                      <td className="py-1.5 px-2">
                        <button onClick={() => handleDeleteItem(item.id!)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Stages */}
        {activeDetailTab === 'stages' && (
          <div>
            <div className="flex items-center justify-end mb-3">
              <button onClick={openAddStage} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                <Plus size={12} /> Add Stage
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-8">#</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-12">Seq</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 min-w-[140px]">Process Stage</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 min-w-[140px]">Machine</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-20">Duration</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-16">Temp</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-16">Speed</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-12">QC</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-600 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stages.length === 0 ? (
                    <tr><td colSpan={9} className="py-8 text-center text-gray-400">No stages. Click "Add Stage" to define process steps.</td></tr>
                  ) : stages.map((stage, idx) => (
                    <tr key={stage.id} className="hover:bg-blue-50/20">
                      <td className="py-1.5 px-2 text-gray-500">{idx + 1}</td>
                      <td className="py-1.5 px-2 text-gray-700">{stage.seq}</td>
                      <td className="py-1.5 px-2 text-gray-700 font-medium">{stage.process_stage || stage.process_stage_name || '-'}</td>
                      <td className="py-1.5 px-2 text-gray-600">{stage.machine || stage.machine_name || '-'}</td>
                      <td className="py-1.5 px-2 text-gray-600">{stage.duration} min</td>
                      <td className="py-1.5 px-2 text-gray-600">{stage.temperature || '-'}</td>
                      <td className="py-1.5 px-2 text-gray-600">{stage.speed || '-'}</td>
                      <td className="py-1.5 px-2">
                        <input type="checkbox" checked={stage.qc_check} readOnly className="w-3.5 h-3.5 rounded border-gray-300" />
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditStage(stage)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteStage(stage.id!)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Attachments */}
        {activeDetailTab === 'attachments' && (
          <div>
            {!isNew && formData.id && (
              <div className="flex items-center justify-end mb-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all cursor-pointer">
                  <Paperclip size={12} /> Upload File
                  <input type="file" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !formData.id) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const token = localStorage.getItem('tannery_token');
                      const apiBase = import.meta.env.VITE_API_BASE || '/api';
                      const res = await fetch(`${apiBase}/recipes/${formData.id}/attachments`, {
                        method: 'POST',
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        body: fd,
                      });
                      if (!res.ok) throw new Error('Upload failed');
                      toast.success('File uploaded!');
                      const detail = await api<{ data: Recipe & { attachments: RecipeAttachment[] } }>(`/recipes/${formData.id}`);
                      setAttachments(detail.data.attachments || []);
                    } catch (err) { toast.error('Upload failed: ' + (err as Error).message); }
                    e.target.value = '';
                  }} />
                </label>
              </div>
            )}
            {isNew && <p className="text-xs text-amber-600 mb-3">Save the recipe first to upload attachments.</p>}
            {attachments.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No attachments uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Paperclip size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-700 font-medium">{att.file_name}</span>
                      <span className="text-[10px] text-gray-400">{(att.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{att.uploaded_at?.split('T')[0]}</span>
                      <button onClick={async () => {
                        if (!formData.id) return;
                        try {
                          await api(`/recipes/${formData.id}/attachments/${att.id}`, { method: 'DELETE' });
                          setAttachments(prev => prev.filter(a => a.id !== att.id));
                          toast.success('Attachment removed');
                        } catch { toast.error('Failed to remove'); }
                      }} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Remarks */}
        {activeDetailTab === 'remarks' && (
          <div>
            <textarea
              rows={4}
              value={formData.remarks || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Enter remarks..."
              className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
            {!isNew && formData.id && (
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="secondary" icon={<Save size={13} />} onClick={handleSaveRemarks}>Save Remarks</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 4: Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">4. Status</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-700">Status</span>
          <button onClick={() => setStatusToggle(!statusToggle)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${statusToggle ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${statusToggle ? 'translate-x-5' : ''}`} />
          </button>
          <span className={`text-xs font-semibold ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>{statusToggle ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-2xl shadow-lg p-4 flex items-center justify-between">
        <button onClick={() => navigate('/recipe-creation')} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
          <RotateCcw size={13} /> Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={canWrite && !isPosted ? () => setShowPostConfirm(true) : undefined}
            disabled={isNew || isPosted || posting || isReadOnly}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-md transition-all disabled:opacity-50 ${(isNew || isPosted || isReadOnly) ? 'cursor-not-allowed' : 'shadow-emerald-200 hover:shadow-lg active:scale-95'}`}
          >
            <Send size={13} /> {posting ? 'Posting...' : isPosted ? 'Posted' : 'Post'}
          </button>
          <button
            onClick={canWrite && !isPosted ? handleSave : undefined}
            disabled={saving || isReadOnly || isPosted}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md transition-all disabled:opacity-50 ${(isReadOnly || isPosted) ? 'cursor-not-allowed' : 'shadow-blue-200 hover:shadow-lg active:scale-95'}`}
          >
            <Save size={13} /> {saving ? 'Saving...' : isNew ? 'Save Recipe' : 'Update'}
          </button>
        </div>
      </div>

      {/* Stage Modal */}
      {showStageModal && createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center" onClick={() => setShowStageModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl mx-3 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 mb-4">{selectedStage ? 'Edit Stage' : 'Add Stage'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Sequence" type="number" value={stageForm.seq} onChange={(e) => setStageForm(prev => ({ ...prev, seq: e.target.value }))} />
                <Select
                  label="Process Stage"
                  required
                  options={[
                    { value: '', label: 'Select stage' },
                    ...(dropdowns['process-stages']?.options || []),
                  ]}
                  value={stageForm.process_stage_id}
                  onChange={(e) => handleStageChange(e.target.value)}
                />
              </div>
              <Select
                label="Machine / Equipment"
                options={[
                  { value: '', label: 'Select machine (optional)' },
                  ...(dropdowns['machines']?.options || []),
                ]}
                value={stageForm.machine_id}
                onChange={(e) => setStageForm(prev => ({ ...prev, machine_id: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Duration (Min)" type="number" value={stageForm.duration} onChange={(e) => setStageForm(prev => ({ ...prev, duration: e.target.value }))} />
                <Input label="Temp (°C)" value={stageForm.temperature} onChange={(e) => setStageForm(prev => ({ ...prev, temperature: e.target.value }))} />
                <Input label="Speed" value={stageForm.speed} onChange={(e) => setStageForm(prev => ({ ...prev, speed: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={stageForm.qc_check} onChange={(e) => setStageForm(prev => ({ ...prev, qc_check: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
                <label className="text-xs font-medium text-gray-700">QC Check Required</label>
              </div>
              <Input label="Remarks" value={stageForm.remarks} onChange={(e) => setStageForm(prev => ({ ...prev, remarks: e.target.value }))} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowStageModal(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveStage} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{selectedStage ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Post Confirmation Dialog */}
      {showPostConfirm && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Post</h3>
              <p className="text-sm text-gray-600">Once posted, this recipe cannot be edited or deleted. Are you sure you want to continue?</p>
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
        </div>,
        document.body
      )}
    </div>
  );
}
