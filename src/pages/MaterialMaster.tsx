import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { FlaskConical } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { previewPDF, downloadPDF } from '../lib/pdfExport';
import { exportToExcel } from '../lib/excelExport';

const TYPE_COLORS: Record<string, string> = {
  'Wet-end': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Finishing': 'bg-green-50 text-green-700 border border-green-200',
};

export default function MaterialMaster() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/materials/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (row: any) => <span className="font-mono text-xs text-blue-700">{row.code}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'uom', header: 'UOM', sortable: true },
    { key: 'category', header: 'Category', sortable: true, render: (row: any) => <span className="text-gray-700">{row.category || '—'}</span> },
    { key: 'group_name', header: 'Group', sortable: false, render: (row: any) => <span className="text-gray-700">{row.group_name || '—'}</span> },
    { key: 'type', header: 'Type', sortable: true, render: (row: any) => <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLORS[row.type] || 'bg-gray-100 text-gray-600'}`}>{row.type}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Active', value: stats.active, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Inactive', value: stats.inactive, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
    { key: 'type', label: 'Type', options: [{ value: 'Wet-end', label: 'Wet-end' }, { value: 'Finishing', label: 'Finishing' }] },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/materials/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Material deleted!');
  };

  const fetchAllMaterials = async () => {
    const res = await api<{ data: any[] }>('/materials?page=1&limit=99999');
    return res.data || [];
  };

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type' },
    { key: 'uom', header: 'UOM' },
    { key: 'primary_uom_id', header: 'Primary UOM ID' },
    { key: 'secondary_uom_id', header: 'Secondary UOM ID' },
    { key: 'currency', header: 'Currency' },
    { key: 'category', header: 'Category' },
    { key: 'chemical_group', header: 'Chemical Group' },
    { key: 'group_id', header: 'Group ID' },
    { key: 'appearance', header: 'Appearance' },
    { key: 'color', header: 'Color' },
    { key: 'ph_value', header: 'pH Value' },
    { key: 'flash_point', header: 'Flash Point' },
    { key: 'hsn_code', header: 'HSN Code' },
    { key: 'cas_number', header: 'CAS Number' },
    { key: 'shelf_life', header: 'Shelf Life' },
    { key: 'storage_condition', header: 'Storage Condition' },
    { key: 'hazardous', header: 'Hazardous' },
    { key: 'default_warehouse', header: 'Default Warehouse' },
    { key: 'opening_stock', header: 'Opening Stock' },
    { key: 'opening_stock_uom', header: 'Opening Stock UOM' },
    { key: 'current_stock', header: 'Current Stock' },
    { key: 'reorder_level', header: 'Reorder Level' },
    { key: 'maximum_level', header: 'Maximum Level' },
    { key: 'standard_cost', header: 'Standard Cost' },
    { key: 'last_purchase_price', header: 'Last Purchase Price' },
    { key: 'preferred_supplier_id', header: 'Preferred Supplier ID' },
    { key: 'preferred_supplier_name', header: 'Preferred Supplier' },
    { key: 'lead_time', header: 'Lead Time' },
    { key: 'description', header: 'Description' },
    { key: 'application', header: 'Application' },
    { key: 'remarks', header: 'Remarks' },
    { key: 'attachment_path', header: 'Attachment Path' },
    { key: 'status', header: 'Status' },
    { key: 'created_by', header: 'Created By' },
    { key: 'updated_by', header: 'Updated By' },
    { key: 'created_at', header: 'Created At' },
    { key: 'updated_at', header: 'Updated At' },
  ];

  const handlePreviewPDF = async () => {
    try {
      const data = await fetchAllMaterials();
      const pdfColumns = ['Code', 'Name', 'Type', 'Category', 'UOM', 'Current Stock', 'Rate', 'Status'];
      const rows = data.map((r: any) => [
        r.code || '', r.name || '', r.type || '', r.category || '', r.uom || '',
        String(r.current_stock ?? 0), r.last_purchase_price ? `₹${r.last_purchase_price}` : '—', r.status || '',
      ]);
      previewPDF({ title: 'Chemical / Material Master', columns: pdfColumns, rows, fileName: 'Materials_Master' });
    } catch { toast.error('Failed to generate PDF preview'); }
  };

  const handleDownloadPDF = async () => {
    try {
      const data = await fetchAllMaterials();
      const pdfColumns = ['Code', 'Name', 'Type', 'Category', 'UOM', 'Current Stock', 'Rate', 'Status'];
      const rows = data.map((r: any) => [
        r.code || '', r.name || '', r.type || '', r.category || '', r.uom || '',
        String(r.current_stock ?? 0), r.last_purchase_price ? `₹${r.last_purchase_price}` : '—', r.status || '',
      ]);
      downloadPDF({ title: 'Chemical / Material Master', columns: pdfColumns, rows, fileName: 'Materials_Master' });
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to download PDF'); }
  };

  const handleExportExcel = async () => {
    try {
      const data = await fetchAllMaterials();
      exportToExcel({ data, columns: exportColumns, fileName: 'Materials_Master' });
      toast.success('Excel downloaded!');
    } catch { toast.error('Failed to download Excel'); }
  };

  return (
    <TransactionListPage
      title="Chemical / Material"
      subtitle="Manage all chemicals, auxiliaries and packing materials"
      icon={<FlaskConical size={20} className="text-white" />}
      iconColor="from-blue-600 to-indigo-700"
      apiEndpoint="/materials"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="Add Material"
      onAdd={() => navigate('/chemical-master/new')}
      onRowClick={(row) => navigate(`/chemical-master/${row.id}`)}
      onEdit={(row) => navigate(`/chemical-master/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Material"
      deleteMessage="Are you sure? This will remove the material record."
      searchPlaceholder="Search materials..."
      enableBulkDelete={true}
      defaultFilters={{ status: 'Active' }}
      exportActions={{ onPreview: handlePreviewPDF, onDownload: handleDownloadPDF, onExcel: handleExportExcel }}
    />
  );
}
