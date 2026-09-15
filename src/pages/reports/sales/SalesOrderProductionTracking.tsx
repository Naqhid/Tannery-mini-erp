import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; customer_name: string; article: string; color: string; uom: string;
  order_qty: number; plan_qty: number; output_qty: number; wip_qty: number; order_balance: number; status: string;
}

export default function SalesOrderProductionTracking({ embedded }: { embedded?: boolean }) {
  const [customer, setCustomer] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[] } }>('/reports/sales/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'order_no', header: 'Order No', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'customer_name', header: 'Customer' },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'uom', header: 'UOM' },
    { key: 'order_qty', header: 'Order Qty', align: 'right', render: r => fmtQty(r.order_qty) },
    { key: 'plan_qty', header: 'Plan Qty', align: 'right', render: r => fmtQty(r.plan_qty) },
    { key: 'output_qty', header: 'Output', align: 'right', render: r => <span className="font-semibold">{fmtQty(r.output_qty)}</span> },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => fmtQty(r.wip_qty) },
    { key: 'order_balance', header: 'Order Balance', align: 'right', render: r => <span className="text-amber-700 font-semibold">{fmtQty(r.order_balance)}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <ReportShell<Row>
      title="Sales Order Production Tracking"
      subtitle="Order quantity against planned, produced and WIP quantity."
      endpoint="/reports/sales/production-tracking"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="SO_Production_Tracking"
      extraParams={{ customer_id: customer }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
      }
    />
  );
}
