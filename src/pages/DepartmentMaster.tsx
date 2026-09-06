import { Building2 } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function DepartmentMaster() {
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
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Department Master"
      subtitle="Manage departments"
      icon={<Building2 size={20} className="text-white" />}
      iconColor="from-indigo-500 to-indigo-600"
      apiEndpoint="/departments"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[99, 102, 241]}
      modalSize="max-w-2xl"
      formRoute="/department-master"
    />
  );
}
