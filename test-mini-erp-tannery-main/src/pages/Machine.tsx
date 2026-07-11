import { Factory } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Machine() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'machine_type', header: 'Type' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false },
    { key: 'name', label: 'Name', required: true },
    { key: 'machine_type', label: 'Machine Type', placeholder: 'e.g. Spray, Dryer' },
    { key: 'capacity', label: 'Capacity', placeholder: 'e.g. 100 sqft/hr' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'machine_type', header: 'Type' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Machine / Equipment"
      subtitle="Manage machines and equipment"
      icon={<Factory size={20} className="text-white" />}
      iconColor="from-slate-500 via-gray-600 to-zinc-700"
      apiEndpoint="/machines"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', machine_type: '', capacity: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[71, 85, 105]}
    />
  );
}
