import { Layers } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function ProductCategory() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: false, placeholder: 'Auto-generated' },
    { key: 'name', label: 'Name', required: true, placeholder: 'Enter category name' },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Product Category"
      subtitle="Manage product categories"
      icon={<Layers size={20} className="text-white" />}
      iconColor="from-violet-500 via-purple-500 to-fuchsia-600"
      apiEndpoint="/product-categories"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[139, 92, 246]}
    />
  );
}
