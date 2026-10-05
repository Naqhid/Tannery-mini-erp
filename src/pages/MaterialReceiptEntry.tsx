import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Truck } from 'lucide-react';
import TransactionListPage from '../components/ui/TransactionListPage';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { previewPDF, downloadPDF } from '../lib/pdfExport';
import { exportToExcel } from '../lib/excelExport';

const STATUS_COLORS: Record<string, string> = {
  Posted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  Cancelled: 'bg-rose-100 text-rose-600 border border-rose-200',
};

export default function MaterialReceiptEntry() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, posted: 0, draft: 0, total_value: 0 });

  const fetchStats = useCallback(async () => {
    try { const res = await api<{ data: typeof stats }>('/material-receipts/stats'); setStats(res.data); } catch {}
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

  const columns = [
    { key: 'receipt_no', header: 'Receipt No.', sortable: true, render: (row: any) => <span className="font-mono text-xs font-medium text-blue-700">{row.receipt_no}</span> },
    { key: 'receipt_date', header: 'Date', sortable: true, render: (row: any) => <span className="text-xs text-gray-600">{formatDate(row.receipt_date)}</span> },
    { key: 'supplier_name', header: 'Supplier', sortable: true },
    { key: 'warehouse_name', header: 'Warehouse', sortable: true },
    { key: 'grand_total', header: 'Amount', sortable: true, render: (row: any) => <span className="text-xs font-semibold">{formatCurrency(row.grand_total)}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (row: any) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[row.status] || ''}`}>{row.status}</span> },
  ];

  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', iconColor: 'from-blue-500 to-indigo-600' },
    { label: 'Posted', value: stats.posted, color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200', iconColor: 'from-emerald-500 to-green-600' },
    { label: 'Draft', value: stats.draft, color: 'text-amber-900', bg: 'bg-amber-50 border-amber-200', iconColor: 'from-amber-500 to-orange-600' },
    { label: 'Total Value', value: formatCurrency(stats.total_value), color: 'text-purple-900', bg: 'bg-purple-50 border-purple-200', iconColor: 'from-purple-500 to-violet-600' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Posted', label: 'Posted' }, { value: 'Draft', label: 'Draft' }, { value: 'Cancelled', label: 'Cancelled' }] },
  ];

  const handleDelete = async (id: number) => {
    const res = await api(`/material-receipts/${id}`, { method: 'DELETE' });
    toast.success(res.message || 'Receipt deleted!');
  };

  const fetchAllReceipts = async () => {
    const res = await api<{ data: any[] }>('/material-receipts?page=1&limit=99999');
    return res.data || [];
  };

  const exportColumns = [
    { key: 'id', header: 'ID' },
    { key: 'receipt_no', header: 'Receipt No' },
    { key: 'receipt_date', header: 'Receipt Date' },
    { key: 'receipt_type', header: 'Receipt Type' },
    { key: 'supplier_id', header: 'Supplier ID' },
    { key: 'supplier_name', header: 'Supplier Name' },
    { key: 'purchase_order_no', header: 'Purchase Order No' },
    { key: 'po_date', header: 'PO Date' },
    { key: 'challan_no', header: 'Challan No' },
    { key: 'challan_date', header: 'Challan Date' },
    { key: 'lr_grn_no', header: 'LR/GRN No' },
    { key: 'lr_grn_date', header: 'LR/GRN Date' },
    { key: 'transporter', header: 'Transporter' },
    { key: 'gate_entry_no', header: 'Gate Entry No' },
    { key: 'warehouse_id', header: 'Warehouse ID' },
    { key: 'warehouse_name', header: 'Warehouse Name' },
    { key: 'freight', header: 'Freight' },
    { key: 'loading_charges', header: 'Loading Charges' },
    { key: 'other_charges', header: 'Other Charges' },
    { key: 'gst_percent', header: 'GST %' },
    { key: 'cgst_amount', header: 'CGST Amount' },
    { key: 'sgst_amount', header: 'SGST Amount' },
    { key: 'total_gst_amount', header: 'Total GST Amount' },
    { key: 'total_other_charges', header: 'Total Other Charges' },
    { key: 'total_amount', header: 'Total Amount' },
    { key: 'grand_total', header: 'Grand Total' },
    { key: 'remarks', header: 'Remarks' },
    { key: 'status', header: 'Status' },
    { key: 'created_by', header: 'Created By' },
    { key: 'updated_by', header: 'Updated By' },
    { key: 'created_at', header: 'Created At' },
  ];

  const handlePreviewPDF = async () => {
    try {
      const data = await fetchAllReceipts();
      const pdfColumns = ['Receipt No', 'Date', 'Supplier', 'Warehouse', 'Amount', 'Status'];
      const rows = data.map((r: any) => [
        r.receipt_no || '', formatDate(r.receipt_date), r.supplier_name || '—',
        r.warehouse_name || '—', formatCurrency(r.grand_total), r.status || '',
      ]);
      previewPDF({ title: 'Material Receipts', columns: pdfColumns, rows, fileName: 'Material_Receipts' });
    } catch { toast.error('Failed to generate PDF preview'); }
  };

  const handleDownloadPDF = async () => {
    try {
      const data = await fetchAllReceipts();
      const pdfColumns = ['Receipt No', 'Date', 'Supplier', 'Warehouse', 'Amount', 'Status'];
      const rows = data.map((r: any) => [
        r.receipt_no || '', formatDate(r.receipt_date), r.supplier_name || '—',
        r.warehouse_name || '—', formatCurrency(r.grand_total), r.status || '',
      ]);
      downloadPDF({ title: 'Material Receipts', columns: pdfColumns, rows, fileName: 'Material_Receipts' });
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to download PDF'); }
  };

  const handleExportExcel = async () => {
    try {
      const data = await fetchAllReceipts();
      exportToExcel({ data, columns: exportColumns, fileName: 'Material_Receipts' });
      toast.success('Excel downloaded!');
    } catch { toast.error('Failed to download Excel'); }
  };

  return (
    <TransactionListPage
      title="Material Receipts"
      subtitle="Manage material receipt entries"
      icon={<Truck size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/material-receipts"
      columns={columns}
      statCards={statCards}
      filterOptions={filterOptions}
      addButtonLabel="New Receipt"
      onAdd={() => navigate('/material-receipt/new')}
      onRowClick={(row) => navigate(`/material-receipt/${row.id}`)}
      onEdit={(row) => navigate(`/material-receipt/${row.id}`)}
      onDelete={handleDelete}
      deleteTitle="Delete Material Receipt"
      deleteMessage="Are you sure? This will remove the receipt entry."
      searchPlaceholder="Search receipts..."
      enableBulkDelete={true}
      exportActions={{ onPreview: handlePreviewPDF, onDownload: handleDownloadPDF, onExcel: handleExportExcel }}
    />
  );
}
