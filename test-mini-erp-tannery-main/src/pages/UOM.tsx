import { Ruler } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function UOM() {
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
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="UOM"
      subtitle="Manage Units of Measure"
      icon={<Ruler size={20} className="text-white" />}
      iconColor="from-teal-500 via-cyan-500 to-sky-600"
      apiEndpoint="/uom"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[20, 184, 166]}
    />
  );
}
