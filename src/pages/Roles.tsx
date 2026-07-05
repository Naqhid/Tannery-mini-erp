import { Shield } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Roles() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: true, placeholder: 'e.g. ADMIN' },
    { key: 'name', label: 'Name', required: true, placeholder: 'e.g. Administrator' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Roles"
      subtitle="Manage user roles"
      icon={<Shield size={20} className="text-white" />}
      iconColor="from-red-500 to-rose-600"
      apiEndpoint="/roles"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[239, 68, 68]}
    />
  );
}
