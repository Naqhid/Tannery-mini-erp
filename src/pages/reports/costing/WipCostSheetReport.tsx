import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; order_no: string; plan_no: string; stage: string; article: string; color: string; uom: string;
  input_qty: number; output_qty: number; wip_qty: number; rejection_qty: number;
  material_cost: number; general_cost: number; machine_cost: number; total_cost: number;
  cost_per_pc: number; selling_price: number; cost_per_sqft: number; variance: number;
}

export default function WipCostSheetReport({ embedded, orderNo }: { embedded?: boolean; orderNo?: string }) {
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
    { key: 'rejection_qty', header: 'Rejection', align: 'right', render: r => <span className={Number(r.rejection_qty) > 0 ? 'font-semibold text-rose-600' : 'text-gray-500'}>{fmtQty(r.rejection_qty)}</span> },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => <span className={Number(r.wip_qty) < 0 ? 'font-semibold text-red-600' : 'font-semibold text-amber-700'}>{fmtQty(r.wip_qty)}</span> },
    { key: 'material_cost', header: 'Material', align: 'right', render: r => fmtNum(r.material_cost) },
    { key: 'general_cost', header: 'General', align: 'right', render: r => fmtNum(r.general_cost) },
    { key: 'machine_cost', header: 'Machine', align: 'right', render: r => fmtNum(r.machine_cost) },
    { key: 'total_cost', header: 'Total Cost', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.total_cost)}</span> },
    { key: 'cost_per_pc', header: 'Cost/Pc', align: 'right', render: r => fmtNum(r.cost_per_pc) },
    { key: 'selling_price', header: 'Selling Price', align: 'right', render: r => Number(r.selling_price) > 0 ? fmtNum(r.selling_price) : '—' },
    { key: 'cost_per_sqft', header: 'Cost/Sqft', align: 'right', render: r => fmtNum(r.cost_per_sqft) },
    { key: 'variance', header: 'Variance', align: 'right', render: r => r.stage === 'Measurement' ? <span className={Number(r.variance) >= 0 ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>{fmtNum(r.variance)}</span> : '—' },
  ];

  return (
    <ReportShell<Row>
      title="Stage Costing Breakup"
      subtitle={orderNo ? `Stage-wise cost breakup for order ${orderNo}.` : 'Accumulated cost for in-progress (unfinished) plan stages.'}
      endpoint="/reports/costing/wip-cost-sheet"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="Stage_Costing_Breakup"
      extraParams={{ stage, ...(orderNo ? { search: orderNo } : {}) }}
      filterControls={
        <FilterSelect label="Stage" value={stage} onChange={setStage} options={opts.stages.map(s => ({ value: s, label: s }))} />
      }
    />
  );
}
