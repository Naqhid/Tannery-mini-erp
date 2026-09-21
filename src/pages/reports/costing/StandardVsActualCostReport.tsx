import ReportShell from '../../../components/reports/ReportShell';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtPct } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; cost_sheet_no: string; product_name: string; cost_group: string; cost_component: string;
  standard_cost: number; actual_cost: number; variance: number; variance_percent: number;
}

export default function StandardVsActualCostReport({ embedded }: { embedded?: boolean }) {
  const columns: Column<Row>[] = [
    { key: 'cost_sheet_no', header: 'Cost Sheet', render: r => <span className="font-mono text-blue-700">{r.cost_sheet_no}</span> },
    { key: 'product_name', header: 'Product', render: r => <span className="font-medium text-gray-900">{r.product_name}</span> },
    { key: 'cost_group', header: 'Group' },
    { key: 'cost_component', header: 'Cost Component' },
    { key: 'standard_cost', header: 'Standard', align: 'right', render: r => fmtNum(r.standard_cost) },
    { key: 'actual_cost', header: 'Actual', align: 'right', render: r => fmtNum(r.actual_cost) },
    { key: 'variance', header: 'Variance', align: 'right', render: r => <span className={Number(r.variance) < 0 ? 'text-red-600 font-semibold' : 'text-emerald-700 font-semibold'}>{fmtNum(r.variance)}</span> },
    { key: 'variance_percent', header: 'Variance %', align: 'right', render: r => fmtPct(r.variance_percent) },
  ];

  return (
    <ReportShell<Row>
      title="Standard vs Actual Cost"
      subtitle="Cost-component-wise standard (BOM) cost against actual cost with variance."
      endpoint="/reports/costing/standard-vs-actual"
      columns={columns}
      datePreset="this_month"
      embedded={embedded}
      exportFileName="Standard_vs_Actual_Cost"
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={4}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_standard)}</td>
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_actual)}</td>
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_variance)}</td>
          <td />
        </tr>
      )}
    />
  );
}
