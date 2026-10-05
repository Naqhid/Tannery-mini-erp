import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty, fmtDate } from '../../../lib/reportFormat';
import StatusBadge from '../../../components/reports/StatusBadge';

interface Row extends Record<string, unknown> {
  id: number; outbound_date: string; outbound_no: string; delivery_challan_no: string;
  warehouse_name: string; supplier_name: string;
  total_qty: number; total_amount: number; status: string; remarks: string;
}

export default function DeliveryChallanReport({ embedded }: { embedded?: boolean }) {
  const [warehouse, setWarehouse] = useState('');
  const [supplier, setSupplier] = useState('');
  const [opts, setOpts] = useState<{ warehouses: { id: number; name: string }[]; suppliers: { id: number; name: string }[] }>({ warehouses: [], suppliers: [] });

  useEffect(() => {
    api<{ data: { warehouses: { id: number; name: string }[]; suppliers: { id: number; name: string }[] } }>('/reports/inventory/filters')
      .then(r => setOpts({ warehouses: r.data.warehouses || [], suppliers: r.data.suppliers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'outbound_date', header: 'Date', render: r => fmtDate(r.outbound_date) },
    { key: 'outbound_no', header: 'Outbound No', render: r => <span className="font-mono text-blue-700">{r.outbound_no}</span> },
    { key: 'delivery_challan_no', header: 'Delivery Challan No', render: r => r.delivery_challan_no ? <span className="font-mono text-orange-700">{r.delivery_challan_no}</span> : '—' },
    { key: 'warehouse_name', header: 'Warehouse' },
    { key: 'supplier_name', header: 'Supplier' },
    { key: 'total_qty', header: 'Total Qty', align: 'right', render: r => fmtQty(r.total_qty) },
    { key: 'total_amount', header: 'Total Amount', align: 'right', render: r => fmtNum(r.total_amount) },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'remarks', header: 'Remarks', render: r => r.remarks || '—' },
  ];

  return (
    <ReportShell<Row>
      title="Delivery Challan Report"
      subtitle="Report of all outbound deliveries with delivery challan numbers."
      endpoint="/reports/inventory/delivery-challan"
      columns={columns}
      embedded={embedded}
      exportFileName="Delivery_Challan_Report"
      extraParams={{ warehouse_id: warehouse, supplier_id: supplier }}
      filterControls={
        <>
          <FilterSelect label="Warehouse" value={warehouse} onChange={setWarehouse} options={opts.warehouses.map(w => ({ value: String(w.id), label: w.name }))} />
          <FilterSelect label="Supplier" value={supplier} onChange={setSupplier} options={opts.suppliers.map(s => ({ value: String(s.id), label: s.name }))} />
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={5}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.total_qty || 0)}</td>
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_amount || 0)}</td>
          <td />
          <td />
        </tr>
      )}
    />
  );
}
