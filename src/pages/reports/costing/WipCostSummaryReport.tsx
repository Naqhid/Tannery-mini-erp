import { useEffect, useState } from 'react';
import ReportShell from '../../../components/reports/ReportShell';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';
import api from '../../../lib/api';

interface Row extends Record<string, unknown> {
  order_no: string;
  customer_name: string;
  article: string;
  color: string;
  process_stage: string;
  wip_qty: number;
  material_wip_cost: number;
  general_wip_cost: number;
  machine_wip_cost: number;
  total_wip_cost: number;
}

interface Props {
  embedded?: boolean;
}

export default function WipCostSummaryReport({ embedded }: Props) {
  const [stages, setStages] = useState<string[]>([]);
  const [stage, setStage] = useState('');

  useEffect(() => {
    api<{ data: { stages: string[] } }>('/reports/costing/filters')
      .then(res => setStages(res.data?.stages || []))
      .catch(() => setStages([]));
  }, []);

  const columns: Column<Row>[] = [
    { key: 'order_no', header: 'Sales Order No.', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'customer_name', header: 'Customer', render: r => <span className="font-medium text-gray-900">{r.customer_name}</span> },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'process_stage', header: 'Process Stage', render: r => <span className="font-medium text-gray-700">{r.process_stage}</span> },
    { key: 'wip_qty', header: 'WIP Qty (Pcs)', align: 'right', render: r => fmtQty(r.wip_qty) },
    { key: 'material_wip_cost', header: 'Material WIP Cost (₹)', align: 'right', render: r => fmtNum(r.material_wip_cost) },
    { key: 'general_wip_cost', header: 'General WIP Cost (₹)', align: 'right', render: r => fmtNum(r.general_wip_cost) },
    { key: 'machine_wip_cost', header: 'Machine WIP Cost (₹)', align: 'right', render: r => fmtNum(r.machine_wip_cost) },
    { key: 'total_wip_cost', header: 'Total WIP Cost (₹)', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.total_wip_cost)}</span> },
  ];

  const filterControls = (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Stage</label>
      <select
        value={stage}
        onChange={e => setStage(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Stages</option>
        {stages.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );

  const footer = (_rows: Row[], totals: Record<string, number> | null) => {
    if (!totals) return null;
    return (
      <tr className="bg-gray-50 font-semibold text-gray-900">
        <td className="px-4 py-2.5" colSpan={5}>Total</td>
        <td className="px-4 py-2.5 text-right">{fmtQty(totals.wip_qty)}</td>
        <td className="px-4 py-2.5 text-right">{fmtNum(totals.material_wip_cost)}</td>
        <td className="px-4 py-2.5 text-right">{fmtNum(totals.general_wip_cost)}</td>
        <td className="px-4 py-2.5 text-right">{fmtNum(totals.machine_wip_cost)}</td>
        <td className="px-4 py-2.5 text-right">{fmtNum(totals.total_wip_cost)}</td>
      </tr>
    );
  };

  return (
    <ReportShell<Row>
      title="WIP Cost Summary Report"
      subtitle="Order-wise & stage-wise work-in-progress cost (material, general and machine)."
      endpoint="/reports/costing/wip-cost-summary"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="WIP_Cost_Summary_Report"
      extraParams={{ stage }}
      filterControls={filterControls}
      footer={footer}
    />
  );
}
