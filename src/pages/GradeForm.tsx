import { Award } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function GradeForm() {
  return (
    <MasterFormPage
      title="Grade"
      icon={<Award size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/grades"
      listRoute="/grade"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Grade Name', required: true, placeholder: 'Enter grade name' },
        { key: 'rank', label: 'Ranking', placeholder: '1-4' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', rank: '', description: '', status: 'Active' }}
    />
  );
}
