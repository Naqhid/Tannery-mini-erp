import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; customer_name: string; article: string; color: string;
  order_qty: number; plan_qty: number; finishing_qty: number; wip_qty: number; measurement_qty: number; bal_to_produce: number; status: string;
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
    // Order Qty is the sales order quantity (Sq.Ft.).
    { key: 'order_qty', header: 'Order Qty (sqft)', align: 'right', render: r => fmtQty(r.order_qty) },
    // Planned / Finishing / WIP are tracked in pieces.
    { key: 'plan_qty', header: 'Planned Qty (pcs)', align: 'right', render: r => fmtQty(r.plan_qty) },
    { key: 'finishing_qty', header: 'Finishing Qty (pcs)', align: 'right', render: r => <span className="font-semibold">{fmtQty(r.finishing_qty)}</span> },
    { key: 'wip_qty', header: 'WIP (pcs)', align: 'right', render: r => fmtQty(r.wip_qty) },
    // Measurement output is the finished Sq.Ft.
    { key: 'measurement_qty', header: 'Measurement (sqft)', align: 'right', render: r => fmtQty(r.measurement_qty) },
    // Balance to produce = Order Qty (sqft) − Measurement (sqft).
    { key: 'bal_to_produce', header: 'Bal to Produce (sqft)', align: 'right', render: r => <span className="text-amber-700 font-semibold">{fmtQty(r.bal_to_produce)}</span> },
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
