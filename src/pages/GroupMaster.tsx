import { Layers } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function GroupMaster() {
  const columns = [
    { key: 'code', header: 'Group Code' },
    { key: 'name', header: 'Group Name' },
    { key: 'category_name', header: 'Product Category' },
    { key: 'hsn_code', header: 'HSN Code' },
    { key: 'gst_rate', header: 'GST Rate (%)' },
    { key: 'status', header: 'Status' },
  ];

  const exportColumns = [
    { key: 'code', header: 'Group Code' },
    { key: 'name', header: 'Group Name' },
    { key: 'category_name', header: 'Product Category' },
    { key: 'hsn_code', header: 'HSN Code' },
    { key: 'gst_rate', header: 'GST Rate (%)' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Group"
      subtitle="Manage product & material groups with HSN codes"
      icon={<Layers size={20} className="text-white" />}
      iconColor="from-violet-500 to-purple-600"
      apiEndpoint="/group-master/with-category"
      columns={columns}
      formFields={[]}
      emptyData={{ code: '', name: '', category_id: '', hsn_code: '', gst_rate: '18', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[139, 92, 246]}
      modalSize="max-w-2xl"
      formRoute="/group-master"
    />
  );
}
