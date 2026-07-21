import { Scale } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function UOMForm() {
  return (
    <MasterFormPage
      title="UOM"
      icon={<Scale size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/uom"
      listRoute="/uom"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter UOM name' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
    />
  );
}
