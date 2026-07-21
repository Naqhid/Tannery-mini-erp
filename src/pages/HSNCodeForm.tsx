import { Hash } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function HSNCodeForm() {
  return (
    <MasterFormPage
      title="HSN Code"
      icon={<Hash size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/hsn-codes"
      listRoute="/hsn-code"
      formFields={[
        { key: 'code', label: 'HSN Code', required: true, placeholder: 'Enter HSN code' },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter name' },
        { key: 'gst_rate', label: 'GST Rate (%)', placeholder: 'e.g. 18' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', gst_rate: '', description: '', status: 'Active' }}
    />
  );
}
