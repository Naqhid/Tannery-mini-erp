import { SlidersHorizontal } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function ThicknessForm() {
  return (
    <MasterFormPage
      title="Thickness"
      icon={<SlidersHorizontal size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/thickness"
      listRoute="/thickness"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Thickness Name', required: true, placeholder: 'Enter thickness name' },
        { key: 'value_mm', label: 'Value (mm)', placeholder: 'e.g. 1.2' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', value_mm: '', description: '', status: 'Active' }}
    />
  );
}
