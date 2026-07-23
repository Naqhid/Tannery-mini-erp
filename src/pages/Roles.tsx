import { Shield } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Roles() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'access_level', header: 'Access Level', render: (row: any) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${row.access_level === 'read_only' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
        {row.access_level === 'read_only' ? 'Read Only' : 'Read & Write'}
      </span>
    )},
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: true, placeholder: 'e.g. ADMIN' },
    { key: 'name', label: 'Name', required: true, placeholder: 'e.g. Administrator' },
    { key: 'access_level', label: 'Access Level', type: 'select' as const, required: true, options: [
      { value: 'read_write', label: 'Read & Write' },
      { value: 'read_only', label: 'Read Only' },
    ]},
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'access_level', header: 'Access Level' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Roles"
      subtitle="Manage user roles"
      icon={<Shield size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/roles"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', access_level: 'read_write', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[59, 130, 246]}
      formRoute="/roles"
    />
  );
}
