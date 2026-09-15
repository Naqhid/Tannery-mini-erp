import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate, fmtPct } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; order_date: string; delivery_date: string; customer_name: string;
  article: string; color: string; uom: string; order_qty: number; shipped_qty: number; pending_qty: number; fulfillment_percent: number; status: string;
}

export default function OrderFulfillmentReport({ embedded }: { embedded?: boolean }) {
  const [customer, setCustomer] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[] } }>('/reports/sales/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'order_no', header: 'Order No', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'order_date', header: 'Order Date', render: r => fmtDate(r.order_date) },
    { key: 'customer_name', header: 'Customer' },
    { key: 'article', header: 'Article' },
    { key: 'uom', header: 'UOM' },
    { key: 'order_qty', header: 'Ordered', align: 'right', render: r => fmtQty(r.order_qty) },
    { key: 'shipped_qty', header: 'Shipped', align: 'right', render: r => fmtQty(r.shipped_qty) },
    { key: 'pending_qty', header: 'Pending', align: 'right', render: r => <span className="text-amber-700 font-semibold">{fmtQty(r.pending_qty)}</span> },
    { key: 'fulfillment_percent', header: 'Fulfilled %', align: 'right', render: r => fmtPct(r.fulfillment_percent) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <ReportShell<Row>
      title="Order Fulfillment Report"
      subtitle="Ordered vs shipped vs pending quantity per order line."
      endpoint="/reports/sales/fulfillment"
      columns={columns}
      embedded={embedded}
      exportFileName="Order_Fulfillment"
      extraParams={{ customer_id: customer }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
      }
    />
  );
}
