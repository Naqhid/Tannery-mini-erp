import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtPct } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  stage_name: string; input_qty: number; output_qty: number; rejection_qty: number; wip_qty: number; output_percent: number;
}

export default function StageWiseProduction({ embedded }: { embedded?: boolean }) {
  const [stage, setStage] = useState('');
  const [opts, setOpts] = useState<{ stages: string[] }>({ stages: [] });

  useEffect(() => {
    api<{ data: { stages: string[] } }>('/reports/production/filters')
      .then(r => setOpts({ stages: r.data.stages || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'stage_name', header: 'Stage', render: r => <span className="font-medium text-gray-900">{r.stage_name}</span> },
    { key: 'input_qty', header: 'Input Qty', align: 'right', render: r => fmtQty(r.input_qty) },
    { key: 'output_qty', header: 'Output Qty', align: 'right', render: r => <span className="font-semibold">{fmtQty(r.output_qty)}</span> },
    { key: 'rejection_qty', header: 'Rejection', align: 'right', render: r => <span className="text-red-600">{fmtQty(r.rejection_qty)}</span> },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => fmtQty(r.wip_qty) },
    { key: 'output_percent', header: 'Output %', align: 'right', render: r => fmtPct(r.output_percent) },
  ];

  return (
    <ReportShell<Row>
      title="Stage-wise Production Report"
      subtitle="Aggregated input, output and rejection per process stage."
      endpoint="/reports/production/stage-wise"
      columns={columns}
      embedded={embedded}
      exportFileName="Stage_wise_Production"
      extraParams={{ stage }}
      filterControls={
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
      }
    />
  );
}
