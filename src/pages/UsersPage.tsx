import { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';

export default function UsersPage() {
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);
  const [businessUnits, setBusinessUnits] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [rolesRes, companiesRes, buRes] = await Promise.all([
          api<{ data: any[] }>('/roles/dropdown'),
          api<{ data: any[] }>('/companies/dropdown'),
          api<{ data: any[] }>('/business-units/dropdown'),
        ]);
        setRoles((rolesRes.data || []).map((r: any) => ({ value: String(r.id), label: r.name })));
        setCompanies((companiesRes.data || []).map((c: any) => ({ value: String(c.id), label: c.name })));
        setBusinessUnits((buRes.data || []).map((b: any) => ({ value: String(b.id), label: b.name })));
      } catch {}
    })();
  }, []);

  const columns = [
    { key: 'username', header: 'Username', sortable: true },
    { key: 'full_name', header: 'Full Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
  ];

  const formFields = [
    { key: 'username', label: 'Username', required: true },
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', required: true, validate: 'email' as const },
    { key: 'password', label: 'Password', required: true },
    { key: 'role_id', label: 'Role', type: 'select' as const, required: true, options: [{ value: '', label: 'Select role' }, ...roles] },
    { key: 'company_id', label: 'Company', type: 'select' as const, options: [{ value: '', label: 'Select company' }, ...companies] },
    { key: 'business_unit_id', label: 'Business Unit', type: 'select' as const, options: [{ value: '', label: 'Select BU' }, ...businessUnits] },
  ];

  const exportColumns = [
    { key: 'username', header: 'Username' },
    { key: 'full_name', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
  ];

  const filterOptions = [
    { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }] },
  ];

  return (
    <MasterPage
      title="User"
      subtitle="Manage system users and access"
      icon={<Users size={20} className="text-white" />}
      iconColor="from-blue-600 to-indigo-700"
      apiEndpoint="/users"
      columns={columns}
      formFields={formFields}
      emptyData={{
        username: '', full_name: '', email: '', password: '',
        role_id: '', company_id: '', business_unit_id: '', status: 'Active',
      }}
      exportColumns={exportColumns}
      pdfAccentColor={[37, 99, 235]}
      filterOptions={filterOptions}
      enableArchive={true}
    />
  );
}
