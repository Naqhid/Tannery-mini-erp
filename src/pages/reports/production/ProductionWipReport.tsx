import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; sales_order_no: string; plan_no: string; stage: string; article: string; color: string; uom: string;
  input_qty: number; output_qty: number; rejection_qty: number; opening_wip: number; closing_wip: number;
}

export default function ProductionWipReport({ embedded }: { embedded?: boolean }) {
  const [stage, setStage] = useState('');
  const [opts, setOpts] = useState<{ stages: string[] }>({ stages: [] });

  useEffect(() => {
    api<{ data: { stages: string[] } }>('/reports/production/filters')
      .then(r => setOpts({ stages: r.data.stages || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'sales_order_no', header: 'Order', render: r => <span className="font-mono text-blue-700">{r.sales_order_no || '—'}</span> },
    { key: 'plan_no', header: 'Plan No' },
    { key: 'stage', header: 'Stage', render: r => <span className="font-medium text-gray-900">{r.stage}</span> },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'uom', header: 'UOM' },
    { key: 'opening_wip', header: 'Opening WIP', align: 'right', render: r => fmtQty(r.opening_wip) },
    { key: 'input_qty', header: 'Input', align: 'right', render: r => fmtQty(r.input_qty) },
    { key: 'output_qty', header: 'Output', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'rejection_qty', header: 'Rejection', align: 'right', render: r => <span className="text-red-600">{fmtQty(r.rejection_qty)}</span> },
    { key: 'closing_wip', header: 'Closing WIP', align: 'right', render: r => <span className="font-semibold text-amber-700">{fmtQty(r.closing_wip)}</span> },
  ];

  return (
    <ReportShell<Row>
      title="Production WIP Report"
      subtitle="Work-in-progress per plan / stage (as-on now)."
      endpoint="/reports/production/wip"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="Production_WIP"
      extraParams={{ stage }}
      filterControls={
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
      }
    />
  );
}
