import { Receipt } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function TaxMaster() {
  const columns = [
    { key: 'code', header: 'Tax Code' },
    { key: 'name', header: 'Name' },
    { key: 'tax_category', header: 'Category' },
    { key: 'gst_percent', header: 'GST %' },
    { key: 'cess_percent', header: 'Cess %' },
    { key: 'effective_from', header: 'Effective From', render: (row: any) => {
      if (!row.effective_from) return '';
      return new Date(row.effective_from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }},
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'name', label: 'Tax Name', required: true, placeholder: 'e.g. GST 18%' },
    { key: 'tax_category', label: 'Tax Category', type: 'select' as const, required: true, options: [
      { value: '', label: 'Select category' },
      { value: 'Goods', label: 'Goods' },
      { value: 'Services', label: 'Services' },
      { value: 'Stationary', label: 'Stationary' },
    ]},
    { key: 'gst_percent', label: 'GST %', required: true, placeholder: 'e.g. 18' },
    { key: 'cess_percent', label: 'Cess %', placeholder: 'e.g. 0' },
    { key: 'effective_from', label: 'Effective From', type: 'date' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Tax Code' },
    { key: 'name', header: 'Name' },
    { key: 'tax_category', header: 'Category' },
    { key: 'gst_percent', header: 'GST %' },
    { key: 'cess_percent', header: 'Cess %' },
    { key: 'effective_from', header: 'Effective From' },
    { key: 'status', header: 'Status' },
  ];

  const filterOptions = [
    { key: 'tax_category', label: 'Category', options: [
      { value: 'Goods', label: 'Goods' },
      { value: 'Services', label: 'Services' },
      { value: 'Stationary', label: 'Stationary' },
    ]},
  ];

  return (
    <MasterPage
      title="Tax Master"
      subtitle="Manage tax rates (GST, Cess) for goods and services"
      icon={<Receipt size={20} className="text-white" />}
      iconColor="from-emerald-500 to-emerald-600"
      apiEndpoint="/tax-master"
      columns={columns}
      formFields={formFields}
      emptyData={{ name: '', tax_category: 'Goods', gst_percent: 18, cess_percent: 0, effective_from: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      filterOptions={filterOptions}
      pdfAccentColor={[16, 185, 129]}
      modalSize="max-w-2xl"
    />
  );
}
