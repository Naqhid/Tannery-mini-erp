import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';

interface Recipe {
  id: string;
  code: string;
  name: string;
  leatherType: string;
  finishType: string;
  tanningMethod: string;
  stages: number;
  status: string;
  created: string;
}

const initialRecipes: Recipe[] = [
  { id: '1', code: 'REC-FG-001', name: 'Full Grain Cowhide Finish', leatherType: 'Cowhide', finishType: 'Full Grain', tanningMethod: 'Chrome', stages: 8, status: 'Active', created: '15 Jun 2024' },
  { id: '2', code: 'REC-SA-002', name: 'Semi-Aniline Buffalo Finish', leatherType: 'Buffalo', finishType: 'Semi-Aniline', tanningMethod: 'Chrome', stages: 7, status: 'Active', created: '12 Jun 2024' },
  { id: '3', code: 'REC-NA-003', name: 'Nappa Goat Leather', leatherType: 'Goat', finishType: 'Nappa', tanningMethod: 'Vegetable', stages: 6, status: 'Active', created: '10 Jun 2024' },
  { id: '4', code: 'REC-SU-004', name: 'Suede Sheep Leather', leatherType: 'Sheep', finishType: 'Suede', tanningMethod: 'Chrome', stages: 5, status: 'Draft', created: '08 Jun 2024' },
  { id: '5', code: 'REC-PU-005', name: 'Pull-Up Cowhide', leatherType: 'Cowhide', finishType: 'Pull-Up', tanningMethod: 'Combination', stages: 8, status: 'Active', created: '05 Jun 2024' },
  { id: '6', code: 'REC-FG-006', name: 'Full Grain Buffalo', leatherType: 'Buffalo', finishType: 'Full Grain', tanningMethod: 'Vegetable', stages: 7, status: 'Active', created: '01 Jun 2024' },
  { id: '7', code: 'REC-SA-007', name: 'Semi-Aniline Cowhide', leatherType: 'Cowhide', finishType: 'Semi-Aniline', tanningMethod: 'Synthetic', stages: 7, status: 'Draft', created: '28 May 2024' },
];

export default function Recipe() {
  const [recipes] = useState<Recipe[]>(initialRecipes);

  const columns = [
    { key: 'code', header: 'Recipe Code', width: '130px' },
    { key: 'name', header: 'Recipe Name' },
    { key: 'leatherType', header: 'Leather Type', width: '120px' },
    { key: 'finishType', header: 'Finish Type', width: '120px' },
    { key: 'tanningMethod', header: 'Tanning', width: '120px' },
    { key: 'stages', header: 'Stages', width: '80px' },
    { key: 'status', header: 'Status', width: '100px', render: (row: Recipe) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}>{row.status}</span>
    )},
    { key: 'created', header: 'Created', width: '110px' },
    { key: 'actions', header: 'Actions', width: '120px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"><Eye size={14} /></button>
        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"><Edit2 size={14} /></button>
        <button className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recipes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage leather finishing recipes</p>
        </div>
        <Button icon={<Plus size={16} />}>New Recipe</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            className="w-44"
            options={[
              { value: '', label: 'All Leather Types' },
              { value: 'cowhide', label: 'Cowhide' },
              { value: 'buffalo', label: 'Buffalo' },
              { value: 'goat', label: 'Goat' },
              { value: 'sheep', label: 'Sheep' },
            ]}
          />
          <Select
            className="w-44"
            options={[
              { value: '', label: 'All Finish Types' },
              { value: 'full-grain', label: 'Full Grain' },
              { value: 'semi-aniline', label: 'Semi-Aniline' },
              { value: 'nappa', label: 'Nappa' },
              { value: 'suede', label: 'Suede' },
              { value: 'pull-up', label: 'Pull-Up' },
            ]}
          />
          <Select
            className="w-40"
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
          <Button variant="outline" size="sm" icon={<Filter size={14} />}>Filter</Button>
        </div>
      </Card>

      {/* Table */}
      <Card
        title="Recipe List"
        subtitle={`${recipes.length} recipes found`}
      >
        <Table columns={columns} data={recipes} />
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Showing 1-7 of 7 recipes</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><ChevronLeft size={14} /></button>
            <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white">1</button>
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><ChevronRight size={14} /></button>
          </div>
        </div>
      </Card>
    </div>
  );
}
