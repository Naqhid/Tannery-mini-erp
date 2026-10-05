import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; production_date: string; transaction_no: string; plan_no: string; process_stage: string;
  article: string; color: string; uom: string; input_qty: number; output_qty: number; rejection_qty: number; wip_qty: number;
}

export default function DailyProductionOutput({ embedded }: { embedded?: boolean }) {
  const [stage, setStage] = useState('');
  const [opts, setOpts] = useState<{ stages: string[] }>({ stages: [] });

  useEffect(() => {
    api<{ data: { stages: string[] } }>('/reports/production/filters')
      .then(r => setOpts({ stages: r.data.stages || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'production_date', header: 'Date', render: r => fmtDate(r.production_date) },
    { key: 'transaction_no', header: 'Txn No', render: r => <span className="font-mono text-blue-700">{r.transaction_no}</span> },
    { key: 'plan_no', header: 'Plan No' },
    { key: 'process_stage', header: 'Stage' },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'uom', header: 'UOM' },
    { key: 'input_qty', header: 'Input', align: 'right', render: r => fmtQty(r.input_qty) },
    { key: 'output_qty', header: 'Output', align: 'right', render: r => <span className="font-semibold">{fmtQty(r.output_qty)}</span> },
    { key: 'rejection_qty', header: 'Rejection', align: 'right', render: r => <span className="text-red-600">{fmtQty(r.rejection_qty)}</span> },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => <span className={Number(r.wip_qty) < 0 ? 'text-red-600 font-semibold' : ''}>{fmtQty(r.wip_qty)}</span> },
  ];

  return (
    <ReportShell<Row>
      title="Daily Production Output"
      subtitle="Day-wise production entries by stage and order."
      endpoint="/reports/production/daily-output"
      columns={columns}
      embedded={embedded}
      exportFileName="Daily_Production_Output"
      extraParams={{ stage }}
      filterControls={
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={7}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.total_input)}</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.total_output)}</td>
          <td className="px-4 py-3 text-sm text-right text-red-600">{fmtQty(totals.total_rejection)}</td>
          <td />
        </tr>
      )}
    />
  );
}
