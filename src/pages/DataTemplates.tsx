import { FileSpreadsheet, Download } from 'lucide-react';
import {
  downloadProductTemplate,
  downloadCategoryTemplate,
  downloadGroupTemplate,
  downloadWarehouseTemplate,
} from '../lib/excelTemplates';

const templates = [
  {
    title: 'Product Master',
    description: 'Template for bulk product data entry — includes columns for name, category, leather type, UOM, thickness, color, finish, grade, HSN code, etc.',
    icon: '📦',
    onDownload: downloadProductTemplate,
  },
  {
    title: 'Product Category',
    description: 'Template for product categories — name, description, and status.',
    icon: '🏷️',
    onDownload: downloadCategoryTemplate,
  },
  {
    title: 'Group Master',
    description: 'Template for group master data — includes category, HSN code, and GST rate.',
    icon: '📂',
    onDownload: downloadGroupTemplate,
  },
  {
    title: 'Warehouse Master',
    description: 'Template for warehouse setup — location, type, store keeper, storage conditions, etc.',
    icon: '🏭',
    onDownload: downloadWarehouseTemplate,
  },
];

export default function DataTemplates() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Data Import Templates</h1>
          <p className="text-sm text-gray-500">Download Excel templates, fill in your data, and run the generated SQL to import.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.title} className="border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all bg-white">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{t.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>
              </div>
            </div>
            <button
              onClick={t.onDownload}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download size={16} />
              Download Template
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="text-sm font-semibold text-amber-800 mb-1">How to use</h4>
        <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
          <li>Download the template for the master data you want to import.</li>
          <li>Row 2 has example data — replace it with your actual data (add as many rows as needed).</li>
          <li>Row 3 has notes/instructions — you can delete it before sharing.</li>
          <li>Fields marked with * are required.</li>
          <li>For reference fields (Category, Group, UOM, etc.), use exact names that already exist in the system.</li>
        </ol>
      </div>
    </div>
  );
}
