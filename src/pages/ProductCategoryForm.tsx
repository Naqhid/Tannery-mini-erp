import { Box } from 'lucide-react';
import MasterFormPage from './MasterFormPage';

export default function ProductCategoryForm() {
  return (
    <MasterFormPage
      title="Product Category"
      icon={<Box size={22} className="text-white" />}
      iconColor="from-blue-500 to-blue-600"
      apiEndpoint="/product-categories"
      listRoute="/product-category"
      formFields={[
        { key: 'code', label: 'Code', placeholder: 'Auto-generated', disabled: true },
        { key: 'name', label: 'Name', required: true, placeholder: 'Enter category name' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      emptyData={{ code: '', name: '', description: '', status: 'Active' }}
    />
  );
}
