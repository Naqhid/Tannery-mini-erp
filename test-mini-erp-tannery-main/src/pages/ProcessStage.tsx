import { ListChecks } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function ProcessStage() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'seq', header: 'Sequence' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false },
    { key: 'name', label: 'Name', required: true },
    { key: 'seq', label: 'Sequence', type: 'text' as const, placeholder: 'Display order' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'seq', header: 'Sequence' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Process Stage"
      subtitle="Manage process stages"
      icon={<ListChecks size={20} className="text-white" />}
      iconColor="from-blue-500 via-indigo-500 to-violet-600"
      apiEndpoint="/process-stages"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', seq: 0, description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[59, 130, 246]}
    />
  );
}
