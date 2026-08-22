import { Layers } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function LocationRackForm() {
  return (
    <MasterFormPage
      title="Location / Rack"
      icon={<Layers size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/location-racks"
      listRoute="/location-rack"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter location/rack name' },
        { key: 'warehouse_id', label: 'Warehouse ID', placeholder: 'Linked warehouse ID (optional)' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', warehouse_id: '', description: '', status: 'Active' }}
    />
  );
}
