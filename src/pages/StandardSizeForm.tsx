import { Ruler } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function StandardSizeForm() {
  return (
    <MasterFormPage
      title="Standard Size"
      icon={<Ruler size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/standard-sizes"
      listRoute="/standard-size"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter standard size name' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
    />
  );
}
