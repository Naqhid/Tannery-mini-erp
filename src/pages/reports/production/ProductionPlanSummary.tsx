import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; plan_no: string; plan_date: string; customer_name: string; sales_order_no: string;
  article: string; color: string; uom: string; planned_qty: number; output_qty: number; wip_qty: number; balance_qty: number; status_val: string;
}

export default function ProductionPlanSummary({ embedded }: { embedded?: boolean }) {
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[]; statuses: string[] }>({ customers: [], statuses: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[]; statuses: string[] } }>('/reports/production/filters')
      .then(r => setOpts({ customers: r.data.customers || [], statuses: r.data.statuses || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'plan_no', header: 'Plan No', render: r => <span className="font-mono text-blue-700">{r.plan_no}</span> },
    { key: 'plan_date', header: 'Plan Date', render: r => fmtDate(r.plan_date) },
    { key: 'sales_order_no', header: 'Order' },
    { key: 'customer_name', header: 'Customer', render: r => <span className="font-medium text-gray-900">{r.customer_name || '—'}</span> },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'planned_qty', header: 'Planned Qty', align: 'right', render: r => fmtQty(r.planned_qty) },
    { key: 'output_qty', header: 'Actual Output', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => fmtQty(r.wip_qty) },
    { key: 'balance_qty', header: 'Balance', align: 'right', render: r => fmtQty(r.balance_qty) },
    { key: 'status_val', header: 'Status', render: r => <StatusBadge status={r.status_val} /> },
  ];

  return (
    <ReportShell<Row>
      title="Production Plan Summary"
      subtitle="Plan-wise planned vs actual output, WIP and balance."
      endpoint="/reports/production/plan-summary"
      columns={columns}
      embedded={embedded}
      exportFileName="Production_Plan_Summary"
      extraParams={{ customer_id: customer, status }}
      filterControls={
        <>
          <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={opts.statuses.map(s => ({ value: s, label: s }))} />
        </>
      }
    />
  );
}
