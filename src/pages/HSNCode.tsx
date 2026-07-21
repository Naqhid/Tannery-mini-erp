import { Hash } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function HSNCode() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'gst_rate', header: 'GST Rate (%)' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'HSN Code', required: true },
    { key: 'name', label: 'Name', required: true },
    { key: 'gst_rate', label: 'GST Rate (%)', type: 'text' as const, placeholder: 'e.g. 18' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'HSN Code' },
    { key: 'name', header: 'Name' },
    { key: 'gst_rate', header: 'GST Rate (%)' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="HSN Code"
      subtitle="Manage HSN codes for GST"
      icon={<Hash size={20} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/hsn-codes"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', gst_rate: 18, description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[59, 130, 246]}
      modalSize="max-w-2xl"
      formRoute="/hsn-code"
    />
  );
}
