import { Building } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function BusinessUnits() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'city', header: 'City' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status' },
  ];

  const formFields = [
    { key: 'code', label: 'Code', required: true },
    { key: 'name', label: 'Business Unit Name', required: true },
    { key: 'address', label: 'Address', type: 'textarea' as const, gridCol: false },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'city', header: 'City' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Business Units"
      subtitle="Manage business units"
      icon={<Building size={20} className="text-white" />}
      iconColor="from-teal-600 to-cyan-700"
      apiEndpoint="/business-units"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', address: '', city: '', state: '', phone: '', email: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[13, 148, 136]}
    />
  );
}
