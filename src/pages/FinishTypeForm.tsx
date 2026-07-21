import { Sparkles } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function FinishTypeForm() {
  return (
    <MasterFormPage
      title="Finish Type"
      icon={<Sparkles size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/finish-types"
      listRoute="/finish-type"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter finish type name' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
    />
  );
}
