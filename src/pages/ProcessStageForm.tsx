import { GitBranch } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function ProcessStageForm() {
  return (
    <MasterFormPage
      title="Process Stage"
      icon={<GitBranch size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/process-stages"
      listRoute="/process-stage"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter process stage name' },
        { key: 'seq', label: 'Sequence', placeholder: 'Display order' },
        { key: 'uom', label: 'UOM', placeholder: 'e.g. Sq.Ft., Pcs, Kg' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', seq: '', uom: '', description: '', status: 'Active' }}
    />
  );
}
