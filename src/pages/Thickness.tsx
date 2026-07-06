import { Ruler } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Thickness() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'value_mm', header: 'Value (mm)' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false },
    { key: 'name', label: 'Name', required: true },
    { key: 'value_mm', label: 'Value (mm)', type: 'text' as const, placeholder: 'e.g. 1.2' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'value_mm', header: 'Value (mm)' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Thickness"
      subtitle="Manage thickness options"
      icon={<Ruler size={20} className="text-white" />}
      iconColor="from-sky-500 to-blue-600"
      apiEndpoint="/thickness"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', value_mm: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[14, 165, 233]}
    />
  );
}
