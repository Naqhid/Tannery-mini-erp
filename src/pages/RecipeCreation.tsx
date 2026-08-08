import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Save,
  X,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  FlaskConical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  FileText,
  Paperclip,
  MessageSquare,
  Settings,
  ClipboardList,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportMenu from '../components/ui/ExportMenu';
import { previewPDF, downloadPDF } from '../lib/pdfExport';
import { exportToExcel } from '../lib/excelExport';
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
  product_code?: string;
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

type SortField = 'code' | 'name' | 'leather_type' | 'process_type' | 'status';
type SortOrder = 'asc' | 'desc';

const emptyRecipe: Recipe = {
  code: '', name: '', product_id: null, leather_type: '', thickness: '',
  process_type: 'finishing', color: '', finish_type: '', uom: '', uom_id: null,
  status: 'active', valid_from: '', valid_to: '', version: 1, description: '', remarks: '',
};

export default function RecipeCreation() {
  const { canWrite, isReadOnly } = usePermission();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<Recipe>(emptyRecipe);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [attachments, setAttachments] = useState<RecipeAttachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusToggle, setStatusToggle] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [materials, setMaterials] = useState<Material[]>([]);

  // Item/Stage modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecipeItem | null>(null);
  const [itemForm, setItemForm] = useState({ material_id: '', qty: '' });

  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null);
  const [stageForm, setStageForm] = useState({
    seq: '1', process_stage_id: '', machine_id: '', duration: '', temperature: '', speed: '', qc_check: false, remarks: ''
  });
  const [stageParameters, setStageParameters] = useState<StageParameter[]>([]);

  // Track original version for auto-increment
  const [originalVersion, setOriginalVersion] = useState<number>(1);
  const [hasChanges, setHasChanges] = useState(false);

  // Active tab in recipe detail
  const [activeDetailTab, setActiveDetailTab] = useState<'items' | 'stages' | 'attachments' | 'remarks'>('items');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Dropdowns
  const dropdowns = useDropdowns(['products', 'leather-types', 'uom', 'thickness', 'colors', 'finish-types', 'process-stages', 'machines']);

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    try {
      const res = await api<{ data: Material[] }>('/materials?limit=500');
      setMaterials(res.data || []);
    } catch {
      setMaterials([]);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));
      if (sortBy) {
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
      }
      const res = await api<{ data: Recipe[]; total: number; page: number; totalPages: number }>(`/recipes?${params.toString()}`);
      setRecipes(res.data || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, pageSize, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number } }>('/recipes/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, sortOrder, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronsUpDown size={12} className="text-gray-700 group-hover:text-gray-900" />;
    return sortOrder === 'asc'
      ? <ArrowUp size={12} className="text-blue-600" />
      : <ArrowDown size={12} className="text-blue-600" />;
  };

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const openPanel = async (recipe?: Recipe) => {
    if (recipe) {
      setSelectedRecipe(recipe);
      setFormData({
        ...emptyRecipe,
        ...recipe,
        valid_from: formatDate(recipe.valid_from),
        valid_to: formatDate(recipe.valid_to),
      });
      setOriginalVersion(recipe.version || 1);
      setHasChanges(false);
      setStatusToggle(recipe.status === 'active' || recipe.status === 'Active');
      try {
        const detail = await api<{ data: Recipe & { items: RecipeItem[]; stages: ProcessStage[]; attachments: RecipeAttachment[] } }>(`/recipes/${recipe.id}`);
        setRecipeItems(detail.data.items || []);
        setStages(detail.data.stages || []);
        setAttachments(detail.data.attachments || []);
      } catch {
        setRecipeItems([]);
        setStages([]);
        setAttachments([]);
      }
    } else {
      setSelectedRecipe(null);
      setFormData(emptyRecipe);
      setOriginalVersion(1);
      setHasChanges(false);
      setStatusToggle(true);
      setRecipeItems([]);
      setStages([]);
      setAttachments([]);
    }
    setActiveDetailTab('items');
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const payload = { ...formData, status: statusToggle ? 'active' : 'inactive' };
      if (selectedRecipe?.id) {
        const res = await api(`/recipes/${selectedRecipe.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success(res.message || 'Recipe updated successfully!', { position: 'top-right', autoClose: 3000 });
      } else {
        const res = await api('/recipes', { method: 'POST', body: JSON.stringify(payload) });
        toast.success(res.message || 'Recipe created successfully!', { position: 'top-right', autoClose: 3000 });
      }
      setShowPanel(false);
      setSearchQuery('');
      setCurrentPage(1);
      fetchRecipes();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save recipe: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: null });
    if (!id) return;
    try {
      const res = await api(`/recipes/${id}`, { method: 'DELETE' });
      toast.success(res.message || 'Recipe deleted successfully!', { position: 'top-right', autoClose: 3000 });
      setShowPanel(false);
      setSearchQuery('');
      setCurrentPage(1);
      fetchRecipes();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete recipe: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    }
  };

  const updateField = (field: keyof Recipe, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Auto-increment version when editing an existing recipe
    if (selectedRecipe && !hasChanges && field !== 'version') {
      setHasChanges(true);
      setFormData((prev) => ({ ...prev, [field]: value, version: originalVersion + 1 }));
    }
  };

  // Handle product selection and auto-populate
  const handleProductChange = async (productId: string) => {
    const product = dropdowns['products']?.data.find((p: any) => p.id === Number(productId));
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_id: product.id,
        name: prev.name || product.name,
        leather_type: product.leather_type || prev.leather_type,
        leather_type_id: product.leather_type_id || prev.leather_type_id,
        thickness: product.thickness || prev.thickness,
        thickness_id: product.thickness_id || prev.thickness_id,
        finish_type: product.finish_type || prev.finish_type,
        finish_type_id: product.finish_type_id || prev.finish_type_id,
        uom: product.uom || prev.uom,
        uom_id: product.uom_id || prev.uom_id,
        color: product.color || prev.color,
        color_id: product.color_id || prev.color_id,
      }));
      // Load BOM items if product is selected
      try {
        const res = await api<{ data: any[] }>(`/recipes/bom-items/${product.id}`);
        if (res.data && res.data.length > 0) {
          const bomItems = res.data.map((item: any) => ({
            id: Date.now() + Math.random(),
            material_id: item.material_id,
            material_code: item.material_code,
            material_name: item.material_name,
            uom: item.uom,
            qty: item.qty,
          }));
          setRecipeItems(bomItems);
        }
      } catch {
        // BOM items not found
      }
    } else {
      setFormData(prev => ({ ...prev, product_id: null }));
    }
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
      toast.error('Material and Qty are required', { position: 'top-right', autoClose: 3000 });
      return;
    }
    const material = materials.find(m => m.id === Number(itemForm.material_id));
    if (!material) return;

    const qty = parseFloat(itemForm.qty) || 0;

    try {
      if (selectedRecipe?.id) {
        const payload = { material_id: Number(itemForm.material_id), qty };
        if (selectedItem?.id) {
          await api(`/recipes/${selectedRecipe.id}/items/${selectedItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          toast.success('Item updated!', { position: 'top-right', autoClose: 2000 });
        } else {
          await api(`/recipes/${selectedRecipe.id}/items`, { method: 'POST', body: JSON.stringify(payload) });
          toast.success('Item added!', { position: 'top-right', autoClose: 2000 });
        }
        const detail = await api<{ data: Recipe & { items: RecipeItem[] } }>(`/recipes/${selectedRecipe.id}`);
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
      toast.error('Failed to save item: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      if (selectedRecipe?.id) {
        await api(`/recipes/${selectedRecipe.id}/items/${itemId}`, { method: 'DELETE' });
        const detail = await api<{ data: Recipe & { items: RecipeItem[] } }>(`/recipes/${selectedRecipe.id}`);
        setRecipeItems(detail.data.items || []);
      } else {
        setRecipeItems(prev => prev.filter(i => i.id !== itemId));
      }
      toast.success('Item deleted!', { position: 'top-right', autoClose: 2000 });
    } catch (err) {
      toast.error('Failed to delete item: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
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
      } catch {
        setStageParameters([]);
      }
    } else {
      setStageParameters([]);
    }
  };

  const handleSaveStage = async () => {
    if (!stageForm.process_stage_id) {
      toast.error('Process Stage is required', { position: 'top-right', autoClose: 3000 });
      return;
    }
    const processStage = dropdowns['process-stages']?.data.find((s: any) => s.id === Number(stageForm.process_stage_id));
    const machine = dropdowns['machines']?.data.find((m: any) => m.id === Number(stageForm.machine_id));

    try {
      if (selectedRecipe?.id) {
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
          await api(`/recipes/${selectedRecipe.id}/stages/${selectedStage.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          toast.success('Stage updated!', { position: 'top-right', autoClose: 2000 });
        } else {
          await api(`/recipes/${selectedRecipe.id}/stages`, { method: 'POST', body: JSON.stringify(payload) });
          toast.success('Stage added!', { position: 'top-right', autoClose: 2000 });
        }
        const detail = await api<{ data: Recipe & { stages: ProcessStage[] } }>(`/recipes/${selectedRecipe.id}`);
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
      toast.error('Failed to save stage: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    try {
      if (selectedRecipe?.id) {
        await api(`/recipes/${selectedRecipe.id}/stages/${stageId}`, { method: 'DELETE' });
        const detail = await api<{ data: Recipe & { stages: ProcessStage[] } }>(`/recipes/${selectedRecipe.id}`);
        setStages(detail.data.stages || []);
      } else {
        setStages(prev => prev.filter(s => s.id !== stageId));
      }
      toast.success('Stage deleted!', { position: 'top-right', autoClose: 2000 });
    } catch (err) {
      toast.error('Failed to delete stage: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    }
  };

  // Remarks save
  const handleSaveRemarks = async () => {
    if (selectedRecipe?.id) {
      try {
        await api(`/recipes/${selectedRecipe.id}/remarks`, { method: 'PUT', body: JSON.stringify({ remarks: formData.remarks }) });
        toast.success('Remarks saved!', { position: 'top-right', autoClose: 2000 });
      } catch (err) {
        toast.error('Failed to save remarks: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
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
    { key: 'temperature', header: 'Temp (\u00B0C)', width: '80px' },
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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200/50">
            <FlaskConical size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Recipe Creation</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your recipes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-blue-100 shadow-sm">
            <span className="text-xs text-blue-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-blue-800">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-blue-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-blue-800">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm shadow-blue-100/50 overflow-hidden ring-1 ring-blue-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
              />
            </div>
            <button className="p-2 rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-all">
              <Filter size={15} />
            </button>
            <ExportMenu
              onPreview={() => {
                const columns = ['Code', 'Name', 'Product', 'Leather Type', 'Version', 'Status'];
                const rows = recipes.map(r => [r.code, r.name, r.product_name || '-', r.leather_type_name || r.leather_type, `v${r.version}`, r.status]);
                previewPDF({ title: 'Recipe Creation', subtitle: `Total: ${recipes.length} recipes`, columns, rows, accentColor: [139, 92, 246] });
              }}
              onDownload={() => {
                const columns = ['Code', 'Name', 'Product', 'Leather Type', 'Version', 'Status'];
                const rows = recipes.map(r => [r.code, r.name, r.product_name || '-', r.leather_type_name || r.leather_type, `v${r.version}`, r.status]);
                downloadPDF({ title: 'Recipe Creation', subtitle: `Total: ${recipes.length} recipes`, columns, rows, accentColor: [139, 92, 246], fileName: 'Recipe_Creation.pdf' });
              }}
              onExcel={() => {
                exportToExcel({
                  data: recipes,
                  columns: [
                    { key: 'code', header: 'Code' },
                    { key: 'name', header: 'Name' },
                    { key: 'product_name', header: 'Product' },
                    { key: 'leather_type_name', header: 'Leather Type' },
                    { key: 'version', header: 'Version' },
                    { key: 'status', header: 'Status' },
                  ],
                  fileName: 'Recipe_Creation',
                });
              }}
            />
          </div>
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-lg shadow-md transition-all ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 active:scale-95'}`}
            onClick={canWrite ? () => navigate('/recipe-creation/new') : undefined}
            disabled={isReadOnly}
            title={isReadOnly ? 'You have read-only access. Contact admin for write permissions.' : undefined}
          >
            <Plus size={14} />
            Add Recipe
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : recipes.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No recipes found</div>
          ) : recipes.map((r, index) => {
            const cardColors = [
              'border-l-blue-500', 'border-l-indigo-500', 'border-l-sky-500',
              'border-l-rose-500', 'border-l-sky-500', 'border-l-amber-500',
              'border-l-indigo-500', 'border-l-emerald-500',
            ];
            const avatarColors = [
              'bg-blue-500', 'bg-indigo-500', 'bg-sky-500', 'bg-rose-500',
              'bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500',
            ];
            return (
              <div
                key={r.id || r.code}
                className={`p-4 border-l-4 ${cardColors[index % 8]} hover:bg-blue-50/30 transition-all cursor-pointer active:scale-[0.99]`}
                onClick={() => navigate(`/recipe-creation/${r.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl ${avatarColors[index % 8]} flex items-center justify-center text-[10px] font-bold text-white shadow-md shrink-0`}>
                      {r.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                      <p className="text-[11px] text-blue-600 font-mono mt-0.5">{r.code}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    r.status === 'active' || r.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'active' || r.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    {r.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Leather:</span>
                    <span className="text-[11px] text-blue-700 font-medium truncate">{r.leather_type_name || r.leather_type || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Process:</span>
                    <span className="text-[11px] text-blue-600 font-medium capitalize">{r.process_type || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Finish:</span>
                    <span className="text-[11px] text-sky-700 font-medium truncate">{r.finish_type_name || r.finish_type || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Version:</span>
                    <span className="text-[11px] text-amber-600 font-semibold">v{r.version}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-gray-100 pt-2">
                  <button onClick={canWrite && r.status !== 'posted' ? (e) => { e.stopPropagation(); navigate(`/recipe-creation/${r.id}`); } : undefined} disabled={isReadOnly || r.status === 'posted'} title={r.status === 'posted' ? 'Posted - cannot edit' : isReadOnly ? 'Read-only access' : 'Edit'} className={`p-2 rounded-lg transition-all ${isReadOnly || r.status === 'posted' ? 'text-gray-300 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}><Edit2 size={15} /></button>
                  <button onClick={canWrite && r.status !== 'posted' ? (e) => { e.stopPropagation(); r.id && handleDelete(r.id); } : undefined} disabled={isReadOnly || r.status === 'posted'} title={r.status === 'posted' ? 'Posted - cannot delete' : isReadOnly ? 'Read-only access' : 'Delete'} className={`p-2 rounded-lg transition-all ${isReadOnly || r.status === 'posted' ? 'text-gray-300 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-100'}`}><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-blue-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-600 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('code')}><span className="inline-flex items-center gap-1">Code <SortIcon field="code" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-700 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}><span className="inline-flex items-center gap-1">Recipe Name <SortIcon field="name" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('leather_type')}><span className="inline-flex items-center gap-1">Leather Type <SortIcon field="leather_type" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer group select-none" onClick={() => handleSort('process_type')}><span className="inline-flex items-center gap-1">Process Type <SortIcon field="process_type" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-sky-500 uppercase tracking-wider hidden lg:table-cell">Finish Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-amber-500 uppercase tracking-wider hidden xl:table-cell">Version</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}><span className="inline-flex items-center gap-1">Status <SortIcon field="status" /></span></th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : recipes.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No recipes found</td></tr>
              ) : recipes.map((r, index) => (
                <tr key={r.id || r.code} className={`hover:bg-blue-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => navigate(`/recipe-creation/${r.id}`)}>
                  <td className="py-3 px-4 relative">
                    <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${r.status === 'active' || r.status === 'Active' ? 'bg-blue-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-blue-600 font-medium">{r.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        ['bg-blue-500', 'bg-indigo-500', 'bg-sky-500', 'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500'][index % 8]
                      }`}>
                        {r.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-blue-700 font-medium text-xs">{r.leather_type_name || r.leather_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-blue-600 font-medium text-xs capitalize">{r.process_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-100">{r.finish_type_name || r.finish_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-amber-600 font-medium text-xs">v{r.version}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                      r.status === 'active' || r.status === 'Active'
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'active' || r.status === 'Active' ? 'bg-blue-500 animate-pulse' : 'bg-red-400'}`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={canWrite && r.status !== 'posted' ? (e) => { e.stopPropagation(); navigate(`/recipe-creation/${r.id}`); } : undefined} disabled={isReadOnly || r.status === 'posted'} title={r.status === 'posted' ? 'Posted - cannot edit' : isReadOnly ? 'Read-only access' : 'Edit'} className={`p-1.5 rounded-lg transition-all ${isReadOnly || r.status === 'posted' ? 'text-gray-300 cursor-not-allowed' : 'text-blue-400 hover:text-blue-600 hover:bg-blue-100'}`}><Edit2 size={14} /></button>
                      <button onClick={canWrite && r.status !== 'posted' ? (e) => { e.stopPropagation(); r.id && handleDelete(r.id); } : undefined} disabled={isReadOnly || r.status === 'posted'} title={r.status === 'posted' ? 'Posted - cannot delete' : isReadOnly ? 'Read-only access' : 'Delete'} className={`p-1.5 rounded-lg transition-all ${isReadOnly || r.status === 'posted' ? 'text-gray-300 cursor-not-allowed' : 'text-rose-400 hover:text-rose-600 hover:bg-rose-100'}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-blue-100/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-3">
            <p className="text-xs text-blue-500 font-medium">Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries</p>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs border border-blue-200 rounded-lg px-2 py-1 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-blue-300 border border-transparent hover:border-blue-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => { if (totalPages <= 5) return true; if (p === 1 || p === totalPages) return true; if (Math.abs(p - currentPage) <= 1) return true; return false; }).reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => { if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis'); acc.push(p); return acc; }, []).map((item, idx) => item === 'ellipsis' ? <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-blue-400">…</span> : <button key={item} onClick={() => setCurrentPage(item)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === item ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200' : 'hover:bg-white hover:shadow-sm text-blue-600 border border-transparent hover:border-blue-200'}`}>{item}</button>)}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-blue-300 border border-transparent hover:border-blue-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Recipe Edit Modal */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className="w-full max-w-[1100px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-2 sm:mx-3" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50 via-blue-50 to-blue-100/50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200/50">
                      <FlaskConical size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedRecipe ? 'Edit Recipe' : 'New Recipe'}</h2>
                      <p className="text-[11px] text-violet-600 font-medium mt-0.5">{selectedRecipe ? selectedRecipe.code : 'Add a new recipe record'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRecipe && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-blue-100">
                        <span className="text-xs text-violet-600 font-medium">Version:</span>
                        <span className="text-sm font-bold text-blue-800">{formData.version ?? 1}</span>
                      </div>
                    )}
                    <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all"><X size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                {/* Recipe Identity */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><FlaskConical size={10} /> Recipe Identity</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Recipe Code</label>
                      <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-500 min-h-[34px] flex items-center">
                        {formData.code || <span className="italic">Will be auto-generated on save</span>}
                      </div>
                    </div>
                    <Input label="Recipe Name" required value={formData.name || ''} placeholder="Enter name" onChange={(e) => updateField('name', e.target.value)} />
                    <Select
                      label="Product"
                      options={[
                        { value: '', label: dropdowns['products']?.loading ? 'Loading...' : 'Select product' },
                        ...(dropdowns['products']?.options || []),
                      ]}
                      value={String(formData.product_id || '')}
                      onChange={(e) => handleProductChange(e.target.value)}
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Version</label>
                      <div className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold min-h-[34px] flex items-center">
                        {selectedRecipe ? formData.version : 1}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process & Finish */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-blue-50/80 border border-blue-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5"> Process & Finish</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                    {/* Leather Type — read-only, populated from Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Leather Type</label>
                      <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.leather_type ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        {formData.leather_type || <span className="italic">Auto-filled from product</span>}
                      </div>
                    </div>
                    {/* Thickness — read-only, populated from Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Thickness</label>
                      <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.thickness ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        {formData.thickness || <span className="italic">Auto-filled from product</span>}
                      </div>
                    </div>
                    {/* Finish Type — read-only, populated from Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Finish Type</label>
                      <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.finish_type ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        {formData.finish_type || <span className="italic">Auto-filled from product</span>}
                      </div>
                    </div>
                    {/* Color — read-only, populated from Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Color</label>
                      <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.color ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        {formData.color || <span className="italic">Auto-filled from product</span>}
                      </div>
                    </div>
                    {/* UOM — read-only, populated from Product */}
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">UOM</label>
                      <div className={`w-full px-2.5 py-2 text-xs border rounded-lg min-h-[34px] flex items-center ${formData.uom ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        {formData.uom || <span className="italic">Auto-filled from product</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validity */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input label="Valid From" type="date" value={formData.valid_from || ''} onChange={(e) => updateField('valid_from', e.target.value)} />
                    <Input label="Valid To" type="date" value={formData.valid_to || ''} onChange={(e) => updateField('valid_to', e.target.value)} />
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Status</label>
                      <select value={formData.status || 'active'} onChange={(e) => updateField('status', e.target.value)} className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="flex items-center border-b border-gray-100 overflow-x-auto">
                    {detailTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all ${
                          activeDetailTab === tab.id
                            ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-500'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {activeDetailTab === 'items' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">Recipe Items ({recipeItems.length})</span>
                          {recipeItems.length === 0 && (
                            <span className="text-xs text-gray-400 italic">Select a product to load BOM items</span>
                          )}
                        </div>
                        <Table columns={recipeItemColumns} data={recipeItems} />
                        <div className="flex items-center justify-end border-t border-gray-200 pt-2 text-xs font-semibold">
                          <span>Total Qty: {totalQty.toFixed(3)}</span>
                        </div>
                      </div>
                    )}

                    {activeDetailTab === 'stages' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">Process Stages ({stages.length})</span>
                          <Button size="sm" variant="violet" icon={<Plus size={14} />} onClick={openAddStage}>Add Stage</Button>
                        </div>
                        {stages.length === 0 ? (
                          <div className="py-8 text-center text-gray-400 text-sm">
                            Add process stages to define the workflow.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {stages.map((stage, idx) => (
                              <div key={stage.id || idx} className="p-4 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/50 to-white shadow-sm">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                      {stage.seq}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">{stage.process_stage}</p>
                                      <p className="text-[11px] text-gray-500 mt-0.5">{stage.machine || 'No machine assigned'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openEditStage(stage)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"><Edit2 size={13} /></button>
                                    <button onClick={() => handleDeleteStage(stage.id!)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={13} /></button>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-violet-100/50">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div className="px-2.5 py-2 rounded-lg bg-white border border-gray-100">
                                      <span className="text-gray-500 block">Duration</span>
                                      <span className="font-semibold text-gray-800">{stage.duration ? `${stage.duration} min` : '—'}</span>
                                    </div>
                                    <div className="px-2.5 py-2 rounded-lg bg-white border border-gray-100">
                                      <span className="text-gray-500 block">Temperature</span>
                                      <span className="font-semibold text-gray-800">{stage.temperature ? `${stage.temperature}°C` : '—'}</span>
                                    </div>
                                    <div className="px-2.5 py-2 rounded-lg bg-white border border-gray-100">
                                      <span className="text-gray-500 block">Speed</span>
                                      <span className="font-semibold text-gray-800">{stage.speed || '—'}</span>
                                    </div>
                                    <div className="px-2.5 py-2 rounded-lg bg-white border border-gray-100">
                                      <span className="text-gray-500 block">QC Check</span>
                                      <span className={`font-semibold ${stage.qc_check ? 'text-blue-600' : 'text-gray-400'}`}>{stage.qc_check ? 'Required' : 'Not Required'}</span>
                                    </div>
                                  </div>
                                  {stage.remarks && (
                                    <p className="mt-3 text-[11px] text-gray-500 bg-white rounded-lg px-2.5 py-2 border border-gray-100"><span className="font-medium text-gray-600">Remarks:</span> {stage.remarks}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <Button variant="outline" size="sm" icon={<ChevronUp size={14} />}>Move Up</Button>
                          <Button variant="outline" size="sm" icon={<ChevronDown size={14} />}>Move Down</Button>
                          <Button variant="outline" size="sm" icon={<Copy size={14} />}>Copy Stage</Button>
                        </div>
                      </div>
                    )}

                    {activeDetailTab === 'attachments' && (
                      <div className="space-y-4">
                        <div className="py-4 text-center text-gray-400 text-sm">
                          Upload and manage recipe-related documents.
                        </div>
                        <div className="flex justify-center">
                          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-violet-600 bg-white border border-violet-200 rounded-lg hover:bg-violet-50 cursor-pointer transition-all">
                            <Paperclip size={14} />
                            Upload Attachment
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (!selectedRecipe?.id) {
                                  toast.info('Save the recipe first before uploading attachments.', { position: 'top-right', autoClose: 3000 });
                                  return;
                                }
                                try {
                                  const fd = new FormData();
                                  fd.append('file', file);
                                  const token = localStorage.getItem('tannery_token');
                                  const res = await fetch(`/api/recipes/${selectedRecipe.id}/attachments`, {
                                    method: 'POST',
                                    headers: {
                                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                    },
                                    body: fd,
                                  });
                                  if (!res.ok) {
                                    const err = await res.json();
                                    throw new Error(err.error || 'Upload failed');
                                  }
                                  toast.success('Attachment uploaded!', { position: 'top-right', autoClose: 2000 });
                                  const detail = await api<{ data: Recipe & { attachments: RecipeAttachment[] } }>(`/recipes/${selectedRecipe.id}`);
                                  setAttachments(detail.data.attachments || []);
                                } catch (err) {
                                  toast.error('Failed to upload: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            {attachments.map((att) => (
                              <div key={att.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <Paperclip size={13} className="text-gray-400" />
                                  <span className="text-xs text-gray-700 font-medium">{att.file_name}</span>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api(`/recipes/${selectedRecipe?.id}/attachments/${att.id}`, { method: 'DELETE' });
                                      setAttachments(prev => prev.filter(a => a.id !== att.id));
                                      toast.success('Attachment removed!', { position: 'top-right', autoClose: 2000 });
                                    } catch {}
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeDetailTab === 'remarks' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-medium text-gray-900">Remarks / Notes</label>
                        <textarea
                          rows={4}
                          value={formData.remarks || ''}
                          onChange={(e) => updateField('remarks', e.target.value)}
                          placeholder="Enter any additional notes or remarks..."
                          className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none placeholder-gray-400 bg-white"
                        />
                        <Button size="sm" variant="violet" onClick={handleSaveRemarks}>Save Remarks</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-violet-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedRecipe ? (
                    <button onClick={selectedRecipe?.status !== 'posted' ? () => selectedRecipe?.id && handleDelete(selectedRecipe.id) : undefined} disabled={selectedRecipe?.status === 'posted'} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}><Trash2 size={13} /> Delete</button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95" onClick={() => setShowPanel(false)}><RotateCcw size={13} /> Cancel</button>
                    <button onClick={canWrite ? handleSave : undefined} disabled={saving || isReadOnly} title={isReadOnly ? 'You have read-only access' : undefined} className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-lg shadow-md transition-all disabled:opacity-50 ${isReadOnly ? 'cursor-not-allowed' : 'shadow-violet-200 hover:shadow-lg active:scale-95'}`}><Save size={13} /> {saving ? 'Saving...' : selectedRecipe ? 'Update' : 'Save Recipe'}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Item Modal */}
      {showItemModal && createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center" onClick={() => setShowItemModal(false)}>
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl mx-3 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 mb-4">{selectedItem ? 'Edit Item' : 'Add Item'}</h3>
            <div className="space-y-3">
              <Select
                label="Material"
                required
                options={[
                  { value: '', label: 'Select material' },
                  ...materials.map(m => ({ value: String(m.id), label: `${m.code} - ${m.name}` })),
                ]}
                value={itemForm.material_id}
                onChange={(e) => setItemForm(prev => ({ ...prev, material_id: e.target.value }))}
              />
              <Input label="Qty / Sq. Ft." required type="number" value={itemForm.qty} onChange={(e) => setItemForm(prev => ({ ...prev, qty: e.target.value }))} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowItemModal(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveItem} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-violet-600">{selectedItem ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Stage Modal */}
      {showStageModal && createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center" onClick={() => setShowStageModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl mx-3 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 mb-4">{selectedStage ? 'Edit Stage' : 'Add Stage'}</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Sequence" required type="number" value={stageForm.seq} onChange={(e) => setStageForm(prev => ({ ...prev, seq: e.target.value }))} />
                <Select
                  label="Process Stage"
                  required
                  options={[
                    { value: '', label: dropdowns['process-stages']?.loading ? 'Loading...' : 'Select stage' },
                    ...(dropdowns['process-stages']?.options || []),
                  ]}
                  value={stageForm.process_stage_id}
                  onChange={(e) => handleStageChange(e.target.value)}
                />
              </div>
              <Select
                label="Machine / Equipment"
                options={[
                  { value: '', label: dropdowns['machines']?.loading ? 'Loading...' : 'Select machine' },
                  ...(dropdowns['machines']?.options || []),
                ]}
                value={stageForm.machine_id}
                onChange={(e) => setStageForm(prev => ({ ...prev, machine_id: e.target.value }))}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Duration (Min)" type="number" value={stageForm.duration} onChange={(e) => setStageForm(prev => ({ ...prev, duration: e.target.value }))} />
                <Input label="Temperature" value={stageForm.temperature} onChange={(e) => setStageForm(prev => ({ ...prev, temperature: e.target.value }))} />
                <Input label="Speed / RPM" value={stageForm.speed} onChange={(e) => setStageForm(prev => ({ ...prev, speed: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="qc_check"
                  checked={stageForm.qc_check}
                  onChange={(e) => setStageForm(prev => ({ ...prev, qc_check: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="qc_check" className="text-xs font-medium text-gray-700">QC Check Required</label>
              </div>
              <Input label="Remarks" value={stageForm.remarks} onChange={(e) => setStageForm(prev => ({ ...prev, remarks: e.target.value }))} />
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowStageModal(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveStage} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-violet-600">{selectedStage ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
}
