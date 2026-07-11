import { Package } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useDropdowns } from '../lib/useDropdowns';

export default function ProductMaster() {
  const { dropdowns } = useDropdowns([
    'product-categories', 'leather-types', 'uom', 'thickness',
    'standard-sizes', 'colors', 'finish-types', 'grades', 'hsn-codes',
  ]);

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'category_name', header: 'Category', sortable: true },
    { key: 'leather_type_name', header: 'Leather Type', sortable: true },
    { key: 'thickness_name', header: 'Thickness', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];

  const formFields = [
    { key: 'name', label: 'Product Name', required: true },
    { key: 'category_id', label: 'Category', required: true, type: 'select' as const, options: [{ value: '', label: 'Select category' }, ...(dropdowns['product-categories']?.options || [])] },
    { key: 'leather_type_id', label: 'Leather Type', required: true, type: 'select' as const, options: [{ value: '', label: 'Select type' }, ...(dropdowns['leather-types']?.options || [])] },
    { key: 'uom_id', label: 'UOM', required: true, type: 'select' as const, options: [{ value: '', label: 'Select UOM' }, ...(dropdowns['uom']?.options || [])] },
    { key: 'thickness_id', label: 'Thickness', required: true, type: 'select' as const, options: [{ value: '', label: 'Select thickness' }, ...(dropdowns['thickness']?.options || [])] },
    { key: 'standard_size_id', label: 'Standard Size', type: 'select' as const, options: [{ value: '', label: 'Select size' }, ...(dropdowns['standard-sizes']?.options || [])] },
    { key: 'color_id', label: 'Color', type: 'select' as const, options: [{ value: '', label: 'Select color' }, ...(dropdowns['colors']?.options || [])] },
    { key: 'finish_type_id', label: 'Finish Type', type: 'select' as const, options: [{ value: '', label: 'Select finish' }, ...(dropdowns['finish-types']?.options || [])] },
    { key: 'grade_id', label: 'Grade', type: 'select' as const, options: [{ value: '', label: 'Select grade' }, ...(dropdowns['grades']?.options || [])] },
    { key: 'hsn_code_id', label: 'HSN Code', type: 'select' as const, options: [{ value: '', label: 'Select HSN' }, ...(dropdowns['hsn-codes']?.options || [])] },
    { key: 'description', label: 'Description', type: 'textarea' as const, gridCol: false },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'category_name', header: 'Category' },
    { key: 'leather_type_name', header: 'Leather Type' },
    { key: 'thickness_name', header: 'Thickness' },
    { key: 'status', header: 'Status' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
  ];

  return (
    <MasterPage
      title="Product"
      subtitle="Manage product master data"
      icon={<Package size={20} className="text-white" />}
      iconColor="from-teal-500 to-emerald-600"
      apiEndpoint="/products"
      columns={columns}
      formFields={formFields}
      emptyData={{
        code: '', name: '', category_id: '', leather_type_id: '', uom_id: '', thickness_id: '',
        standard_size_id: '', color_id: '', finish_type_id: '', grade_id: '', hsn_code_id: '',
        description: '', status: 'Active',
      }}
      exportColumns={exportColumns}
      pdfAccentColor={[20, 184, 166]}
      filterOptions={filterOptions}
      enableArchive={true}
    />
  );
}
