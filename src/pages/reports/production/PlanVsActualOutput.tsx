import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate, fmtPct } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; plan_no: string; plan_date: string; customer_name: string; article: string; color: string; uom: string;
  planned_qty: number; actual_output: number; variance: number; variance_percent: number;
}

export default function PlanVsActualOutput({ embedded, title, subtitle }: { embedded?: boolean; title?: string; subtitle?: string }) {
  const [customer, setCustomer] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[] } }>('/reports/production/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'plan_no', header: 'Plan No', render: r => <span className="font-mono text-blue-700">{r.plan_no}</span> },
    { key: 'plan_date', header: 'Plan Date', render: r => fmtDate(r.plan_date) },
    { key: 'customer_name', header: 'Customer' },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'uom', header: 'UOM' },
    { key: 'planned_qty', header: 'Plan Qty', align: 'right', render: r => fmtQty(r.planned_qty) },
    { key: 'actual_output', header: 'Actual Output', align: 'right', render: r => fmtQty(r.actual_output) },
    { key: 'variance', header: 'Variance (Plan − Actual)', align: 'right', render: r => <span className={Number(r.variance) > 0 ? 'text-red-600 font-semibold' : 'text-emerald-700 font-semibold'}>{fmtQty(r.variance)}</span> },
    { key: 'variance_percent', header: 'Achieved %', align: 'right', render: r => fmtPct(r.variance_percent) },
  ];

  return (
    <ReportShell<Row>
      title={title || 'Plan vs Actual Output'}
      subtitle={subtitle || 'Planned quantity against actual measurement-stage output.'}
      endpoint="/reports/production/plan-vs-actual"
      columns={columns}
      embedded={embedded}
      exportFileName="Plan_vs_Actual_Output"
      extraParams={{ customer_id: customer }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
      }
    />
  );
}
