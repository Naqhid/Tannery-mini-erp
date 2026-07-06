import { Sparkles } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function FinishType() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false },
    { key: 'name', label: 'Name', required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Finish Type"
      subtitle="Manage finish types"
      icon={<Sparkles size={20} className="text-white" />}
      iconColor="from-cyan-500 to-teal-600"
      apiEndpoint="/finish-types"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[6, 182, 212]}
    />
  );
}
