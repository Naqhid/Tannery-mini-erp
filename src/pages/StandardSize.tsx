import { Ruler } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function StandardSize() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false, placeholder: 'Auto-generated' },
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
      icon={<Ruler size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/standard-sizes"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[59, 130, 246]}
      modalSize="max-w-2xl"
      formRoute="/standard-size"
    />
  );
}
