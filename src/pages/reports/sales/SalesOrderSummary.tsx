import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty, fmtDate } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; order_date: string; customer_name: string; article: string; color: string; uom: string;
  order_qty: number; unit_price: number; amount: number; status: string;
}

export default function SalesOrderSummary({ embedded }: { embedded?: boolean }) {
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[]; statuses: string[] }>({ customers: [], statuses: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[]; statuses: string[] } }>('/reports/sales/filters')
      .then(r => setOpts({ customers: r.data.customers || [], statuses: r.data.statuses || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'order_no', header: 'Order No', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'order_date', header: 'Order Date', render: r => fmtDate(r.order_date) },
    { key: 'customer_name', header: 'Customer', render: r => <span className="font-medium text-gray-900">{r.customer_name || '—'}</span> },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'uom', header: 'UOM' },
    { key: 'order_qty', header: 'Order Qty', align: 'right', render: r => fmtQty(r.order_qty) },
    { key: 'unit_price', header: 'Rate', align: 'right', render: r => fmtNum(r.unit_price) },
    { key: 'amount', header: 'Amount', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.amount)}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <ReportShell<Row>
      title="Sales Order Summary"
      subtitle="Order-line summary with quantity, rate and value."
      endpoint="/reports/sales/summary"
      columns={columns}
      datePreset="this_month"
      fromKey="from_date"
      toKey="to_date"
      embedded={embedded}
      exportFileName="Sales_Order_Summary"
      extraParams={{ customer_id: customer, status }}
      filterControls={
        <>
          <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={opts.statuses.map(s => ({ value: s, label: s }))} />
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={6}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.total_qty)}</td>
          <td />
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_amount)}</td>
          <td />
        </tr>
      )}
    />
  );
}
