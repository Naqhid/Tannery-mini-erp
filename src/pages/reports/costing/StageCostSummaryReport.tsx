import ReportShell from '../../../components/reports/ReportShell';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  plan_id: number; plan_no: string; order_no: string; customer_name: string;
  article: string; color: string;
  order_qty: number; output_qty: number; total_cost: number;
  cost_per_sqft: number; selling_price: number; variance: number;
}

interface Props {
  embedded?: boolean;
  onRowClick?: (orderNo: string) => void;
}

export default function StageCostSummaryReport({ embedded, onRowClick }: Props) {
  const costPerSqftClass = (v: number) => (Number(v) >= 0 ? 'font-semibold text-green-600' : 'font-semibold text-red-600');

  const columns: Column<Row>[] = [
    { key: 'customer_name', header: 'Customer', render: r => <span className="font-medium text-gray-900">{r.customer_name}</span> },
    { key: 'order_no', header: 'Order No', render: r => <span className="font-mono text-blue-700">{r.order_no}</span> },
    { key: 'order_qty', header: 'Order Qty', align: 'right', render: r => fmtQty(r.order_qty) },
    { key: 'output_qty', header: 'Output Qty', align: 'right', render: r => fmtQty(r.output_qty) },
    { key: 'total_cost', header: 'Total Cost', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.total_cost)}</span> },
    { key: 'cost_per_sqft', header: 'Cost / Sqft', align: 'right', render: r => <span className={costPerSqftClass(Number(r.cost_per_sqft))}>{fmtNum(r.cost_per_sqft)}</span> },
    { key: 'selling_price', header: 'Selling Price', align: 'right', render: r => Number(r.selling_price) > 0 ? fmtNum(r.selling_price) : '—' },
    { key: 'variance', header: 'Variance', align: 'right', render: r => <span className={Number(r.variance) >= 0 ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>{fmtNum(r.variance)}</span> },
  ];

  return (
    <ReportShell<Row>
      title="Stage Costing Summary"
      subtitle="Per-order cost with output, cost/sqft, selling price and variance. Click a row to see its stage breakup."
      endpoint="/reports/costing/stage-cost-summary"
      columns={columns}
      showDate={false}
      embedded={embedded}
      exportFileName="Stage_Costing_Summary"
      onRowClick={onRowClick ? (row) => onRowClick(String(row.order_no)) : undefined}
    />
  );
}
