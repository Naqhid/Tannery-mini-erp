import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportMenu from '../components/ui/ExportMenu';
import { previewPDF, downloadPDF } from '../lib/pdfExport';
import api from '../lib/api';

interface ProcessStage {
  id?: number;
  seq: number;
  process_stage: string;
  machine: string;
  duration: number;
  temperature: string;
  speed: string;
  qc_check: string;
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

interface Recipe {
  id?: number;
  code: string;
  name: string;
  leather_type: string;
  thickness: string;
  process_type: string;
  color: string;
  finish_type: string;
  uom: string;
  status: string;
  valid_from: string;
  valid_to: string;
  version: number;
  description: string;
  items?: RecipeItem[];
  stages?: ProcessStage[];
}

const emptyRecipe: Recipe = {
  code: '', name: '', leather_type: 'cow', thickness: '1.2-1.4',
  process_type: 'finishing', color: '', finish_type: 'semi-aniline',
  uom: 'sqft', status: 'active', valid_from: '', valid_to: '',
  version: 1, description: '',
};

export default function RecipeCreation() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<Recipe>(emptyRecipe);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusToggle, setStatusToggle] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await api<{ data: Recipe[]; total: number }>(`/recipes${params}`);
      setRecipes(res.data || []);
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api<{ data: { total: number; active: number } }>('/recipes/stats');
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    // Handle ISO datetime strings from MySQL (e.g. "2024-01-15T00:00:00.000Z")
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
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
      setStatusToggle(recipe.status === 'active' || recipe.status === 'Active');
      // Fetch items and stages for this recipe
      try {
        const detail = await api<{ data: Recipe & { items: RecipeItem[]; stages: ProcessStage[] } }>(`/recipes/${recipe.id}`);
        setRecipeItems(detail.data.items || []);
        setStages(detail.data.stages || []);
      } catch {
        setRecipeItems([]);
        setStages([]);
      }
    } else {
      setSelectedRecipe(null);
      setFormData(emptyRecipe);
      setStatusToggle(true);
      setRecipeItems([]);
      setStages([]);
    }
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
      fetchRecipes();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete recipe: ' + (err as Error).message, { position: 'top-right', autoClose: 3000 });
    }
  };

  const updateField = (field: keyof Recipe, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalQty = recipeItems.reduce((sum, item) => sum + item.qty, 0);

  const recipeItemColumns = [
    { key: 'id', header: '#', width: '40px', render: (_row: RecipeItem, i: number) => <span>{i + 1}</span> },
    { key: 'material_code', header: 'Material Code', width: '130px' },
    { key: 'material_name', header: 'Material Name', width: '200px' },
    { key: 'uom', header: 'UOM', width: '80px' },
    { key: 'qty', header: 'Qty / Sq. Ft.', width: '120px', render: (row: RecipeItem) => (
      <span>{row.qty.toFixed(3)}</span>
    )},
    { key: 'actions', header: 'Action', width: '70px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  const processStagesColumns = [
    { key: 'drag', header: '', width: '30px', render: () => (
      <span className="text-gray-400 cursor-grab text-xs">&#8942;&#8942;</span>
    )},
    { key: 'seq', header: 'Seq.', width: '50px' },
    { key: 'process_stage', header: 'Process Stage', width: '140px' },
    { key: 'machine', header: 'Machine / Equipment' },
    { key: 'duration', header: 'Duration (Min)', width: '110px' },
    { key: 'temperature', header: 'Temperature (\u00B0C)', width: '120px' },
    { key: 'speed', header: 'Speed / RPM', width: '100px' },
    { key: 'qc_check', header: 'QC Check', width: '110px' },
    { key: 'remarks', header: 'Remarks' },
    { key: 'actions', header: 'Action', width: '70px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  const modalTabs = [
    {
      id: 'items',
      label: 'Recipe Items',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900"></h3>
            <Button size="sm" icon={<Plus size={14} />} variant="teal">Add Item</Button>
          </div>
          <Table columns={recipeItemColumns} data={recipeItems} />
          <div className="flex items-center justify-end border-t border-gray-200 pt-2">
            <span className="text-xs font-semibold text-gray-900 mr-4">Total</span>
            <span className="text-xs font-semibold text-gray-900 w-[120px]">{totalQty.toFixed(3)}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'process',
      label: 'Process Stages',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Process Stages</h3>
            <Button size="sm" icon={<Plus size={14} />} variant="teal">Add Stage</Button>
          </div>
          <Table columns={processStagesColumns} data={stages} />
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            <Button variant="outline" size="sm" icon={<ChevronUp size={14} />}>Move Up</Button>
            <Button variant="outline" size="sm" icon={<ChevronDown size={14} />}>Move Down</Button>
            <Button variant="outline" size="sm" icon={<Copy size={14} />}>Copy Stage</Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />}>Delete Stage</Button>
          </div>
        </div>
      ),
    },
    {
      id: 'parameters',
      label: 'Parameters',
      content: (
        <div className="py-8 text-center text-gray-400 text-sm">
          Process parameters configuration.
        </div>
      ),
    },
    {
      id: 'attachments',
      label: 'Attachments',
      content: (
        <div className="py-8 text-center text-gray-400 text-sm">
          Upload and manage attachments.
        </div>
      ),
    },
    {
      id: 'remarks',
      label: 'Remarks',
      content: (
        <div className="py-8 text-center text-gray-400 text-sm">
          Add remarks and notes.
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200/50">
            <FlaskConical size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Recipe Creation</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your recipes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100 shadow-sm">
            <div className="p-1 rounded-md bg-violet-100">
              <FlaskConical size={12} className="text-violet-600" />
            </div>
            <span className="text-xs text-violet-600 font-medium">Total:</span>
            <span className="text-sm font-bold text-violet-800">{stats.total}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Active:</span>
            <span className="text-sm font-bold text-emerald-800">{stats.active}</span>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="bg-white rounded-xl border border-violet-100 shadow-sm shadow-violet-100/50 overflow-hidden ring-1 ring-violet-50">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-violet-50/30">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all bg-white"
              />
            </div>
            <button className="p-2 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-300 transition-all">
              <Filter size={15} />
            </button>
            <ExportMenu
              onPreview={() => {
                const columns = ['Code', 'Name', 'Leather Type', 'Process Type', 'Finish Type', 'Version', 'Status'];
                const rows = recipes.map(r => [r.code, r.name, r.leather_type, r.process_type, r.finish_type, `v${r.version}`, r.status]);
                previewPDF({ title: 'Recipe Creation', subtitle: `Total: ${recipes.length} recipes`, columns, rows, accentColor: [139, 92, 246] });
              }}
              onDownload={() => {
                const columns = ['Code', 'Name', 'Leather Type', 'Process Type', 'Finish Type', 'Version', 'Status'];
                const rows = recipes.map(r => [r.code, r.name, r.leather_type, r.process_type, r.finish_type, `v${r.version}`, r.status]);
                downloadPDF({ title: 'Recipe Creation', subtitle: `Total: ${recipes.length} recipes`, columns, rows, accentColor: [139, 92, 246], fileName: 'Recipe_Creation.pdf' });
              }}
            />
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 transition-all active:scale-95"
            onClick={() => openPanel()}
          >
            <Plus size={14} />
            Add Recipe
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-violet-50/40 border-b border-violet-100/50">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-violet-600 uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-purple-500 uppercase tracking-wider">Recipe Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-teal-500 uppercase tracking-wider">Leather Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-blue-500 uppercase tracking-wider hidden lg:table-cell">Process Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-sky-500 uppercase tracking-wider hidden lg:table-cell">Finish Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-amber-500 uppercase tracking-wider hidden xl:table-cell">Version</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-rose-500 uppercase tracking-wider w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : recipes.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No recipes found</td></tr>
              ) : recipes.map((r, index) => (
                <tr key={r.id || r.code} className={`hover:bg-violet-50/50 transition-all group cursor-pointer relative ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`} onClick={() => openPanel(r)}>
                  <td className="py-3 px-4 relative">
                    <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${r.status === 'active' || r.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="font-mono text-xs text-violet-600 font-medium">{r.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        ['bg-violet-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500'][index % 8]
                      }`}>
                        {r.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-teal-700 font-medium text-xs capitalize">{r.leather_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-blue-600 font-medium text-xs capitalize">{r.process_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-100 capitalize">{r.finish_type}</span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-amber-600 font-medium text-xs">v{r.version}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                      r.status === 'active' || r.status === 'Active'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'active' || r.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openPanel(r); }} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"><Edit2 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); r.id && handleDelete(r.id); }} className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-50">
          {recipes.map((r) => (
            <div key={r.id || r.code} className="p-4 hover:bg-violet-50/30 transition-colors" onClick={() => openPanel(r)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">{r.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      r.status === 'active' || r.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${r.status === 'active' || r.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1.5">{r.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="capitalize">{r.leather_type}</span>
                    <span className="capitalize">{r.process_type}</span>
                    <span className="text-amber-600">v{r.version}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openPanel(r); }} className="p-2 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); r.id && handleDelete(r.id); }} className="p-2 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-violet-100/50 bg-gradient-to-r from-slate-50 to-violet-50/30">
          <p className="text-xs text-violet-500 font-medium">Showing {recipes.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-violet-300 border border-transparent hover:border-violet-200 transition-all"><ChevronLeft size={14} /></button>
            <button className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium shadow-md shadow-violet-200">1</button>
            <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-violet-300 border border-transparent hover:border-violet-200 transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {showPanel && createPortal(
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowPanel(false)}>
            <div className="w-full max-w-[950px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col mx-3" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-violet-100/50 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200/50">
                      <FlaskConical size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedRecipe ? 'Edit Recipe' : 'New Recipe'}</h2>
                      <p className="text-[11px] text-violet-600 font-medium mt-0.5">{selectedRecipe ? selectedRecipe.code : 'Add a new recipe record'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRecipe && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                        <FlaskConical size={12} className="text-violet-600" />
                        <span className="text-xs text-violet-600 font-medium">Version:</span>
                        <span className="text-sm font-bold text-violet-800">{formData.version ?? 1}</span>
                      </div>
                    )}
                    <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all"><X size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
                {/* Recipe Details Form */}
                {/* Row 1 - Recipe Identity */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical size={10} /> Recipe Identity
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input label="Recipe Code" required value={formData.code || ''} placeholder="Enter code" onChange={(e) => updateField('code', e.target.value)} />
                    <Input label="Recipe Name" required value={formData.name || ''} placeholder="Enter name" onChange={(e) => updateField('name', e.target.value)} />
                    <Select
                      label="Leather Type"
                      required
                      options={[
                        { value: '', label: 'Select leather type' },
                        { value: 'cow', label: 'Cow' },
                        { value: 'buffalo', label: 'Buffalo' },
                        { value: 'goat', label: 'Goat' },
                        { value: 'sheep', label: 'Sheep' },
                      ]}
                      value={formData.leather_type || 'cow'}
                      onChange={(e) => updateField('leather_type', e.target.value)}
                    />
                    <Select
                      label="Thickness"
                      options={[
                        { value: '', label: 'Select thickness' },
                        { value: '1.2-1.4', label: '1.2 - 1.4 mm' },
                        { value: '1.4-1.6', label: '1.4 - 1.6 mm' },
                        { value: '1.6-1.8', label: '1.6 - 1.8 mm' },
                      ]}
                      value={formData.thickness || '1.2-1.4'}
                      onChange={(e) => updateField('thickness', e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2 - Process & Finish */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-violet-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider flex items-center gap-1.5">
                    🎨 Process & Finish
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <Select
                      label="Process Type"
                      required
                      options={[
                        { value: '', label: 'Select process' },
                        { value: 'finishing', label: 'Finishing' },
                        { value: 'tanning', label: 'Tanning' },
                        { value: 'dyeing', label: 'Dyeing' },
                      ]}
                      value={formData.process_type || 'finishing'}
                      onChange={(e) => updateField('process_type', e.target.value)}
                    />
                    <Input label="Color / Shade" value={formData.color || ''} placeholder="Enter color" onChange={(e) => updateField('color', e.target.value)} />
                    <Select
                      label="Finish Type"
                      options={[
                        { value: '', label: 'Select finish' },
                        { value: 'semi-aniline', label: 'Semi Aniline' },
                        { value: 'full-grain', label: 'Full Grain' },
                        { value: 'nappa', label: 'Nappa' },
                        { value: 'suede', label: 'Suede' },
                      ]}
                      value={formData.finish_type || 'semi-aniline'}
                      onChange={(e) => updateField('finish_type', e.target.value)}
                    />
                    <Select
                      label="UOM"
                      options={[
                        { value: '', label: 'Select UOM' },
                        { value: 'sqft', label: 'Sq. Ft.' },
                        { value: 'sqm', label: 'Sq. M.' },
                        { value: 'kg', label: 'Kg' },
                      ]}
                      value={formData.uom || 'sqft'}
                      onChange={(e) => updateField('uom', e.target.value)}
                    />
                    <div className="w-full">
                      <label className="block text-xs font-medium text-gray-900 mb-1">Status</label>
                      <select
                        className="w-full px-2.5 py-2 text-xs text-emerald-600 font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white appearance-none cursor-pointer"
                        value={formData.status || 'active'}
                        onChange={(e) => updateField('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 3 - Validity & Version */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                    📅 Validity & Version
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Valid From" required type="date" value={formData.valid_from || ''} onChange={(e) => updateField('valid_from', e.target.value)} />
                    <Input label="Valid To" type="date" value={formData.valid_to || ''} onChange={(e) => updateField('valid_to', e.target.value)} />
                    <Input label="Version No." value={formData.version?.toString() || '1'} onChange={(e) => updateField('version', e.target.value)} />
                  </div>
                </div>

                {/* Row 4 - Description */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-50/80 to-sky-50/80 border border-cyan-100/50 space-y-3">
                  <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider flex items-center gap-1.5">
                    📝 Description / Notes
                  </p>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Enter recipe description or notes..."
                    className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all placeholder-gray-400 resize-none bg-white"
                  />
                </div>

                {/* Tabs Section (Recipe Items, Process Stages, etc.) */}
                <div className="bg-white rounded-xl border border-violet-100 shadow-sm shadow-violet-100/50 overflow-visible ring-1 ring-violet-50">
                  <Tabs tabs={modalTabs} defaultTab="process" />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Status</span>
                  <button onClick={() => setStatusToggle(!statusToggle)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${statusToggle ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${statusToggle ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className={`text-xs font-semibold ${statusToggle ? 'text-emerald-600' : 'text-gray-500'}`}>{statusToggle ? '● Active' : '○ Inactive'}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-violet-50/30 shrink-0 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {selectedRecipe ? (
                    <button onClick={() => selectedRecipe?.id && handleDelete(selectedRecipe.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-sm shadow-red-200 hover:shadow-md transition-all active:scale-95"><Trash2 size={13} /> Delete</button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95" onClick={() => setShowPanel(false)}><RotateCcw size={13} /> Cancel</button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95">
                      Save as Draft
                    </button>
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg shadow-md shadow-violet-200 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"><Save size={13} /> {saving ? 'Saving...' : selectedRecipe ? 'Update' : 'Save Recipe'}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
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
