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
    { key: 'code', label: 'Code', required: false },
    { key: 'name', label: 'Name', required: true },
    { key: 'rank', label: 'Rank', type: 'text' as const, placeholder: '1-4' },
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
      iconColor="from-yellow-400 via-amber-500 to-orange-600"
      apiEndpoint="/grades"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', rank: 1, description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[245, 158, 11]}
    />
  );
}
