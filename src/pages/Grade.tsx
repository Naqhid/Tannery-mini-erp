import { Award } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Grade() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'rank', header: 'Rank' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false, placeholder: 'Auto-generated' },
    { key: 'name', label: 'Grade Name', required: true },
    { key: 'rank', label: 'Ranking', type: 'text' as const, placeholder: '1-4' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'rank', header: 'Rank' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Grade"
      subtitle="Manage quality grades"
      icon={<Award size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/grades"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', rank: 1, description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[59, 130, 246]}
      modalSize="max-w-2xl"
      formRoute="/grade"
    />
  );
}
