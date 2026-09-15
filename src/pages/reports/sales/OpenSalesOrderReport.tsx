import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; order_date: string; delivery_date: string; customer_name: string;
  article: string; color: string; uom: string; order_qty: number; completed_qty: number; balance_qty: number; production_status: string;
}

export default function OpenSalesOrderReport({ embedded }: { embedded?: boolean }) {
  const [customer, setCustomer] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[] } }>('/reports/sales/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'order_no', header: 'Order No', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'order_date', header: 'Order Date', render: r => fmtDate(r.order_date) },
    { key: 'delivery_date', header: 'Delivery', render: r => fmtDate(r.delivery_date) },
    { key: 'customer_name', header: 'Customer' },
    { key: 'article', header: 'Article' },
    { key: 'order_qty', header: 'Order Qty', align: 'right', render: r => fmtQty(r.order_qty) },
    { key: 'completed_qty', header: 'Completed', align: 'right', render: r => fmtQty(r.completed_qty) },
    { key: 'balance_qty', header: 'Balance', align: 'right', render: r => <span className="font-semibold text-amber-700">{fmtQty(r.balance_qty)}</span> },
    { key: 'production_status', header: 'Status', render: r => <StatusBadge status={r.production_status} /> },
  ];

  return (
    <ReportShell<Row>
      title="Open Sales Order Report"
      subtitle="Orders with pending balance quantity (as-on now)."
      endpoint="/reports/sales/open"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="Open_Sales_Orders"
      extraParams={{ customer_id: customer }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
      }
    />
  );
}
