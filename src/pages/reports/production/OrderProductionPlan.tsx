import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; sales_order_no: string; plan_no: string; plan_date: string; customer_name: string;
  article: string; color: string; uom: string; plan_qty: number; output_qty: number; wip_qty: number; status: string;
}

export default function OrderProductionPlan({ embedded }: { embedded?: boolean }) {
  const [customer, setCustomer] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[] } }>('/reports/production/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'sales_order_no', header: 'Order No', render: r => <span className="font-mono text-blue-700">{r.sales_order_no || '—'}</span> },
    { key: 'plan_no', header: 'Plan No' },
    { key: 'plan_date', header: 'Plan Date', render: r => fmtDate(r.plan_date) },
    { key: 'customer_name', header: 'Customer' },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'plan_qty', header: 'Plan Qty', align: 'right', render: r => fmtQty(r.plan_qty) },
    { key: 'output_qty', header: 'Output', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => fmtQty(r.wip_qty) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <ReportShell<Row>
      title="Order Production Plan"
      subtitle="Sales-order-linked production plans with output and WIP."
      endpoint="/reports/production/order-plan"
      columns={columns}
      embedded={embedded}
      exportFileName="Order_Production_Plan"
      extraParams={{ customer_id: customer }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
      }
    />
  );
}
