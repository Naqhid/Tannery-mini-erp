import { Palette } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function ColorForm() {
  return (
    <MasterFormPage
      title="Color"
      icon={<Palette size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/colors"
      listRoute="/color"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter color name' },
        { key: 'hex_code', label: 'Hex Code', placeholder: 'e.g. #000000' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', hex_code: '', description: '', status: 'Active' }}
    />
  );
}
