import { Coins } from 'lucide-react';
import MasterPage from '../components/ui/MasterPage';

export default function CostComponents() {
  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'group_name', header: 'Group' },
    { key: 'name', header: 'Cost Component' },
    { key: 'uom_name', header: 'UOM' },
    {
      key: 'cost_per_uom',
      header: 'Cost / UOM',
      render: (row: any) => Number(row.cost_per_uom ?? 0).toFixed(2),
    },
    { key: 'status', header: 'Status' },
  ];

  const exportColumns = [
    { key: 'code', header: 'Code' },
    { key: 'group_name', header: 'Group' },
    { key: 'name', header: 'Cost Component' },
    { key: 'uom_name', header: 'UOM' },
    { key: 'cost_per_uom', header: 'Cost / UOM' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <MasterPage
      title="Cost Component"
      subtitle="Manage cost components used in General & Machine Cost"
      icon={<Coins size={20} className="text-white" />}
      iconColor="from-amber-500 to-orange-600"
      apiEndpoint="/cost-components"
      columns={columns}
      formFields={[]}
      emptyData={{ code: '', name: '', group_id: '', uom_id: '', cost_per_uom: '0', description: '', status: 'Active' }}
      exportColumns={exportColumns}
      pdfAccentColor={[245, 158, 11]}
      modalSize="max-w-2xl"
      formRoute="/cost-components"
    />
  );
}
