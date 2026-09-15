import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; customer_name: string; article: string; color: string; uom: string;
  output_qty: number; material_cost: number; general_cost: number; machine_cost: number; total_cost: number; cost_per_pc: number;
}

export default function FullOrderCostSheetReport({ embedded }: { embedded?: boolean }) {
  const [customer, setCustomer] = useState('');
  const [opts, setOpts] = useState<{ customers: string[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: string[] } }>('/reports/costing/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'order_no', header: 'Order', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'customer_name', header: 'Customer', render: r => <span className="font-medium text-gray-900">{r.customer_name}</span> },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'output_qty', header: 'Output', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'material_cost', header: 'Material', align: 'right', render: r => fmtNum(r.material_cost) },
    { key: 'general_cost', header: 'General', align: 'right', render: r => fmtNum(r.general_cost) },
    { key: 'machine_cost', header: 'Machine', align: 'right', render: r => fmtNum(r.machine_cost) },
    { key: 'total_cost', header: 'Total Cost', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.total_cost)}</span> },
    { key: 'cost_per_pc', header: 'Cost/Pc', align: 'right', render: r => fmtNum(r.cost_per_pc) },
  ];

  return (
    <ReportShell<Row>
      title="Full Order Cost Sheet"
      subtitle="Order-level total cost with material, general and machine breakdown."
      endpoint="/reports/costing/full-order-cost-sheet"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="Full_Order_Cost_Sheet"
      extraParams={{ customer }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: c, label: c }))} minWidth={170} />
      }
    />
  );
}
