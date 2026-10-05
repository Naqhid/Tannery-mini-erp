import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate, fmtPct } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; plan_no: string; plan_date: string; article: string; color: string; seq: number;
  stage_name: string; plan_qty: number; output_qty: number; wip_qty: number; completion_percent: number; status: string;
}

export default function ProductionPlanStatus({ embedded }: { embedded?: boolean }) {
  const [stage, setStage] = useState('');
  const [opts, setOpts] = useState<{ stages: string[] }>({ stages: [] });

  useEffect(() => {
    api<{ data: { stages: string[] } }>('/reports/production/filters')
      .then(r => setOpts({ stages: r.data.stages || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'plan_no', header: 'Plan No', render: r => <span className="font-mono text-blue-700">{r.plan_no}</span> },
    { key: 'plan_date', header: 'Date', render: r => fmtDate(r.plan_date) },
    { key: 'article', header: 'Article' },
    { key: 'stage_name', header: 'Stage', render: r => <span className="font-medium text-gray-900">{r.stage_name}</span> },
    { key: 'plan_qty', header: 'Plan Qty', align: 'right', render: r => fmtQty(r.plan_qty) },
    { key: 'output_qty', header: 'Output Qty', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => fmtQty(r.wip_qty) },
    { key: 'completion_percent', header: 'Completion %', align: 'right', render: r => fmtPct(r.completion_percent) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <ReportShell<Row>
      title="Production Plan Status"
      subtitle="Stage-wise completion status for each production plan."
      endpoint="/reports/production/plan-status"
      columns={columns}
      embedded={embedded}
      exportFileName="Production_Plan_Status"
      extraParams={{ stage }}
      filterControls={
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
      }
    />
  );
}
