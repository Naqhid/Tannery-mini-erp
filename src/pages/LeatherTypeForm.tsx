import { Scissors } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function LeatherTypeForm() {
  return (
    <MasterFormPage
      title="Leather Type"
      icon={<Scissors size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/leather-types"
      listRoute="/leather-type"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter name' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
    />
  );
}
