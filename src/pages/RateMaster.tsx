import { IndianRupee } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function RateMaster() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'rate_type', header: 'Type', render: (row: any) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
        row.rate_type === 'Machine' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
        row.rate_type === 'Labour' ? 'bg-green-50 text-green-700 border border-green-200' :
        row.rate_type === 'Chemical' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
        row.rate_type === 'Process' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
        'bg-gray-100 text-gray-600'
      }`}>{row.rate_type}</span>
    )},
    { key: 'uom', header: 'UOM' },
    { key: 'rate_indian', header: 'Rate (Indian)', render: (row: any) => <span className="font-mono text-xs">₹ {Number(row.rate_indian || 0).toFixed(2)}</span> },
    { key: 'rate_imported', header: 'Rate (Imported)', render: (row: any) => <span className="font-mono text-xs">₹ {Number(row.rate_imported || 0).toFixed(2)}</span> },
    { key: 'effective_from', header: 'Effective From' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Rate Code', required: false },
    { key: 'name', label: 'Name', required: true, placeholder: 'e.g. Spray Machine Rate' },
    { key: 'rate_type', label: 'Rate Type', type: 'select' as const, required: true, options: [
      { value: '', label: 'Select type' },
      { value: 'Machine', label: 'Machine' },
      { value: 'Labour', label: 'Labour' },
      { value: 'Chemical', label: 'Chemical' },
      { value: 'Overhead', label: 'Overhead' },
      { value: 'Process', label: 'Process' },
      { value: 'Other', label: 'Other' },
    ]},
    { key: 'uom', label: 'UOM', placeholder: 'e.g. Per Hour, Per Pcs, Per Kg' },
    { key: 'rate_indian', label: 'Rate - Indian (₹)', placeholder: '0.00' },
    { key: 'rate_imported', label: 'Rate - Imported (₹)', placeholder: '0.00' },
    { key: 'effective_from', label: 'Effective From', type: 'date' as const },
    { key: 'effective_to', label: 'Effective To', type: 'date' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const filterOptions = [
    { key: 'rate_type', label: 'Rate Type', options: [
      { value: 'Machine', label: 'Machine' },
      { value: 'Labour', label: 'Labour' },
      { value: 'Chemical', label: 'Chemical' },
      { value: 'Overhead', label: 'Overhead' },
      { value: 'Process', label: 'Process' },
      { value: 'Other', label: 'Other' },
    ]},
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'rate_type', header: 'Type' },
    { key: 'uom', header: 'UOM' },
    { key: 'rate_indian', header: 'Rate (Indian)' },
    { key: 'rate_imported', header: 'Rate (Imported)' },
    { key: 'effective_from', header: 'Effective From' },
    { key: 'effective_to', header: 'Effective To' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Rate Master"
      subtitle="Centralized rate management for all components"
      icon={<IndianRupee size={20} className="text-white" />}
      iconColor="from-amber-500 to-orange-600"
      apiEndpoint="/rate-master"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', rate_type: '', uom: '', rate_indian: '', rate_imported: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      filterOptions={filterOptions}
      pdfAccentColor={[245, 158, 11]}
      modalSize="max-w-2xl"
    />
  );
}
