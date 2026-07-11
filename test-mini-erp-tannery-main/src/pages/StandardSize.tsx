import { Maximize2 } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function StandardSize() {
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
      title="Standard Size"
      subtitle="Manage standard sizes"
      icon={<Maximize2 size={20} className="text-white" />}
      iconColor="from-violet-500 via-purple-500 to-fuchsia-600"
      apiEndpoint="/standard-sizes"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[139, 92, 246]}
    />
  );
}
