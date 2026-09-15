import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty, fmtDate } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; receipt_no: string; receipt_date: string; po_no: string; supplier_name: string;
  warehouse_name: string; material_code: string; material_name: string; uom: string;
  qty: number; rate: number; amount: number; status: string;
}

export default function MaterialReceiptRegister({ embedded }: { embedded?: boolean }) {
  const [warehouse, setWarehouse] = useState('');
  const [supplier, setSupplier] = useState('');
  const [opts, setOpts] = useState<{ warehouses: { id: number; name: string }[]; suppliers: { id: number; name: string }[] }>({ warehouses: [], suppliers: [] });

  useEffect(() => {
    api<{ data: { warehouses: { id: number; name: string }[]; suppliers: { id: number; name: string }[] } }>('/reports/inventory/filters')
      .then(r => setOpts({ warehouses: r.data.warehouses || [], suppliers: r.data.suppliers || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'receipt_no', header: 'Receipt No', render: r => <span className="font-mono text-blue-700">{r.receipt_no}</span> },
    { key: 'receipt_date', header: 'Date', render: r => fmtDate(r.receipt_date) },
    { key: 'supplier_name', header: 'Vendor' },
    { key: 'po_no', header: 'PO No' },
    { key: 'material_name', header: 'Material', render: r => <span className="font-medium text-gray-900">{r.material_name}</span> },
    { key: 'uom', header: 'UOM' },
    { key: 'qty', header: 'Qty', align: 'right', render: r => fmtQty(r.qty) },
    { key: 'rate', header: 'Rate', align: 'right', render: r => fmtNum(r.rate) },
    { key: 'amount', header: 'Amount', align: 'right', render: r => <span className="font-semibold">{fmtNum(r.amount)}</span> },
  ];

  return (
    <ReportShell<Row>
      title="Material Receipt Register"
      subtitle="Item-wise goods receipts (GRN) with vendor, quantity and amount."
      endpoint="/reports/inventory/receipt-register"
      columns={columns}
      embedded={embedded}
      exportFileName="Material_Receipt_Register"
      extraParams={{ warehouse_id: warehouse, supplier_id: supplier }}
      filterControls={
        <>
          <FilterSelect label="Warehouse" value={warehouse} onChange={setWarehouse} options={opts.warehouses.map(w => ({ value: String(w.id), label: w.name }))} />
          <FilterSelect label="Vendor" value={supplier} onChange={setSupplier} options={opts.suppliers.map(s => ({ value: String(s.id), label: s.name }))} minWidth={170} />
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={6}>Total</td>
          <td className="px-4 py-3 text-sm text-right">{fmtQty(totals.total_qty)}</td>
          <td />
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_amount)}</td>
        </tr>
      )}
    />
  );
}
