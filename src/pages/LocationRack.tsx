import { Layers } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function LocationRack() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'warehouse_id', header: 'Warehouse ID' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false, placeholder: 'Auto-generated' },
    { key: 'name', label: 'Name', required: true, placeholder: 'Enter location/rack name' },
    { key: 'warehouse_id', label: 'Warehouse ID', placeholder: 'Linked warehouse (optional)' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'warehouse_id', header: 'Warehouse ID' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Location / Rack"
      subtitle="Manage warehouse locations and racks"
      icon={<Layers size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/location-racks"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', warehouse_id: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[59, 130, 246]}
      modalSize="max-w-2xl"
      formRoute="/location-rack"
    />
  );
}
