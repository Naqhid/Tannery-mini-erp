import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  stage: string; material_cost: number; general_cost: number; machine_cost: number; total_cost: number; output_qty: number; cost_per_uom: number;
}

export default function StageCostSummaryReport({ embedded }: { embedded?: boolean }) {
  const [stage, setStage] = useState('');
  const [opts, setOpts] = useState<{ stages: string[] }>({ stages: [] });

  useEffect(() => {
    api<{ data: { stages: string[] } }>('/reports/costing/filters')
      .then(r => setOpts({ stages: r.data.stages || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'stage', header: 'Stage', render: r => <span className="font-medium text-gray-900">{r.stage}</span> },
    { key: 'material_cost', header: 'Material Cost', align: 'right', render: r => fmtNum(r.material_cost) },
    { key: 'general_cost', header: 'General Cost', align: 'right', render: r => fmtNum(r.general_cost) },
    { key: 'machine_cost', header: 'Machine Cost', align: 'right', render: r => fmtNum(r.machine_cost) },
    { key: 'total_cost', header: 'Total Cost', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.total_cost)}</span> },
    { key: 'output_qty', header: 'Output Qty', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'cost_per_uom', header: 'Cost/UOM', align: 'right', render: r => fmtNum(r.cost_per_uom) },
  ];

  return (
    <ReportShell<Row>
      title="Stage Cost Summary"
      subtitle="Cost aggregated by process stage across all orders."
      endpoint="/reports/costing/stage-cost-summary"
      columns={columns}
      embedded={embedded}
      exportFileName="Stage_Cost_Summary"
      extraParams={{ stage }}
      filterControls={
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
      }
    />
  );
}
