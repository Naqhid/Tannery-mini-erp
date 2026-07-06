import { Building2 } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function Company() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'city', header: 'City' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: true },
    { key: 'name', label: 'Company Name', required: true },
    { key: 'address', label: 'Address', type: 'textarea' as const, gridCol: false },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'pin_code', label: 'Pin Code' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'gstin', label: 'GSTIN' },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'city', header: 'City' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Company"
      subtitle="Manage company details"
      icon={<Building2 size={20} className="text-white" />}
      iconColor="from-blue-600 to-indigo-700"
      apiEndpoint="/companies"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', address: '', city: '', state: '', country: '', pin_code: '', phone: '', email: '', gstin: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[37, 99, 235]}
    />
  );
}
