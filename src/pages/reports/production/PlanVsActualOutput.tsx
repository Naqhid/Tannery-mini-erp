import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; plan_no: string; plan_date: string; customer_name: string; article: string; color: string; uom: string;
  stage: string; planned_qty: number; actual_output: number; wip_qty: number; rejection_qty: number; status: string;
}

export default function PlanVsActualOutput({ embedded, title, subtitle }: { embedded?: boolean; title?: string; subtitle?: string }) {
  const location = useLocation();
  const [customer, setCustomer] = useState('');
  const [planNoFilter, setPlanNoFilter] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[] } }>('/reports/production/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
    
    // Check if filter was passed from navigation
    if (location.state?.filter?.plan_no) {
      setPlanNoFilter(location.state.filter.plan_no);
    }
  }, [location.state]);

  const columns: Column<Row>[] = [
    { key: 'plan_no', header: 'Plan No', render: r => <span className="font-mono text-blue-700">{r.plan_no}</span> },
    { key: 'plan_date', header: 'Date', render: r => fmtDate(r.plan_date) },
    { key: 'customer_name', header: 'Customer' },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'uom', header: 'UOM' },
    { key: 'stage', header: 'Stage' },
    { key: 'planned_qty', header: 'Planned Qty', align: 'right', render: r => fmtQty(r.planned_qty) },
    { key: 'actual_output', header: 'Actual Output', align: 'right', render: r => <span className="text-emerald-700">{fmtQty(r.actual_output)}</span> },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => <span className="text-amber-600">{fmtQty(r.wip_qty)}</span> },
    { key: 'rejection_qty', header: 'Rejection', align: 'right', render: r => <span className="text-red-600">{fmtQty(r.rejection_qty || 0)}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <ReportShell<Row>
      title={title || 'Plan vs Actual Output'}
      subtitle={subtitle || 'Planned quantity compared to actual production output with WIP and status.'}
      endpoint="/reports/production/plan-vs-actual"
      columns={columns}
      embedded={embedded}
      exportFileName="Plan_vs_Actual_Output"
      extraParams={{ customer_id: customer, plan_no: planNoFilter }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
      }
    />
  );
}
