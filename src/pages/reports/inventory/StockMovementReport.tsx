import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ReportShell from '../../../components/reports/ReportShell';
import FilterSelect from '../../../components/reports/FilterSelect';
import { Column } from '../../../components/reports/ReportTable';
import { fmtNum, fmtQty, fmtDate } from '../../../lib/reportFormat';

interface Row extends Record<string, unknown> {
  id: number; transaction_date: string; transaction_type: string; reference_no: string;
  material_name: string; warehouse_name: string; uom: string;
  in_qty: number; out_qty: number; rate: number; amount: number; balance_qty: number;
}

export default function StockMovementReport({ embedded }: { embedded?: boolean }) {
  const [warehouse, setWarehouse] = useState('');
  const [txnType, setTxnType] = useState('');
  const [opts, setOpts] = useState<{ warehouses: { id: number; name: string }[]; transaction_types: string[] }>({ warehouses: [], transaction_types: [] });

  useEffect(() => {
    api<{ data: { warehouses: { id: number; name: string }[]; transaction_types: string[] } }>('/reports/inventory/filters')
      .then(r => setOpts({ warehouses: r.data.warehouses || [], transaction_types: r.data.transaction_types || [] })).catch(() => {});
  }, []);

  const columns: Column<Row>[] = [
    { key: 'transaction_date', header: 'Date', render: r => fmtDate(r.transaction_date) },
    { key: 'transaction_type', header: 'Type', render: r => <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{r.transaction_type}</span> },
    { key: 'reference_no', header: 'Reference', render: r => <span className="font-mono text-blue-700">{r.reference_no || '—'}</span> },
    { key: 'material_name', header: 'Item', render: r => <span className="font-medium text-gray-900">{r.material_name}</span> },
    { key: 'warehouse_name', header: 'Warehouse' },
    { key: 'uom', header: 'UOM' },
    { key: 'in_qty', header: 'In Qty', align: 'right', render: r => <span className="text-emerald-700">{fmtQty(r.in_qty)}</span> },
    { key: 'out_qty', header: 'Out Qty', align: 'right', render: r => <span className="text-red-600">{fmtQty(r.out_qty)}</span> },
    { key: 'rate', header: 'Rate', align: 'right', render: r => fmtNum(r.rate) },
    { key: 'amount', header: 'Value', align: 'right', render: r => fmtNum(r.amount) },
  ];

  return (
    <ReportShell<Row>
      title="Stock Movement Report"
      subtitle="All inward / outward stock transactions from the stock ledger."
      endpoint="/reports/inventory/stock-movement"
      columns={columns}
      embedded={embedded}
      exportFileName="Stock_Movement"
      extraParams={{ warehouse_id: warehouse, transaction_type: txnType }}
      filterControls={
        <>
          <FilterSelect label="Warehouse" value={warehouse} onChange={setWarehouse} options={opts.warehouses.map(w => ({ value: String(w.id), label: w.name }))} />
          <FilterSelect label="Transaction Type" value={txnType} onChange={setTxnType} options={opts.transaction_types.map(t => ({ value: t, label: t }))} minWidth={160} />
        </>
      }
      footer={(rows, totals) => totals && (
        <tr>
          <td className="px-4 py-3 text-sm" colSpan={6}>Total</td>
          <td className="px-4 py-3 text-sm text-right text-emerald-700">{fmtQty(totals.total_in)}</td>
          <td className="px-4 py-3 text-sm text-right text-red-600">{fmtQty(totals.total_out)}</td>
          <td />
          <td className="px-4 py-3 text-sm text-right">{fmtNum(totals.total_amount)}</td>
        </tr>
      )}
    />
  );
}
