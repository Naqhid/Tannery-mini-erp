import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2, ChevronUp, ChevronDown, Copy } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';

interface ProcessStage {
  seq: number;
  processStage: string;
  machine: string;
  duration: number;
  temperature: string;
  speed: string;
  qcCheck: string;
  remarks: string;
}

const initialStages: ProcessStage[] = [
  { seq: 1, processStage: 'Leather Inspection', machine: 'Inspection Table', duration: 10, temperature: 'Ambient', speed: '-', qcCheck: 'Visual Check', remarks: 'Check defects' },
  { seq: 2, processStage: 'Spray Base Coat', machine: 'Spray Booth', duration: 15, temperature: '30', speed: 'Medium', qcCheck: 'Coverage', remarks: 'Even coat' },
  { seq: 3, processStage: 'Drying', machine: 'Tunnel Dryer', duration: 20, temperature: '65', speed: '-', qcCheck: 'Dryness', remarks: 'Until required dryness' },
  { seq: 4, processStage: 'Ironing', machine: 'Ironing Machine', duration: 10, temperature: '95', speed: 'Medium', qcCheck: 'Surface Finish', remarks: 'Smooth finish' },
  { seq: 5, processStage: 'Top Coat', machine: 'Spray Booth', duration: 15, temperature: '30', speed: 'Medium', qcCheck: 'Colour Match', remarks: 'Match sample' },
  { seq: 6, processStage: 'Final Drying', machine: 'Dryer', duration: 25, temperature: '70', speed: '-', qcCheck: 'Moisture', remarks: 'Final dry' },
  { seq: 7, processStage: 'Final Inspection', machine: 'QC Table', duration: 10, temperature: 'Ambient', speed: '-', qcCheck: 'Final Approval', remarks: 'Ready for packing' },
];

const processStagesColumns = [
  { key: 'drag', header: '', width: '30px', render: () => (
    <span className="text-gray-400 cursor-grab text-xs">&#8942;&#8942;</span>
  )},
  { key: 'seq', header: 'Seq.', width: '50px' },
  { key: 'processStage', header: 'Process Stage', width: '140px' },
  { key: 'machine', header: 'Machine / Equipment' },
  { key: 'duration', header: 'Duration (Min)', width: '110px' },
  { key: 'temperature', header: 'Temperature (\u00B0C)', width: '120px' },
  { key: 'speed', header: 'Speed / RPM', width: '100px' },
  { key: 'qcCheck', header: 'QC Check', width: '110px' },
  { key: 'remarks', header: 'Remarks' },
  { key: 'actions', header: 'Action', width: '70px', render: () => (
    <div className="flex items-center gap-1">
      <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
      <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
    </div>
  )},
];

export default function RecipeCreation() {
  const [stages] = useState<ProcessStage[]>(initialStages);

  const recipeItems = [
    { id: 1, materialCode: 'MAT-00052', materialName: 'Chrome Powder 33%', uom: 'Kg', qty: 0.110 },
    { id: 2, materialCode: 'MAT-00051', materialName: 'Sodium Sulphide (60%)', uom: 'Kg', qty: 0.075 },
    { id: 3, materialCode: 'MAT-00050', materialName: 'Formic Acid', uom: 'Ltr', qty: 0.050 },
    { id: 4, materialCode: 'MAT-00049', materialName: 'Syntan A 10%', uom: 'Kg', qty: 0.100 },
    { id: 5, materialCode: 'MAT-00047', materialName: 'Fatliquor DP', uom: 'Ltr', qty: 0.140 },
    { id: 6, materialCode: 'MAT-00007', materialName: 'Dye - Black', uom: 'Kg', qty: 0.020 },
    { id: 7, materialCode: 'MAT-00046', materialName: 'Acrylic Finishing Resin', uom: 'Kg', qty: 0.030 },
  ];

  const recipeItemColumns = [
    { key: 'id', header: '#', width: '40px' },
    { key: 'materialCode', header: 'Material Code', width: '130px' },
    { key: 'materialName', header: 'Material Name', width: '200px' },
    { key: 'uom', header: 'UOM', width: '80px' },
    { key: 'qty', header: 'Qty / Sq. Ft.', width: '120px', render: (row: { qty: number }) => (
      <span>{row.qty.toFixed(3)}</span>
    )},
    { key: 'actions', header: 'Action', width: '70px', render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
      </div>
    )},
  ];

  const totalQty = recipeItems.reduce((sum, item) => sum + item.qty, 0);

  const tabs = [
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
          {/* Total Row */}
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
          {/* Bottom Actions */}
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recipe - RC-00037</h1>
          <p className="text-xs text-gray-500 mt-0.5">BOM / Recipe &gt; Recipe Creation &gt; RC-00037</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">Save as Draft</Button>
          <Button variant="outline" icon={<X size={14} />}>Cancel</Button>
          <Button variant="teal" icon={<Save size={14} />}>Save Recipe</Button>
        </div>
      </div>

      {/* Recipe Details Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 inline-block border-b-2 border-blue-600 pb-2">Recipe Details</h2>
        </div>
        <div className="p-4">
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input label="Recipe Code" required defaultValue="RC-00037" />
            <Input label="Recipe Name" required defaultValue="Black Finish - Cow (1.2-1.4mm)" />
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
              defaultValue="cow"
            />
            <Select
              label="Thickness"
              options={[
                { value: '', label: 'Select thickness' },
                { value: '1.2-1.4', label: '1.2 - 1.4 mm' },
                { value: '1.4-1.6', label: '1.4 - 1.6 mm' },
                { value: '1.6-1.8', label: '1.6 - 1.8 mm' },
              ]}
              defaultValue="1.2-1.4"
            />
          </div>
          {/* Row 2 */}
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
              defaultValue="finishing"
            />
            <Input label="Color / Shade" defaultValue="Black" />
            <Select
              label="Finish Type"
              options={[
                { value: '', label: 'Select finish' },
                { value: 'semi-aniline', label: 'Semi Aniline' },
                { value: 'full-grain', label: 'Full Grain' },
                { value: 'nappa', label: 'Nappa' },
                { value: 'suede', label: 'Suede' },
              ]}
              defaultValue="semi-aniline"
            />
            <Select
              label="UOM"
              options={[
                { value: '', label: 'Select UOM' },
                { value: 'sqft', label: 'Sq. Ft.' },
                { value: 'sqm', label: 'Sq. M.' },
                { value: 'kg', label: 'Kg' },
              ]}
              defaultValue="sqft"
            />
            <div className="w-full">
              <label className="block text-xs font-medium text-gray-900 mb-1">Status</label>
              <select
                className="w-full px-2.5 py-2 text-xs text-emerald-600 font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer"
                defaultValue="active"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Valid From" required type="date" defaultValue="2024-05-01" />
            <Input label="Valid To" type="date" defaultValue="2024-12-31" />
            <Input label="Version No." defaultValue="1" />
          </div>
          {/* Row 4 - Description */}
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-1">Description / Notes</label>
            <textarea
              rows={3}
              defaultValue="Standard black finishing recipe for cow leather (1.2-1.4 mm). Provides even color, soft handle and good fastness."
              className="w-full px-2.5 py-2 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 resize-none"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="overflow-visible">
        <Tabs tabs={tabs} defaultTab="process" />
      </Card>
    </div>
  );
}
