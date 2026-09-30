import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtQty, fmtDate } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; sales_order_no: string; order_qty: number; customer_name: string; article: string; color: string; uom: string;
  wet_blue_output: number; finishing_output: number; measurement_output: number; packing_output: number; shipment_output: number;
  total_output: number; wip_qty: number; status: string;
}

export default function OrderProductionPlan({ embedded }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState('');
  const [opts, setOpts] = useState<{ customers: { id: number; name: string }[] }>({ customers: [] });

  useEffect(() => {
    api<{ data: { customers: { id: number; name: string }[] } }>('/reports/production/filters')
      .then(r => setOpts({ customers: r.data.customers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'sales_order_no', header: 'Order No', render: r => <button onClick={() => navigate('/reports/production-plan', { state: { filter: { sales_order_no: r.sales_order_no } } })} className="font-mono text-blue-700 hover:underline cursor-pointer">{r.sales_order_no}</button> },
    { key: 'customer_name', header: 'Customer' },
    { key: 'article', header: 'Article' },
    { key: 'color', header: 'Color' },
    { key: 'uom', header: 'UOM' },
    { key: 'order_qty', header: 'Order Qty', align: 'right', render: r => fmtQty(r.order_qty) },
    { key: 'wet_blue_output', header: 'Wet Blue', align: 'right', render: r => <span className="text-blue-600">{fmtQty(r.wet_blue_output || 0)}</span> },
    { key: 'finishing_output', header: 'Finishing', align: 'right', render: r => <span className="text-emerald-600">{fmtQty(r.finishing_output || 0)}</span> },
    { key: 'measurement_output', header: 'Measurement', align: 'right', render: r => <span className="text-purple-600">{fmtQty(r.measurement_output || 0)}</span> },
    { key: 'packing_output', header: 'Packing', align: 'right', render: r => <span className="text-amber-600">{fmtQty(r.packing_output || 0)}</span> },
    { key: 'shipment_output', header: 'Shipment', align: 'right', render: r => <span className="text-orange-600">{fmtQty(r.shipment_output || 0)}</span> },
    { key: 'total_output', header: 'Total Output', align: 'right', render: r => <span className="font-semibold">{fmtQty(r.total_output)}</span> },
    { key: 'wip_qty', header: 'WIP', align: 'right', render: r => <span className="text-amber-600">{fmtQty(r.wip_qty)}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <ReportShell<Row>
      title="Order Production Plan"
      subtitle="Sales-order-linked production plans with stage-wise outputs."
      endpoint="/reports/production/order-plan"
      columns={columns}
      embedded={embedded}
      exportFileName="Order_Production_Plan"
      extraParams={{ customer_id: customer }}
      filterControls={
        <FilterSelect label="Customer" value={customer} onChange={setCustomer} options={opts.customers.map(c => ({ value: String(c.id), label: c.name }))} minWidth={170} />
      }
    />
  );
}
