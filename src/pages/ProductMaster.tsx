import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Package } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { previewPDF, downloadPDF } from '../lib/pdfExport';
import { exportToExcel } from '../lib/excelExport';

export default function ProductMaster() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/products/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (row: any) => <span className="font-mono text-xs text-blue-700">{row.code}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (row: any) => <span className="font-medium text-gray-900">{row.name}</span> },
    { key: 'category_name', header: 'Category', sortable: true },
    { key: 'leather_type_name', header: 'Leather Type', sortable: true },
    { key: 'thickness_name', header: 'Thickness', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}><span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-400'}`} />{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Active', value: stats.active, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Inactive', value: stats.inactive, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-200' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/products/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Product deleted!');
  };

  const fetchAll = async () => {
    const res = await api<{ data: any[] }>('/products?page=1&limit=99999');
    return res.data || [];
  };

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'category_name', header: 'Category' },
    { key: 'leather_type_name', header: 'Leather Type' },
    { key: 'thickness_name', header: 'Thickness' },
    { key: 'status', header: 'Status' },
  ];

  const pdfColumns = ['Code', 'Name', 'Category', 'Leather Type', 'Thickness', 'Status'];
  const pdfRows = (data: any[]) => data.map((r: any) => [
    r.code || '', r.name || '', r.category_name || '', r.leather_type_name || '', r.thickness_name || '', r.status || '',
  ]);

  const handlePreviewPDF = async () => {
    try { previewPDF({ title: 'Articles', columns: pdfColumns, rows: pdfRows(await fetchAll()), fileName: 'Articles' }); }
    catch { toast.error('Failed to generate PDF preview'); }
  };
  const handleDownloadPDF = async () => {
    try { downloadPDF({ title: 'Articles', columns: pdfColumns, rows: pdfRows(await fetchAll()), fileName: 'Articles' }); toast.success('PDF downloaded!'); }
    catch { toast.error('Failed to download PDF'); }
  };
  const handleExportExcel = async () => {
    try { exportToExcel({ data: await fetchAll(), columns: exportColumns, fileName: 'Articles' }); toast.success('Excel downloaded!'); }
    catch { toast.error('Failed to download Excel'); }
  };

  return (
    <TransactionListPage
      title="Articles"
      subtitle="Manage your article database"
      icon={<Package size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/products"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="Add Article"
      onAdd={() => navigate('/product-master/new')}
      onRowClick={(row) => navigate(`/product-master/${row.id}`)}
      onEdit={(row) => navigate(`/product-master/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Article"
      deleteMessage="Are you sure? This will remove the article record."
      searchPlaceholder="Search articles..."
      enableBulkDelete={true}
      defaultFilters={{ status: 'Active' }}
      exportActions={{ onPreview: handlePreviewPDF, onDownload: handleDownloadPDF, onExcel: handleExportExcel }}
    />
  );
}
