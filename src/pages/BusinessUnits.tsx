import { useState, useEffect } from 'react';
import { Building } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';
import api from '../lib/api';

export default function BusinessUnits() {
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: { id: number; code: string; name: string }[] }>('/companies/dropdown');
        setCompanyOptions((res.data || []).map(c => ({ value: String(c.id), label: `${c.code} - ${c.name}` })));
      } catch {
        setCompanyOptions([]);
      }
    })();
  }, []);

  const columns = [
    { key: 'code', header: 'Code', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'company_name', header: 'Company', sortable: false },
    { key: 'city', header: 'City', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', sortable: true },
  ];

  const formFields = [
    { key: 'company_id', label: 'Parent Company', type: 'select' as const, required: true, options: [{ value: '', label: 'Select company' }, ...companyOptions] },
    { key: 'code', label: 'Code', placeholder: 'Auto-generated' },
    { key: 'name', label: 'Business Unit Name', required: true },
    { key: 'address', label: 'Address', type: 'textarea' as const, gridCol: false },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'phone', label: 'Phone', validate: 'phone' as const },
    { key: 'email', label: 'Email', validate: 'email' as const },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'company_name', header: 'Company' },
    { key: 'city', header: 'City' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status' },
  ];

  const filterOptions = [
    { key: 'city', label: 'City', options: [] },
  ];

  return (
    <MasterPage
      title="Business Unit"
      subtitle="Manage business units (must belong to a Company)"
      icon={<Building size={20} className="text-white" />}
      iconColor="from-teal-600 to-cyan-700"
      apiEndpoint="/business-units"
      columns={columns}
      formFields={formFields}
      emptyData={{ code: '', name: '', company_id: '', address: '', city: '', state: '', phone: '', email: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[13, 148, 136]}
      filterOptions={filterOptions}
      enableArchive={true}
    />
  );
}
