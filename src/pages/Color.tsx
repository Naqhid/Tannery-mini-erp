import { Palette } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Color() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'hex_code', header: 'Hex Code' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false },
    { key: 'name', label: 'Name', required: true },
    { key: 'hex_code', label: 'Hex Code', placeholder: 'e.g. #000000' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'hex_code', header: 'Hex Code' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Color"
      subtitle="Manage color options"
      icon={<Palette size={20} className="text-white" />}
      iconColor="from-pink-500 via-rose-500 to-red-500"
      apiEndpoint="/colors"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', hex_code: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[236, 72, 153]}
    />
  );
}
