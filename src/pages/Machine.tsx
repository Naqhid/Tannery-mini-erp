import { Factory } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Machine() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'uom_type', header: 'UOM' },
    { key: 'rate_indian', header: 'Rate (Indian)' },
    { key: 'rate_imported', header: 'Rate (Imported)' },
    { key: 'machine_type', header: 'Type' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false },
    { key: 'name', label: 'Name', required: true },
    { key: 'uom_type', label: 'UOM', type: 'select' as const, required: true, options: [{ value: '', label: 'Select UOM' }, { value: 'Per Hour', label: 'Per Hour' }, { value: 'Per Pcs', label: 'Per Pcs' }] },
    { key: 'rate_indian', label: 'Rate (Indian Materials)', placeholder: 'e.g. 150.00' },
    { key: 'rate_imported', label: 'Rate (Imported Materials)', placeholder: 'e.g. 250.00' },
    { key: 'machine_type', label: 'Machine Type', placeholder: 'e.g. Spray, Dryer' },
    { key: 'capacity', label: 'Capacity', placeholder: 'e.g. 100 sqft/hr' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'uom_type', header: 'UOM' },
    { key: 'rate_indian', header: 'Rate (Indian)' },
    { key: 'rate_imported', header: 'Rate (Imported)' },
    { key: 'machine_type', header: 'Type' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Machine / Equipment"
      subtitle="Manage machines and equipment with rates"
      icon={<Factory size={20} className="text-white" />}
      iconColor="from-slate-500 via-gray-600 to-zinc-700"
      apiEndpoint="/machines"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', uom_type: '', rate_indian: '', rate_imported: '', machine_type: '', capacity: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[71, 85, 105]}
    />
  );
}
