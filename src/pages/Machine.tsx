import { Factory } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Machine() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'machine_type', header: 'Machine Type' },
    { key: 'name', header: 'Machine Name' },
    { key: 'uom_type', header: 'UOM' },
    { key: 'rate_indian', header: 'Rate' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Machine Code', required: false, disabled: true },
    { key: 'machine_type', label: 'Machine Type', type: 'select' as const, required: true, options: [
      { value: '', label: 'Select Machine Type' },
      { value: 'Wet End', label: 'Wet End' },
      { value: 'Finishing', label: 'Finishing' },
    ]},
    { key: 'name', label: 'Machine Name', required: true, placeholder: 'Enter machine name' },
    { key: 'uom_type', label: 'UOM', type: 'select' as const, required: true, options: [
      { value: '', label: 'Select UOM' },
      { value: 'Per Hour', label: 'Per Hour' },
      { value: 'Per Pcs', label: 'Per Pcs' },
    ]},
    { key: 'rate_indian', label: 'Rate', placeholder: 'e.g. 150.00' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'machine_type', header: 'Machine Type' },
    { key: 'name', header: 'Machine Name' },
    { key: 'uom_type', header: 'UOM' },
    { key: 'rate_indian', header: 'Rate' },
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
      emptyData={{ code: '', machine_type: '', name: '', uom_type: '', rate_indian: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[71, 85, 105]}
      formRoute="/machine"
    />
  );
}
