import { GitBranch } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function ProcessStage() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'seq', header: 'Sequence' },
    { key: 'uom', header: 'UOM' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false, placeholder: 'Auto-generated' },
    { key: 'name', label: 'Name', required: true },
    { key: 'seq', label: 'Sequence', type: 'text' as const, placeholder: 'Display order' },
    { key: 'uom', label: 'UOM', type: 'text' as const, placeholder: 'e.g. Sq.Ft., Pcs, Kg' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'seq', header: 'Sequence' },
    { key: 'uom', header: 'UOM' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Process Stage"
      subtitle="Manage process stages"
      icon={<GitBranch size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/process-stages"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', seq: 0, uom: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[59, 130, 246]}
      modalSize="max-w-2xl"
      formRoute="/process-stage"
      defaultSortBy="seq"
      defaultSortOrder="asc"
    />
  );
}
