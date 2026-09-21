import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; plan_no: string; stage: string; article: string; color: string; uom: string;
  input_qty: number; output_qty: number; wip_qty: number; material_cost: number; general_cost: number; machine_cost: number; total_cost: number; cost_per_pc: number;
}

export default function WipCostSheetReport({ embedded }: { embedded?: boolean }) {
  const [stage, setStage] = useState('');
  const [opts, setOpts] = useState<{ stages: string[] }>({ stages: [] });

  useEffect(() => {
    api<{ data: { stages: string[] } }>('/reports/costing/filters')
      .then(r => setOpts({ stages: r.data.stages || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'order_no', header: 'Order', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'plan_no', header: 'Plan No' },
    { key: 'stage', header: 'Stage', render: r => <span className="font-medium text-gray-900">{r.stage}</span> },
    { key: 'article', header: 'Article' },
    { key: 'input_qty', header: 'Input', align: 'right', render: r => fmtQty(r.input_qty) },
    { key: 'output_qty', header: 'Output', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => <span className={Number(r.wip_qty) < 0 ? 'font-semibold text-red-600' : 'font-semibold text-amber-700'}>{fmtQty(r.wip_qty)}</span> },
    { key: 'material_cost', header: 'Material', align: 'right', render: r => fmtNum(r.material_cost) },
    { key: 'general_cost', header: 'General', align: 'right', render: r => fmtNum(r.general_cost) },
    { key: 'machine_cost', header: 'Machine', align: 'right', render: r => fmtNum(r.machine_cost) },
    { key: 'total_cost', header: 'Total Cost', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.total_cost)}</span> },
    { key: 'cost_per_pc', header: 'Cost/Pc', align: 'right', render: r => fmtNum(r.cost_per_pc) },
  ];

  return (
    <ReportShell<Row>
      title="WIP Cost Sheet"
      subtitle="Accumulated cost for in-progress (unfinished) plan stages."
      endpoint="/reports/costing/wip-cost-sheet"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="WIP_Cost_Sheet"
      extraParams={{ stage }}
      filterControls={
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
      }
    />
  );
}
